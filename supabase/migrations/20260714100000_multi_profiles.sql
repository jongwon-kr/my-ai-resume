-- Multi-profile support: owner_id, up to 3 profiles per account, RLS updates

-- ---------------------------------------------------------------------------
-- Schema: decouple profiles.id from auth.users.id
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users (id) ON DELETE CASCADE;

UPDATE public.profiles
SET owner_id = id
WHERE owner_id IS NULL;

ALTER TABLE public.profiles
  ALTER COLUMN owner_id SET NOT NULL;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

CREATE INDEX IF NOT EXISTS profiles_owner_id_idx ON public.profiles (owner_id);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.profile_owned_by_user(p_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = p_profile_id
      AND owner_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.enforce_profile_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  profile_count integer;
BEGIN
  SELECT count(*)::integer
  INTO profile_count
  FROM public.profiles
  WHERE owner_id = NEW.owner_id;

  IF profile_count >= 3 THEN
    RAISE EXCEPTION 'Maximum of 3 profiles per account';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_limit_per_owner ON public.profiles;

CREATE TRIGGER profiles_limit_per_owner
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_profile_limit();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (owner_id, slug, name)
  VALUES (
    NEW.id,
    'pending_' || replace(NEW.id::text, '-', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- profiles RLS
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "profiles_select_public_or_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;

CREATE POLICY "profiles_select_public_or_own"
  ON public.profiles
  FOR SELECT
  USING (
    (status = 'published' AND is_private = false)
    OR owner_id = auth.uid()
  );

CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "profiles_delete_own"
  ON public.profiles
  FOR DELETE
  USING (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Child tables: owner policies via profile_owned_by_user
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "skills_select_own" ON public.skills;
DROP POLICY IF EXISTS "skills_insert_own" ON public.skills;
DROP POLICY IF EXISTS "skills_update_own" ON public.skills;
DROP POLICY IF EXISTS "skills_delete_own" ON public.skills;

CREATE POLICY "skills_select_own" ON public.skills
  FOR SELECT USING (public.profile_owned_by_user(profile_id));
CREATE POLICY "skills_insert_own" ON public.skills
  FOR INSERT WITH CHECK (public.profile_owned_by_user(profile_id));
CREATE POLICY "skills_update_own" ON public.skills
  FOR UPDATE
  USING (public.profile_owned_by_user(profile_id))
  WITH CHECK (public.profile_owned_by_user(profile_id));
CREATE POLICY "skills_delete_own" ON public.skills
  FOR DELETE USING (public.profile_owned_by_user(profile_id));

DROP POLICY IF EXISTS "projects_select_own" ON public.projects;
DROP POLICY IF EXISTS "projects_insert_own" ON public.projects;
DROP POLICY IF EXISTS "projects_update_own" ON public.projects;
DROP POLICY IF EXISTS "projects_delete_own" ON public.projects;

CREATE POLICY "projects_select_own" ON public.projects
  FOR SELECT USING (public.profile_owned_by_user(profile_id));
CREATE POLICY "projects_insert_own" ON public.projects
  FOR INSERT WITH CHECK (public.profile_owned_by_user(profile_id));
CREATE POLICY "projects_update_own" ON public.projects
  FOR UPDATE
  USING (public.profile_owned_by_user(profile_id))
  WITH CHECK (public.profile_owned_by_user(profile_id));
CREATE POLICY "projects_delete_own" ON public.projects
  FOR DELETE USING (public.profile_owned_by_user(profile_id));

DROP POLICY IF EXISTS "system_prompts_select_own" ON public.system_prompts;
DROP POLICY IF EXISTS "system_prompts_insert_own" ON public.system_prompts;
DROP POLICY IF EXISTS "system_prompts_update_own" ON public.system_prompts;
DROP POLICY IF EXISTS "system_prompts_delete_own" ON public.system_prompts;

CREATE POLICY "system_prompts_select_own" ON public.system_prompts
  FOR SELECT USING (public.profile_owned_by_user(profile_id));
CREATE POLICY "system_prompts_insert_own" ON public.system_prompts
  FOR INSERT WITH CHECK (public.profile_owned_by_user(profile_id));
CREATE POLICY "system_prompts_update_own" ON public.system_prompts
  FOR UPDATE
  USING (public.profile_owned_by_user(profile_id))
  WITH CHECK (public.profile_owned_by_user(profile_id));
CREATE POLICY "system_prompts_delete_own" ON public.system_prompts
  FOR DELETE USING (public.profile_owned_by_user(profile_id));

DROP POLICY IF EXISTS "chat_sessions_select_own" ON public.chat_sessions;
CREATE POLICY "chat_sessions_select_own" ON public.chat_sessions
  FOR SELECT USING (public.profile_owned_by_user(profile_id));

DROP POLICY IF EXISTS "chat_messages_select_own" ON public.chat_messages;
CREATE POLICY "chat_messages_select_own" ON public.chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.chat_sessions cs
      WHERE cs.id = chat_messages.session_id
        AND public.profile_owned_by_user(cs.profile_id)
    )
  );

DROP POLICY IF EXISTS "reports_select_own" ON public.reports;
CREATE POLICY "reports_select_own" ON public.reports
  FOR SELECT
  USING (
    profile_id IS NOT NULL
    AND public.profile_owned_by_user(profile_id)
  );

DROP POLICY IF EXISTS "profile_daily_stats_select_own" ON public.profile_daily_stats;
CREATE POLICY "profile_daily_stats_select_own" ON public.profile_daily_stats
  FOR SELECT USING (public.profile_owned_by_user(profile_id));

DROP POLICY IF EXISTS "owner_faqs_select_own" ON public.owner_faqs;
DROP POLICY IF EXISTS "owner_faqs_insert_own" ON public.owner_faqs;
DROP POLICY IF EXISTS "owner_faqs_update_own" ON public.owner_faqs;
DROP POLICY IF EXISTS "owner_faqs_delete_own" ON public.owner_faqs;

CREATE POLICY "owner_faqs_select_own" ON public.owner_faqs
  FOR SELECT USING (public.profile_owned_by_user(profile_id));
CREATE POLICY "owner_faqs_insert_own" ON public.owner_faqs
  FOR INSERT WITH CHECK (public.profile_owned_by_user(profile_id));
CREATE POLICY "owner_faqs_update_own" ON public.owner_faqs
  FOR UPDATE
  USING (public.profile_owned_by_user(profile_id))
  WITH CHECK (public.profile_owned_by_user(profile_id));
CREATE POLICY "owner_faqs_delete_own" ON public.owner_faqs
  FOR DELETE USING (public.profile_owned_by_user(profile_id));

DROP POLICY IF EXISTS profile_links_owner_all ON public.profile_links;
CREATE POLICY profile_links_owner_all ON public.profile_links
  FOR ALL
  USING (public.profile_owned_by_user(profile_id))
  WITH CHECK (public.profile_owned_by_user(profile_id));

DROP POLICY IF EXISTS inquiries_owner_select ON public.inquiries;
CREATE POLICY inquiries_owner_select ON public.inquiries
  FOR SELECT USING (public.profile_owned_by_user(profile_id));

DROP POLICY IF EXISTS "careers_select_own" ON public.careers;
DROP POLICY IF EXISTS "careers_insert_own" ON public.careers;
DROP POLICY IF EXISTS "careers_update_own" ON public.careers;
DROP POLICY IF EXISTS "careers_delete_own" ON public.careers;

CREATE POLICY "careers_select_own" ON public.careers
  FOR SELECT USING (public.profile_owned_by_user(profile_id));
CREATE POLICY "careers_insert_own" ON public.careers
  FOR INSERT WITH CHECK (public.profile_owned_by_user(profile_id));
CREATE POLICY "careers_update_own" ON public.careers
  FOR UPDATE
  USING (public.profile_owned_by_user(profile_id))
  WITH CHECK (public.profile_owned_by_user(profile_id));
CREATE POLICY "careers_delete_own" ON public.careers
  FOR DELETE USING (public.profile_owned_by_user(profile_id));

DROP POLICY IF EXISTS "education_select_own" ON public.education;
DROP POLICY IF EXISTS "education_insert_own" ON public.education;
DROP POLICY IF EXISTS "education_update_own" ON public.education;
DROP POLICY IF EXISTS "education_delete_own" ON public.education;

CREATE POLICY "education_select_own" ON public.education
  FOR SELECT USING (public.profile_owned_by_user(profile_id));
CREATE POLICY "education_insert_own" ON public.education
  FOR INSERT WITH CHECK (public.profile_owned_by_user(profile_id));
CREATE POLICY "education_update_own" ON public.education
  FOR UPDATE
  USING (public.profile_owned_by_user(profile_id))
  WITH CHECK (public.profile_owned_by_user(profile_id));
CREATE POLICY "education_delete_own" ON public.education
  FOR DELETE USING (public.profile_owned_by_user(profile_id));

DROP POLICY IF EXISTS "certifications_select_own" ON public.certifications;
DROP POLICY IF EXISTS "certifications_insert_own" ON public.certifications;
DROP POLICY IF EXISTS "certifications_update_own" ON public.certifications;
DROP POLICY IF EXISTS "certifications_delete_own" ON public.certifications;

CREATE POLICY "certifications_select_own" ON public.certifications
  FOR SELECT USING (public.profile_owned_by_user(profile_id));
CREATE POLICY "certifications_insert_own" ON public.certifications
  FOR INSERT WITH CHECK (public.profile_owned_by_user(profile_id));
CREATE POLICY "certifications_update_own" ON public.certifications
  FOR UPDATE
  USING (public.profile_owned_by_user(profile_id))
  WITH CHECK (public.profile_owned_by_user(profile_id));
CREATE POLICY "certifications_delete_own" ON public.certifications
  FOR DELETE USING (public.profile_owned_by_user(profile_id));

DROP POLICY IF EXISTS "cover_letters_select_own" ON public.cover_letters;
DROP POLICY IF EXISTS "cover_letters_insert_own" ON public.cover_letters;
DROP POLICY IF EXISTS "cover_letters_update_own" ON public.cover_letters;
DROP POLICY IF EXISTS "cover_letters_delete_own" ON public.cover_letters;

CREATE POLICY "cover_letters_select_own" ON public.cover_letters
  FOR SELECT USING (public.profile_owned_by_user(profile_id));
CREATE POLICY "cover_letters_insert_own" ON public.cover_letters
  FOR INSERT WITH CHECK (public.profile_owned_by_user(profile_id));
CREATE POLICY "cover_letters_update_own" ON public.cover_letters
  FOR UPDATE
  USING (public.profile_owned_by_user(profile_id))
  WITH CHECK (public.profile_owned_by_user(profile_id));
CREATE POLICY "cover_letters_delete_own" ON public.cover_letters
  FOR DELETE USING (public.profile_owned_by_user(profile_id));

DROP POLICY IF EXISTS "activities_select_own" ON public.activities;
DROP POLICY IF EXISTS "activities_insert_own" ON public.activities;
DROP POLICY IF EXISTS "activities_update_own" ON public.activities;
DROP POLICY IF EXISTS "activities_delete_own" ON public.activities;

CREATE POLICY "activities_select_own" ON public.activities
  FOR SELECT USING (public.profile_owned_by_user(profile_id));
CREATE POLICY "activities_insert_own" ON public.activities
  FOR INSERT WITH CHECK (public.profile_owned_by_user(profile_id));
CREATE POLICY "activities_update_own" ON public.activities
  FOR UPDATE
  USING (public.profile_owned_by_user(profile_id))
  WITH CHECK (public.profile_owned_by_user(profile_id));
CREATE POLICY "activities_delete_own" ON public.activities
  FOR DELETE USING (public.profile_owned_by_user(profile_id));

-- ---------------------------------------------------------------------------
-- Avatars storage: folder is profile id
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "avatars_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete_own" ON storage.objects;

CREATE POLICY "avatars_insert_own"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND public.profile_owned_by_user((storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "avatars_update_own"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND public.profile_owned_by_user((storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "avatars_delete_own"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND public.profile_owned_by_user((storage.foldername(name))[1]::uuid)
  );
