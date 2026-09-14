import { GoogleGenAI } from "@google/genai";

import {
  RAG_EMBEDDING_DIMENSIONS,
  RAG_EMBEDDING_MODEL,
} from "@/lib/rag/constants";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return new GoogleGenAI({ apiKey });
}

async function embed(texts: string[], taskType: string) {
  if (texts.length === 0) {
    return [];
  }

  const response = await getClient().models.embedContent({
    model: RAG_EMBEDDING_MODEL,
    contents: texts,
    config: {
      taskType,
      outputDimensionality: RAG_EMBEDDING_DIMENSIONS,
    },
  });

  const embeddings = response.embeddings ?? [];
  if (embeddings.length !== texts.length) {
    throw new Error(
      `Embedding count mismatch: expected ${texts.length}, got ${embeddings.length}.`,
    );
  }

  return embeddings.map((item) => {
    const values = item.values;
    if (!values || values.length !== RAG_EMBEDDING_DIMENSIONS) {
      throw new Error("Embedding response had unexpected dimensions.");
    }
    return values;
  });
}

/** Indexed résumé content. */
export function embedDocuments(texts: string[]) {
  return embed(texts, "RETRIEVAL_DOCUMENT");
}

/**
 * A visitor question. The asymmetric task type matters — embedding a query as
 * a document measurably degrades similarity.
 */
export async function embedQuery(text: string) {
  const [vector] = await embed([text], "RETRIEVAL_QUERY");
  return vector ?? null;
}
