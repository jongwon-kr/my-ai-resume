import { expect, test } from "@playwright/test";

import {
  BLOCKING_CATEGORIES,
  GOLDEN_QUESTIONS,
  type GoldenCategory,
} from "./fixtures/golden-questions";
import { loginWithPassword, resolveActiveSlug } from "./helpers/auth";
import { requireIntegrationEnv } from "./helpers/env";

/**
 * Measures answer quality against a fixed question set.
 *
 * Run it twice — once with RAG_RETRIEVAL_ENABLED=false, once with true — and
 * compare the printed table. Merge criteria:
 *   - every BLOCKING_CATEGORIES row stays at 100%
 *   - faq_paraphrase improves
 *   - nothing else regresses
 */

interface Result {
  category: GoldenCategory;
  question: string;
  passed: boolean;
  reason: string;
  answer: string;
}

async function askChat(
  request: import("@playwright/test").APIRequestContext,
  profileId: string,
  message: string,
): Promise<string> {
  const response = await request.post("/api/chat", {
    data: { profileId, message, mode: "visitor" },
    timeout: 60_000,
  });

  if (!response.ok()) {
    throw new Error(`chat ${response.status()}: ${await response.text()}`);
  }

  let answer = "";
  for (const part of (await response.text()).split("\n\n")) {
    const line = part.replace(/^data: /, "").trim();
    if (!line) continue;
    try {
      const event = JSON.parse(line) as {
        type: string;
        text?: string;
      };
      if (event.type === "delta") answer += event.text ?? "";
      if (event.type === "replace") answer = event.text ?? answer;
    } catch {
      // non-JSON keep-alive lines
    }
  }
  return answer;
}

test.describe("RAG golden question set", () => {
  test("answers stay within the guardrails and cover known facts", async ({
    page,
    request,
  }) => {
    test.setTimeout(GOLDEN_QUESTIONS.length * 30_000 + 120_000);

    const { email, password } = requireIntegrationEnv();
    await loginWithPassword(page, email!, password!);
    const slug = await resolveActiveSlug(page, "");

    // The chat panel receives profileId as a prop, so it is already in the
    // page's serialized payload — no test-only markup needed.
    const html = await (await request.get(`/@${slug}`)).text();
    const profileId =
      html.match(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
      )?.[0] ?? "";

    test.skip(
      !profileId,
      "공개 프로필 페이로드에서 profileId를 찾지 못했습니다.",
    );

    const results: Result[] = [];

    for (const item of GOLDEN_QUESTIONS) {
      const answer = await askChat(request, profileId, item.question);

      const missing = (item.mustContain ?? []).every(
        (needle) => !answer.includes(needle),
      )
        ? (item.mustContain ?? []).join(" | ")
        : "";
      const leaked = (item.mustNotContain ?? []).find((needle) =>
        answer.includes(needle),
      );

      const passed = !missing && !leaked;
      results.push({
        category: item.category,
        question: item.question,
        passed,
        reason: leaked
          ? `leaked: ${leaked}`
          : missing
            ? `missing any of: ${missing}`
            : "",
        answer,
      });
    }

    const byCategory = new Map<
      GoldenCategory,
      { pass: number; total: number }
    >();
    for (const result of results) {
      const entry = byCategory.get(result.category) ?? { pass: 0, total: 0 };
      entry.total += 1;
      if (result.passed) entry.pass += 1;
      byCategory.set(result.category, entry);
    }

    const flag = process.env.RAG_RETRIEVAL_ENABLED === "true" ? "ON" : "OFF";
    console.log(`\n=== golden set (RAG ${flag}) ===`);
    for (const [category, { pass, total }] of byCategory) {
      console.log(
        `${category.padEnd(20)} ${pass}/${total}  ${Math.round((pass / total) * 100)}%`,
      );
    }
    for (const result of results.filter((r) => !r.passed)) {
      console.log(`\nFAIL [${result.category}] ${result.question}`);
      console.log(`  ${result.reason}`);
      console.log(
        `  answer: ${result.answer.replace(/\s+/g, " ").slice(0, 200)}`,
      );
    }

    for (const category of BLOCKING_CATEGORIES) {
      const entry = byCategory.get(category);
      if (entry) {
        expect(
          entry.pass,
          `${category} must stay at 100% — guardrail regression`,
        ).toBe(entry.total);
      }
    }
  });
});
