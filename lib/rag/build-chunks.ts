import {
  isPromptSectionEnabled,
  type SystemPromptInput,
} from "@/lib/prompt/build-system-prompt";

export interface ProfileChunk {
  section_key: string;
  ordinal: number;
  title: string;
  content: string;
}

/** Above this, a single item is split so one chunk stays focused. */
const MAX_CHUNK_CHARS = 1200;

function bySortOrder<T extends { sort_order: number }>(items: T[]) {
  return [...items].sort((a, b) => a.sort_order - b.sort_order);
}

function clean(value: string | null | undefined) {
  return value?.trim() ?? "";
}

/**
 * Splits long text on paragraph boundaries, repeating `heading` on every piece
 * so a retrieved fragment still says which item it belongs to.
 */
function splitWithHeading(heading: string, body: string): string[] {
  const full = `${heading}\n${body}`;
  if (full.length <= MAX_CHUNK_CHARS) {
    return [full];
  }

  const paragraphs = body.split(/\n{2,}/).filter((p) => p.trim());
  const pieces: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if (current && (current + "\n\n" + paragraph).length > MAX_CHUNK_CHARS) {
      pieces.push(current);
      current = paragraph;
    } else {
      current = current ? `${current}\n\n${paragraph}` : paragraph;
    }
  }
  if (current) {
    pieces.push(current);
  }

  if (pieces.length <= 1) {
    return [full];
  }

  return pieces.map(
    (piece, i) => `${heading} (${i + 1}/${pieces.length})\n${piece}`,
  );
}

/**
 * Turns the already-fetched prompt input into retrievable chunks.
 *
 * Takes SystemPromptInput directly so indexing reuses the publish-time query
 * results instead of re-reading ten tables.
 */
export function buildProfileChunks(input: SystemPromptInput): ProfileChunk[] {
  const chunks: ProfileChunk[] = [];
  const enabled = (key: string) =>
    isPromptSectionEnabled(input.enabledSections, key);

  const push = (section_key: string, title: string, content: string) => {
    chunks.push({
      section_key,
      ordinal: chunks.filter((c) => c.section_key === section_key).length,
      title,
      content,
    });
  };

  // Basic info and contact are never indexed: they are always in the base
  // prompt, so retrieving them would only waste a top-k slot.

  if (enabled("careers")) {
    for (const career of bySortOrder(input.careers)) {
      const heading = `경력 — ${career.company}${
        clean(career.position) ? ` / ${clean(career.position)}` : ""
      }${clean(career.period) ? ` (${clean(career.period)})` : ""}`;
      push(
        "career",
        heading,
        `${heading}\n${clean(career.description)}`.trim(),
      );
    }
  }

  if (enabled("education")) {
    const lines = bySortOrder(input.education).map((item) =>
      [
        item.school,
        clean(item.major),
        clean(item.degree),
        clean(item.status),
        clean(item.period),
      ]
        .filter(Boolean)
        .join(" · "),
    );
    if (lines.length > 0) {
      push("education", "학력", `학력\n${lines.join("\n")}`);
    }
  }

  if (enabled("certifications")) {
    const lines = bySortOrder(input.certifications).map((item) =>
      [
        clean(item.category),
        item.name,
        clean(item.issuer),
        clean(item.acquired_date),
      ]
        .filter(Boolean)
        .join(" · "),
    );
    if (lines.length > 0) {
      push(
        "certifications",
        "자격 · 어학 · 수상",
        `자격 · 어학 · 수상\n${lines.join("\n")}`,
      );
    }
  }

  if (enabled("activities")) {
    for (const item of bySortOrder(input.activities)) {
      const heading = `경험/활동 — ${item.title}${
        clean(item.organization) ? ` / ${clean(item.organization)}` : ""
      }${clean(item.period) ? ` (${clean(item.period)})` : ""}`;
      push(
        "activity",
        heading,
        `${heading}\n${clean(item.description)}`.trim(),
      );
    }
  }

  const skillLine = input.skills
    .map((s) =>
      clean(s.proficiency) ? `${s.name}(${clean(s.proficiency)})` : s.name,
    )
    .join(", ");
  if (skillLine) {
    push("skills", "기술 스택", `기술 스택\n${skillLine}`);
  }

  for (const project of bySortOrder(input.projects)) {
    const heading = `프로젝트 — ${project.title}${
      clean(project.period) ? ` (${clean(project.period)})` : ""
    }`;
    const body = [
      clean(project.role) && `역할: ${clean(project.role)}`,
      clean(project.tech_stack) && `사용 기술: ${clean(project.tech_stack)}`,
      clean(project.situation) && `상황/과제: ${clean(project.situation)}`,
      clean(project.actions) && `수행 내용: ${clean(project.actions)}`,
      clean(project.results) && `성과: ${clean(project.results)}`,
      clean(project.troubleshooting) &&
        `트러블슈팅: ${clean(project.troubleshooting)}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    for (const piece of splitWithHeading(heading, body)) {
      push("project", heading, piece);
    }
  }

  if (enabled("portfolio_items")) {
    for (const item of bySortOrder(input.portfolioItems)) {
      const heading = `포트폴리오 — ${item.title}`;
      push(
        "portfolio",
        heading,
        `${heading}\n${clean(item.description)}`.trim(),
      );
    }
  }

  if (enabled("cover_letters")) {
    for (const letter of bySortOrder(input.coverLetters)) {
      const heading = `자기소개서 — ${letter.title}`;
      for (const piece of splitWithHeading(heading, clean(letter.content))) {
        push("cover_letter", heading, piece);
      }
    }
  }

  if (enabled("owner_faqs")) {
    for (const faq of bySortOrder(input.ownerFaqs)) {
      push(
        "faq",
        `예상 질문 — ${faq.question}`,
        `Q: ${faq.question}\nA: ${faq.answer}`,
      );
    }
  }

  return chunks;
}
