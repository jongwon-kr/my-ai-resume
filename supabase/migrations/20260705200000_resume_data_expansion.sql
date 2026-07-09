-- Expand resume data model: profile contact columns + careers / education /
-- certifications / cover_letters tables so the AI chatbot can ground answers
-- on richer resume data.

-- ---------------------------------------------------------------------------
-- profiles: contact / bio columns (age is NOT stored; derive from birth_year)
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles
  ADD COLUMN birth_year integer,
  ADD COLUMN phone text,
  ADD COLUMN public_email text,
  ADD COLUMN location text,
  ADD COLUMN github_url text,
  ADD COLUMN linkedin_url text,
  ADD COLUMN blog_url text;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE public.careers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  company text NOT NULL,
  position text,
  period text,
  description text,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE public.education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  school text NOT NULL,
  major text,
  degree text,
  status text,
  period text,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE public.certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  name text NOT NULL,
  issuer text,
  acquired_date text,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE public.cover_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  sort_order integer NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX careers_profile_id_idx ON public.careers (profile_id);
CREATE INDEX education_profile_id_idx ON public.education (profile_id);
CREATE INDEX certifications_profile_id_idx ON public.certifications (profile_id);
CREATE INDEX cover_letters_profile_id_idx ON public.cover_letters (profile_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;

-- careers: owner full access + public read for published, public profiles
CREATE POLICY "careers_select_public"
  ON public.careers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = careers.profile_id
        AND profiles.status = 'published'
        AND profiles.is_private = false
    )
  );

CREATE POLICY "careers_select_own"
  ON public.careers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = careers.profile_id
        AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "careers_insert_own"
  ON public.careers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = careers.profile_id
        AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "careers_update_own"
  ON public.careers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = careers.profile_id
        AND profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = careers.profile_id
        AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "careers_delete_own"
  ON public.careers
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = careers.profile_id
        AND profiles.id = auth.uid()
    )
  );

-- education: owner full access + public read for published, public profiles
CREATE POLICY "education_select_public"
  ON public.education
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = education.profile_id
        AND profiles.status = 'published'
        AND profiles.is_private = false
    )
  );

CREATE POLICY "education_select_own"
  ON public.education
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = education.profile_id
        AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "education_insert_own"
  ON public.education
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = education.profile_id
        AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "education_update_own"
  ON public.education
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = education.profile_id
        AND profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = education.profile_id
        AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "education_delete_own"
  ON public.education
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = education.profile_id
        AND profiles.id = auth.uid()
    )
  );

-- certifications: owner full access + public read for published, public profiles
CREATE POLICY "certifications_select_public"
  ON public.certifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = certifications.profile_id
        AND profiles.status = 'published'
        AND profiles.is_private = false
    )
  );

CREATE POLICY "certifications_select_own"
  ON public.certifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = certifications.profile_id
        AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "certifications_insert_own"
  ON public.certifications
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = certifications.profile_id
        AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "certifications_update_own"
  ON public.certifications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = certifications.profile_id
        AND profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = certifications.profile_id
        AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "certifications_delete_own"
  ON public.certifications
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = certifications.profile_id
        AND profiles.id = auth.uid()
    )
  );

-- cover_letters: owner full access + public read for published, public profiles
CREATE POLICY "cover_letters_select_public"
  ON public.cover_letters
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = cover_letters.profile_id
        AND profiles.status = 'published'
        AND profiles.is_private = false
    )
  );

CREATE POLICY "cover_letters_select_own"
  ON public.cover_letters
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = cover_letters.profile_id
        AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "cover_letters_insert_own"
  ON public.cover_letters
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = cover_letters.profile_id
        AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "cover_letters_update_own"
  ON public.cover_letters
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = cover_letters.profile_id
        AND profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = cover_letters.profile_id
        AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "cover_letters_delete_own"
  ON public.cover_letters
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = cover_letters.profile_id
        AND profiles.id = auth.uid()
    )
  );
