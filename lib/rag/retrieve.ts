import { RAG_FOCUS_TOP_K, RAG_RETRIEVAL_ENABLED } from "@/lib/rag/constants";
import { embedQuery } from "@/lib/rag/embed";
import type { ScoredChunk } from "@/lib/rag/select-injection";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Top-k chunks for a visitor question.
 *
 * Returns [] on any failure — the caller then behaves exactly as it did before
 * retrieval existed, so chat never breaks because of the embedding API.
 */
export async function retrieveChunks(
  profileId: string,
  message: string,
  matchCount = RAG_FOCUS_TOP_K * 2,
): Promise<ScoredChunk[]> {
  if (!RAG_RETRIEVAL_ENABLED) {
    return [];
  }

  try {
    const vector = await embedQuery(message);
    if (!vector) {
      return [];
    }

    const { data, error } = await createAdminClient().rpc(
      "match_profile_chunks",
      {
        p_profile_id: profileId,
        p_query: JSON.stringify(vector),
        p_match_count: matchCount,
      },
    );

    if (error) {
      console.error("[rag] match_profile_chunks failed", error.message);
      return [];
    }

    return (data ?? []) as ScoredChunk[];
  } catch (error) {
    console.error("[rag] retrieval failed", error);
    return [];
  }
}
