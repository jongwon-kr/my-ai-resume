import { createHash } from "node:crypto";
import { ApiError, GoogleGenAI } from "@google/genai";

import {
  CHAT_ERROR_MESSAGE,
  CHAT_HISTORY_TURN_LIMIT,
} from "@/lib/chat/constants";
import { executeGeminiStream } from "@/lib/chat/gemini-stream";
import {
  buildOwnerFaqInjection,
  matchOwnerFaq,
} from "@/lib/chat/match-owner-faq";
import { assertChatRateLimit, RateLimitError } from "@/lib/chat/rate-limit";
import { getClientIp } from "@/lib/chat/request";
import {
  applySensitiveContentFilter,
  shouldOfferInquiryFallback,
} from "@/lib/chat/sensitive-filter";
import {
  getExampleOwnerFaqs,
  getExampleSystemInstruction,
  isExampleProfileId,
} from "@/lib/example/demo-profile";
import {
  buildMockInterviewPrompt,
  buildPreviewChatPrompt,
  type MockInterviewStyle,
} from "@/lib/prompt/build-mock-interview-prompt";
import { buildSystemPrompt } from "@/lib/prompt/build-system-prompt";
import { fetchPromptInput } from "@/lib/prompt/generate-system-prompt";
import { isSectionEnabled } from "@/lib/resume/enabled-sections";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type ChatMode = "visitor" | "mock_interview" | "preview";

interface ChatRequestBody {
  profileId: string;
  sessionId?: string;
  message: string;
  mode?: ChatMode;
  interviewStyle?: MockInterviewStyle;
  model?: string;
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

async function ensureProfileOwner(profileId: string, userId: string) {
  if (profileId !== userId) {
    throw new Error("Forbidden.");
  }
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

async function buildDraftSystemPrompt(profileId: string) {
  const supabase = createAdminClient();
  const input = await fetchPromptInput(supabase, profileId);
  return buildSystemPrompt(input);
}

async function resolveSystemInstruction(
  profileId: string,
  message: string,
  mode: ChatMode,
  interviewStyle: MockInterviewStyle,
) {
  if (isExampleProfileId(profileId) && mode === "visitor") {
    let instruction = getExampleSystemInstruction();
    const match = matchOwnerFaq(message, getExampleOwnerFaqs());
    if (match) {
      instruction += `\n\n${buildOwnerFaqInjection(match)}`;
    }
    return instruction;
  }

  const supabase = createAdminClient();

  if (mode === "mock_interview") {
    const base =
      (await getLatestSystemPrompt(profileId).catch(() => null)) ??
      (await buildDraftSystemPrompt(profileId));
    return buildMockInterviewPrompt(base, interviewStyle);
  }

  if (mode === "preview") {
    const base = await buildDraftSystemPrompt(profileId);
    return buildPreviewChatPrompt(base);
  }

  const [systemInstruction, profileResult, faqResult] = await Promise.all([
    getLatestSystemPrompt(profileId),
    supabase
      .from("profiles")
      .select("enabled_sections")
      .eq("id", profileId)
      .single(),
    supabase
      .from("owner_faqs")
      .select("question, answer, match_mode, sort_order")
      .eq("profile_id", profileId)
      .order("sort_order"),
  ]);

  let instruction = systemInstruction;
  const enabledSections = (profileResult.data?.enabled_sections ??
    []) as string[];

  if (isSectionEnabled(enabledSections, "owner_faqs")) {
    const match = matchOwnerFaq(message, faqResult.data ?? []);
    if (match) {
      instruction += `\n\n${buildOwnerFaqInjection(match)}`;
    }
  }

  return instruction;
}

async function resolveSession(
  profileId: string,
  sessionId: string | undefined,
  ip: string,
  sessionType: ChatMode,
) {
  if (isExampleProfileId(profileId)) {
    return sessionId ?? crypto.randomUUID();
  }

  const supabase = createAdminClient();

  if (sessionId) {
    const { data } = await supabase
      .from("chat_sessions")
      .select("id, profile_id, session_type")
      .eq("id", sessionId)
      .maybeSingle();

    if (data?.profile_id === profileId && data.session_type === sessionType) {
      return data.id;
    }
  }

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      profile_id: profileId,
      visitor_hash: sessionType === "visitor" ? hashVisitor(ip) : null,
      session_type: sessionType,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Failed to create chat session.");
  }

  return data.id;
}

async function getRecentHistory(sessionId: string, profileId: string) {
  if (isExampleProfileId(profileId)) {
    return [];
  }

  const supabase = createAdminClient();
  const limit = CHAT_HISTORY_TURN_LIMIT * 2;

  const { data, error } = await supabase
    .from("chat_messages")
    .select("role, content, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  const messages = data ?? [];

  messages.sort((a, b) => {
    const timeA = new Date(a.created_at).getTime();
    const timeB = new Date(b.created_at).getTime();
    if (timeA === timeB) {
      if (a.role === "user" && b.role === "assistant") return -1;
      if (a.role === "assistant" && b.role === "user") return 1;
      return 0;
    }
    return timeA - timeB;
  });

  const cleanedHistory: Array<{ role: string; content: string }> = [];
  for (const msg of messages) {
    if (cleanedHistory.length === 0) {
      if (msg.role === "user") cleanedHistory.push(msg);
    } else {
      const lastRole = cleanedHistory[cleanedHistory.length - 1].role;
      if (lastRole !== msg.role) {
        cleanedHistory.push(msg);
      }
    }
  }

  return cleanedHistory;
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

async function generateFollowUpQuestions(
  ai: GoogleGenAI,
  systemInstruction: string,
  assistantText: string,
  usedModel: string,
): Promise<string[]> {
  const prompt = `아래는 지원자의 AI 클론이 방금 한 답변입니다.\n\n"""${assistantText}"""\n\n채용 면접관 입장에서 이 답변에 자연스럽게 이어서 물어볼 후속 질문 3개를 만들어 주세요. 반드시 위 이력서 정보로 답변할 수 있는 주제여야 하며, 서로 다른 관점이어야 합니다. 각 질문은 한국어 존댓말로 30자 이내. 다른 설명 없이 질문 문자열 JSON 배열로만 출력하세요. 예: ["질문1","질문2","질문3"]`;

  const response = await ai.models.generateContent({
    model: usedModel,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
    },
  });

  const raw = (response.text ?? "").trim();
  if (!raw) {
    return [];
  }

  // 백틱 파싱 오류를 방지하기 위해 이스케이프 처리
  const cleaned = raw
    .replace(/^\`\`\`(?:json)?/i, "")
    .replace(/\`\`\`$/, "")
    .trim();
  const parsed: unknown = JSON.parse(cleaned);

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .filter(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0,
    )
    .map((item) => item.trim())
    .slice(0, 4);
}

function shouldSkipSuggestions(mode: ChatMode) {
  return mode === "mock_interview";
}

export async function handleChatRequest(request: Request) {
  const body = (await request
    .json()
    .catch(() => null)) as ChatRequestBody | null;

  if (!body?.profileId || !body.message?.trim()) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const ip = getClientIp(request);
  const message = body.message.trim();
  const mode: ChatMode = body.mode ?? "visitor";
  const interviewStyle: MockInterviewStyle = body.interviewStyle ?? "general";
  const requestedModel = body.model ?? "auto";

  try {
    if (mode === "visitor") {
      await assertChatRateLimit(body.profileId, ip);
      if (!isExampleProfileId(body.profileId)) {
        await ensurePublishedProfile(body.profileId);
      }
    } else {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      await ensureProfileOwner(body.profileId, user.id);
    }
  } catch (error) {
    if (error instanceof RateLimitError) {
      return Response.json({ error: "Too many requests." }, { status: 429 });
    }
    return Response.json(
      { error: error instanceof Error ? error.message : CHAT_ERROR_MESSAGE },
      { status: mode === "visitor" ? 400 : 403 },
    );
  }

  let sessionId: string;
  let systemInstruction: string;
  let history: Array<{ role: string; content: string }>;

  try {
    sessionId = await resolveSession(body.profileId, body.sessionId, ip, mode);
    [systemInstruction, history] = await Promise.all([
      resolveSystemInstruction(body.profileId, message, mode, interviewStyle),
      getRecentHistory(sessionId, body.profileId),
    ]);
  } catch (error) {
    console.error("[chat] setup failed", error);
    return Response.json({ error: CHAT_ERROR_MESSAGE }, { status: 500 });
  }

  const encoder = new TextEncoder();
  const ai = getGeminiClient();
  const contents = toGeminiContents(history, message);
  const signal = request.signal;

  const stream = new ReadableStream({
    async start(controller) {
      // 세션 정보 전송
      controller.enqueue(encoder.encode(encodeSse({ type: "session", sessionId })));

      try {
        const { stream: geminiStream, usedModel } = await executeGeminiStream({ ai, contents, systemInstruction, requestedModel });
        
        controller.enqueue(encoder.encode(encodeSse({ type: "model_used", model: usedModel })));

        let assistantText = "";

        for await (const chunk of geminiStream) {
          if (signal.aborted) {
            console.log("[chat] Client disconnected. Aborting.");
            break;
          }

          const delta = chunk.text ?? "";
          if (!delta) continue;

          assistantText += delta;
          controller.enqueue(encoder.encode(encodeSse({ type: "delta", text: delta })));
        }
        if (signal.aborted) return;
        

        if (mode === "visitor") {
          const filtered = applySensitiveContentFilter(assistantText);
          if (filtered !== assistantText) {
            assistantText = filtered;
            controller.enqueue(
              encoder.encode(encodeSse({ type: "replace", text: filtered })),
            );
          }

          if (
            shouldOfferInquiryFallback(assistantText) &&
            !isExampleProfileId(body.profileId)
          ) {
            controller.enqueue(
              encoder.encode(encodeSse({ type: "inquiry_offer" })),
            );
          }
        }

        if (!isExampleProfileId(body.profileId)) {
          const supabase = createAdminClient();
          await supabase.from("chat_messages").insert([
            { session_id: sessionId, role: "user", content: message },
            {
              session_id: sessionId,
              role: "assistant",
              content: assistantText,
            },
          ]);
        }

        if (mode === "visitor" && !shouldSkipSuggestions(mode)) {
          try {
            const suggestions = await generateFollowUpQuestions(
              ai,
              systemInstruction,
              assistantText,
              usedModel,
            );
            if (suggestions.length > 0) {
              controller.enqueue(
                encoder.encode(
                  encodeSse({ type: "suggestions", questions: suggestions }),
                ),
              );
            }
          } catch (suggestionError) {
            console.error(
              "[chat] follow-up suggestions failed",
              suggestionError,
            );
          }
        }

        controller.enqueue(encoder.encode(encodeSse({ type: "done" })));
      } catch (error) {
        console.error("[chat] stream handling failed", error);
        controller.enqueue(
          encoder.encode(
            encodeSse({
              type: "error",
              message:
                error instanceof Error ? error.message : CHAT_ERROR_MESSAGE,
            }),
          ),
        );
      } finally {
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
