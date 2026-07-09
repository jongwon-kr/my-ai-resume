import { handleChatRequest } from "@/lib/chat/handle-chat-request";

export const runtime = "nodejs";

/**
 * POST /api/chat
 * Streams Gemini responses via SSE. Never exposes system prompt content.
 */
export async function POST(request: Request) {
  return handleChatRequest(request);
}
