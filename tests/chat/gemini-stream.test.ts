import { ApiError, type GoogleGenAI } from "@google/genai";
import { describe, expect, it } from "vitest";

import {
  AllModelsExhaustedError,
  isFallbackableError,
  streamChatCompletion,
} from "@/lib/chat/gemini-stream";

function apiError(status: number) {
  return new ApiError({ message: `status ${status}`, status });
}

type Attempt =
  | { type: "stream"; chunks: string[] }
  | { type: "reject"; status: number }
  | { type: "throwMid"; chunks: string[]; status: number };

function makeAi(attemptsByModel: Record<string, Attempt>) {
  const attempted: string[] = [];

  const ai = {
    models: {
      generateContentStream: async ({ model }: { model: string }) => {
        attempted.push(model);
        const attempt = attemptsByModel[model];

        if (!attempt) {
          throw apiError(404);
        }

        if (attempt.type === "reject") {
          throw apiError(attempt.status);
        }

        if (attempt.type === "stream") {
          return (async function* () {
            for (const chunk of attempt.chunks) {
              yield { text: chunk };
            }
          })();
        }

        return (async function* () {
          for (const chunk of attempt.chunks) {
            yield { text: chunk };
          }
          throw apiError(attempt.status);
        })();
      },
    },
  } as unknown as GoogleGenAI;

  return { ai, attempted };
}

const baseArgs = {
  contents: [{ role: "user" as const, parts: [{ text: "hi" }] }],
  systemInstruction: "sys",
};

describe("isFallbackableError", () => {
  it("is true for quota (429) and unavailable (404) errors", () => {
    expect(isFallbackableError(apiError(429))).toBe(true);
    expect(isFallbackableError(apiError(404))).toBe(true);
  });

  it("is false for other API errors and generic errors", () => {
    expect(isFallbackableError(apiError(500))).toBe(false);
    expect(isFallbackableError(new Error("boom"))).toBe(false);
    expect(isFallbackableError(undefined)).toBe(false);
  });
});

describe("streamChatCompletion", () => {
  it("uses the first model when it succeeds", async () => {
    const deltas: string[] = [];
    const { ai, attempted } = makeAi({
      "gemini-3-flash-preview": { type: "stream", chunks: ["안", "녕"] },
    });

    const result = await streamChatCompletion({
      ai,
      models: [
        "gemini-3-flash-preview",
        "gemini-3.5-flash",
        "gemini-2.5-flash",
      ],
      ...baseArgs,
      onDelta: (delta) => deltas.push(delta),
    });

    expect(result.model).toBe("gemini-3-flash-preview");
    expect(result.text).toBe("안녕");
    expect(deltas).toEqual(["안", "녕"]);
    expect(attempted).toEqual(["gemini-3-flash-preview"]);
  });

  it("falls back to the next model on a quota (429) error", async () => {
    const deltas: string[] = [];
    const { ai, attempted } = makeAi({
      "gemini-3-flash-preview": { type: "reject", status: 429 },
      "gemini-3.5-flash": { type: "stream", chunks: ["ok"] },
    });

    const result = await streamChatCompletion({
      ai,
      models: [
        "gemini-3-flash-preview",
        "gemini-3.5-flash",
        "gemini-2.5-flash",
      ],
      ...baseArgs,
      onDelta: (delta) => deltas.push(delta),
    });

    expect(result.model).toBe("gemini-3.5-flash");
    expect(result.text).toBe("ok");
    expect(deltas).toEqual(["ok"]);
    expect(attempted).toEqual(["gemini-3-flash-preview", "gemini-3.5-flash"]);
  });

  it("falls back through multiple exhausted models until one works", async () => {
    const { ai, attempted } = makeAi({
      "gemini-3-flash-preview": { type: "reject", status: 429 },
      "gemini-3.5-flash": { type: "reject", status: 404 },
      "gemini-2.5-flash": { type: "stream", chunks: ["final"] },
    });

    const result = await streamChatCompletion({
      ai,
      models: [
        "gemini-3-flash-preview",
        "gemini-3.5-flash",
        "gemini-2.5-flash",
      ],
      ...baseArgs,
      onDelta: () => {},
    });

    expect(result.model).toBe("gemini-2.5-flash");
    expect(attempted).toEqual([
      "gemini-3-flash-preview",
      "gemini-3.5-flash",
      "gemini-2.5-flash",
    ]);
  });

  it("throws AllModelsExhaustedError when every model is exhausted", async () => {
    const { ai, attempted } = makeAi({
      "gemini-3-flash-preview": { type: "reject", status: 429 },
      "gemini-3.5-flash": { type: "reject", status: 429 },
      "gemini-2.5-flash": { type: "reject", status: 429 },
    });

    await expect(
      streamChatCompletion({
        ai,
        models: [
          "gemini-3-flash-preview",
          "gemini-3.5-flash",
          "gemini-2.5-flash",
        ],
        ...baseArgs,
        onDelta: () => {},
      }),
    ).rejects.toBeInstanceOf(AllModelsExhaustedError);

    expect(attempted).toHaveLength(3);
  });

  it("does not fall back on non-recoverable errors", async () => {
    const { ai, attempted } = makeAi({
      "gemini-3-flash-preview": { type: "reject", status: 500 },
      "gemini-3.5-flash": { type: "stream", chunks: ["never"] },
    });

    await expect(
      streamChatCompletion({
        ai,
        models: ["gemini-3-flash-preview", "gemini-3.5-flash"],
        ...baseArgs,
        onDelta: () => {},
      }),
    ).rejects.toBeInstanceOf(ApiError);

    expect(attempted).toEqual(["gemini-3-flash-preview"]);
  });

  it("does not fall back once text has already been emitted", async () => {
    const deltas: string[] = [];
    const { ai, attempted } = makeAi({
      "gemini-3-flash-preview": {
        type: "throwMid",
        chunks: ["partial"],
        status: 429,
      },
      "gemini-3.5-flash": { type: "stream", chunks: ["never"] },
    });

    await expect(
      streamChatCompletion({
        ai,
        models: ["gemini-3-flash-preview", "gemini-3.5-flash"],
        ...baseArgs,
        onDelta: (delta) => deltas.push(delta),
      }),
    ).rejects.toBeInstanceOf(ApiError);

    expect(deltas).toEqual(["partial"]);
    expect(attempted).toEqual(["gemini-3-flash-preview"]);
  });
});
