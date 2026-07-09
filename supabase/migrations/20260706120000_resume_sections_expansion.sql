-- Certification category + activities table for expanded resume sections.

ALTER TABLE public.certifications
  ADD COLUMN category text NOT NULL DEFAULT '자격';

CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title text NOT NULL,
  organization text,
  period text,
  description text,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE INDEX activities_profile_id_idx ON public.activities (profile_id);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities_select_public"
  ON public.activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = activities.profile_id
        AND profiles.status = 'published'
        AND profiles.is_private = false
    )
  );

CREATE POLICY "activities_select_own"
  ON public.activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = activities.profile_id
        AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "activities_insert_own"
  ON public.activities
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = activities.profile_id
        AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "activities_update_own"
  ON public.activities
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = activities.profile_id
        AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "activities_delete_own"
  ON public.activities
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = activities.profile_id
        AND profiles.id = auth.uid()
    )
  );
