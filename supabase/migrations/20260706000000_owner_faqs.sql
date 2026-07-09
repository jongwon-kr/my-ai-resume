-- Owner-authored FAQ: pre-written answers to anticipated interview questions.
-- Used only to build the AI system prompt (never shown on the public page),
-- so RLS grants owner-only access with no public read.

CREATE TABLE public.owner_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE INDEX owner_faqs_profile_id_idx ON public.owner_faqs (profile_id);

ALTER TABLE public.owner_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_faqs_select_own"
  ON public.owner_faqs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = owner_faqs.profile_id
        AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "owner_faqs_insert_own"
  ON public.owner_faqs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = owner_faqs.profile_id
        AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "owner_faqs_update_own"
  ON public.owner_faqs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = owner_faqs.profile_id
        AND profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = owner_faqs.profile_id
        AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "owner_faqs_delete_own"
  ON public.owner_faqs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = owner_faqs.profile_id
        AND profiles.id = auth.uid()
    )
  );
