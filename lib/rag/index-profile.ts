import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { SystemPromptInput } from "@/lib/prompt/build-system-prompt";
import { buildProfileChunks } from "@/lib/rag/build-chunks";
import { RAG_MAX_CHUNKS } from "@/lib/rag/constants";
import { embedDocuments } from "@/lib/rag/embed";
import type { Database } from "@/types/database";

function hashContent(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

/**
 * Rebuilds a profile's retrieval index from the data already fetched for the
 * system prompt.
 *
 * Runs only on publish, never on autosave, so embedding cost stays bounded and
 * saveResumeDraft() is untouched. Chunks whose content_hash is unchanged reuse
 * their stored vector, so re-publishing after a one-line edit re-embeds one chunk.
 */
export async function indexProfileChunks(
  supabase: SupabaseClient<Database>,
  profileId: string,
  input: SystemPromptInput,
): Promise<{ indexed: number; reused: number }> {
  const chunks = buildProfileChunks(input).slice(0, RAG_MAX_CHUNKS);

  if (chunks.length === 0) {
    await supabase.from("profile_chunks").delete().eq("profile_id", profileId);
    return { indexed: 0, reused: 0 };
  }

  const { data: existing, error: readError } = await supabase
    .from("profile_chunks")
    .select("section_key, ordinal, content_hash, embedding")
    .eq("profile_id", profileId);

  if (readError) {
    throw new Error(readError.message);
  }

  const reusable = new Map<string, string>();
  for (const row of existing ?? []) {
    if (row.embedding) {
      reusable.set(
        `${row.section_key}:${row.ordinal}:${row.content_hash}`,
        row.embedding as unknown as string,
      );
    }
  }

  const prepared = chunks.map((chunk) => {
    const content_hash = hashContent(chunk.content);
    return {
      ...chunk,
      content_hash,
      embedding:
        reusable.get(`${chunk.section_key}:${chunk.ordinal}:${content_hash}`) ??
        null,
    };
  });

  const stale = prepared.filter((chunk) => chunk.embedding === null);

  if (stale.length > 0) {
    // One batched call for every chunk that actually changed.
    const vectors = await embedDocuments(stale.map((chunk) => chunk.content));
    stale.forEach((chunk, i) => {
      chunk.embedding = JSON.stringify(vectors[i]);
    });
  }

  // Delete only after embedding succeeded, so a failed call leaves the previous
  // index intact rather than emptying it.
  const { error: deleteError } = await supabase
    .from("profile_chunks")
    .delete()
    .eq("profile_id", profileId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  const { error: insertError } = await supabase.from("profile_chunks").insert(
    prepared.map((chunk) => ({
      profile_id: profileId,
      section_key: chunk.section_key,
      ordinal: chunk.ordinal,
      title: chunk.title,
      content: chunk.content,
      content_hash: chunk.content_hash,
      embedding: chunk.embedding,
    })),
  );

  if (insertError) {
    throw new Error(insertError.message);
  }

  return {
    indexed: stale.length,
    reused: prepared.length - stale.length,
  };
}
