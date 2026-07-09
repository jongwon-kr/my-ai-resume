import { createHash } from "node:crypto";

import { GoogleGenAI } from "@google/genai";

import { ApiError } from "@google/genai";

import {
  CHAT_ERROR_MESSAGE,
  CHAT_HISTORY_TURN_LIMIT,
  CHAT_QUOTA_ERROR_MESSAGE,
  GEMINI_MODEL,
} from "@/lib/chat/constants";
import { assertChatRateLimit, RateLimitError } from "@/lib/chat/rate-limit";
import { getClientIp } from "@/lib/chat/request";
import { applySensitiveContentFilter } from "@/lib/chat/sensitive-filter";
import { createAdminClient } from "@/lib/supabase/admin";

interface ChatRequestBody {
  profileId: string;
  sessionId?: string;
  message: string;
}

interface GeminiContent {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

function hashVisitor(ip: string) {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  return new GoogleGenAI({ apiKey });
}

async function ensurePublishedProfile(profileId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, status, is_private")
    .eq("id", profileId)
    .single();

  if (error || !data) {
    throw new Error("Profile not found.");
  }

  if (data.is_private || data.status !== "published") {
    throw new Error("Profile is not public.");
  }

  return data;
}

async function getLatestSystemPrompt(profileId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("system_prompts")
    .select("content")
    .eq("profile_id", profileId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data?.content) {
    throw new Error("System prompt not found.");
  }

  return data.content;
}

async function resolveSession(profileId: string, sessionId: string | undefined, ip: string) {
  const supabase = createAdminClient();

  if (sessionId) {
    const { data } = await supabase
      .from("chat_sessions")
      .select("id, profile_id")
      .eq("id", sessionId)
      .maybeSingle();

    if (data?.profile_id === profileId) {
      return data.id;
    }
  }

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      profile_id: profileId,
      visitor_hash: hashVisitor(ip),
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Failed to create chat session.");
  }

  return data.id;
}

async function getRecentHistory(sessionId: string) {
  const supabase = createAdminClient();
  const limit = CHAT_HISTORY_TURN_LIMIT * 2;

  const { data, error } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).reverse();
}

function toGeminiContents(
  history: Array<{ role: string; content: string }>,
  message: string,
): GeminiContent[] {
  const contents: GeminiContent[] = history.map((item) => ({
    role: item.role === "assistant" ? "model" : "user",
    parts: [{ text: item.content }],
  }));

  contents.push({
    role: "user",
    parts: [{ text: message }],
  });

  return contents;
}

function encodeSse(payload: unknown) {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

function getStreamErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 429) {
    return CHAT_QUOTA_ERROR_MESSAGE;
  }

  return CHAT_ERROR_MESSAGE;
}

export async function handleChatRequest(request: Request) {
  const body = (await request.json().catch(() => null)) as ChatRequestBody | null;

  if (!body?.profileId || !body.message?.trim()) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const ip = getClientIp(request);
  const message = body.message.trim();

  try {
    await assertChatRateLimit(body.profileId, ip);
    await ensurePublishedProfile(body.profileId);
  } catch (error) {
    if (error instanceof RateLimitError) {
      return Response.json({ error: "Too many requests." }, { status: 429 });
    }

    return Response.json(
      { error: error instanceof Error ? error.message : CHAT_ERROR_MESSAGE },
      { status: 400 },
    );
  }

  let sessionId: string;
  let systemInstruction: string;
  let history: Array<{ role: string; content: string }>;

  try {
    sessionId = await resolveSession(body.profileId, body.sessionId, ip);
    [systemInstruction, history] = await Promise.all([
      getLatestSystemPrompt(body.profileId),
      getRecentHistory(sessionId),
    ]);
  } catch (error) {
    console.error("[chat] setup failed", error);
    return Response.json({ error: CHAT_ERROR_MESSAGE }, { status: 500 });
  }

  const encoder = new TextEncoder();
  const ai = getGeminiClient();
  const contents = toGeminiContents(history, message);

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(encodeSse({ type: "session", sessionId })),
      );

      let assistantText = "";

      try {
        const geminiStream = await ai.models.generateContentStream({
          model: GEMINI_MODEL,
          contents,
          config: {
            systemInstruction,
          },
        });

        for await (const chunk of geminiStream) {
          const delta = chunk.text ?? "";
          if (!delta) {
            continue;
          }

          assistantText += delta;
          controller.enqueue(
            encoder.encode(encodeSse({ type: "delta", text: delta })),
          );
        }

        const filtered = applySensitiveContentFilter(assistantText);
        if (filtered !== assistantText) {
          assistantText = filtered;
          controller.enqueue(
            encoder.encode(
              encodeSse({ type: "replace", text: filtered }),
            ),
          );
        }

        const supabase = createAdminClient();
        await supabase.from("chat_messages").insert([
          { session_id: sessionId, role: "user", content: message },
          { session_id: sessionId, role: "assistant", content: assistantText },
        ]);

        controller.enqueue(encoder.encode(encodeSse({ type: "done" })));
        controller.close();
      } catch (error) {
        console.error("[chat] gemini stream failed", error);
        controller.enqueue(
          encoder.encode(
            encodeSse({
              type: "error",
              message: getStreamErrorMessage(error),
            }),
          ),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
