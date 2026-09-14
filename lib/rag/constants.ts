/** Embedding model + dimension. 768 keeps rows small and stays under
 *  pgvector's 2000-dim index ceiling, at ~1% retrieval quality vs 3072. */
export const RAG_EMBEDDING_MODEL =
  process.env.RAG_EMBEDDING_MODEL?.trim() || "gemini-embedding-001";
export const RAG_EMBEDDING_DIMENSIONS = 768;

/** Abuse bound on how many chunks one profile may index. */
export const RAG_MAX_CHUNKS = 200;

/** Retrieval is behind a flag; indexing always runs so the corpus is warm. */
export const RAG_RETRIEVAL_ENABLED =
  process.env.RAG_RETRIEVAL_ENABLED === "true";

export const RAG_FOCUS_TOP_K = 4;

/**
 * Below this cosine similarity a chunk is noise, not context.
 *
 * Measured on one real profile (13 questions): on-topic questions scored
 * 0.645-0.750, off-topic ones 0.568-0.638. The bands nearly touch, so this is
 * a thin margin on a small sample — override per environment if it misfires.
 * Being wrong is cheap either way: the focus block only re-surfaces content
 * that is already in the prompt.
 */
export const RAG_FOCUS_THRESHOLD = Number(
  process.env.RAG_FOCUS_THRESHOLD ?? 0.64,
);

/**
 * Korean paraphrases of a registered question measured 0.788-0.803, while
 * unrelated questions stayed at 0.602-0.618 — a comfortable gap around 0.72.
 */
export const FAQ_SEMANTIC_THRESHOLD = Number(
  process.env.FAQ_SEMANTIC_THRESHOLD ?? 0.72,
);
