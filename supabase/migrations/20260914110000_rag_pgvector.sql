-- Retrieval index for the résumé chatbot.
--
-- Chunks are keyed by (profile_id, section_key, ordinal) and never reference
-- child-row ids: saveResumeDraft() deletes and re-inserts every child row on
-- each autosave, so those ids are not stable.

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.profile_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  section_key text NOT NULL,
  ordinal integer NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  content_hash text NOT NULL,
  -- Nullable on purpose: a failed embedding call must not lose the chunk row.
  embedding extensions.vector(768),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, section_key, ordinal)
);

CREATE INDEX IF NOT EXISTS profile_chunks_profile_id_idx
  ON public.profile_chunks (profile_id);

-- No ANN index (ivfflat/hnsw) on purpose: every query pre-filters by
-- profile_id, leaving ~20-40 rows, where an exact scan is faster than an
-- approximate one and loses no recall. Revisit only if a single profile ever
-- exceeds ~1000 chunks.

ALTER TABLE public.profile_chunks ENABLE ROW LEVEL SECURITY;

-- Owner-only. Visitors never read chunks directly; retrieval goes through the
-- service-role RPC below, mirroring how system_prompts content is kept server-side.
CREATE POLICY "profile_chunks_select_own" ON public.profile_chunks
  FOR SELECT USING (public.profile_owned_by_user(profile_id));
CREATE POLICY "profile_chunks_insert_own" ON public.profile_chunks
  FOR INSERT WITH CHECK (public.profile_owned_by_user(profile_id));
CREATE POLICY "profile_chunks_delete_own" ON public.profile_chunks
  FOR DELETE USING (public.profile_owned_by_user(profile_id));
-- No UPDATE policy: indexing always deletes then re-inserts.

CREATE OR REPLACE FUNCTION public.match_profile_chunks(
  p_profile_id uuid,
  p_query extensions.vector(768),
  p_match_count integer DEFAULT 6
)
RETURNS TABLE (
  section_key text,
  title text,
  content text,
  similarity real
)
LANGUAGE sql
STABLE
SET search_path = public, extensions
AS $$
  SELECT
    c.section_key,
    c.title,
    c.content,
    (1 - (c.embedding OPERATOR(extensions.<=>) p_query))::real
  FROM public.profile_chunks c
  WHERE c.profile_id = p_profile_id
    AND c.embedding IS NOT NULL
  ORDER BY c.embedding OPERATOR(extensions.<=>) p_query
  LIMIT p_match_count;
$$;

-- Service role only, same as increment_profile_view (20260715100000).
REVOKE ALL ON FUNCTION public.match_profile_chunks(uuid, extensions.vector, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.match_profile_chunks(uuid, extensions.vector, integer) FROM anon;
REVOKE ALL ON FUNCTION public.match_profile_chunks(uuid, extensions.vector, integer) FROM authenticated;
