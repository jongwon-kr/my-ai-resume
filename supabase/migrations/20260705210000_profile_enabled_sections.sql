-- Track which optional resume sections the owner includes in their resume.
-- Keys map to resume-builder optional steps: careers / education_certifications
-- / cover_letters. Core sections (basic info, skills, projects) are always on.

ALTER TABLE public.profiles
  ADD COLUMN enabled_sections text[] NOT NULL
    DEFAULT ARRAY['careers', 'education_certifications', 'cover_letters']::text[];
