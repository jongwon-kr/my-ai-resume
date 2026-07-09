-- CloneCV initial schema, RLS policies, and auth trigger

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  name text NOT NULL DEFAULT '',
  role_title text,
  intro text,
  avatar_url text,
  is_private boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft',
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_status_check CHECK (status IN ('draft', 'published'))
);

CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  name text NOT NULL,
  proficiency text
);

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title text NOT NULL,
  period text,
  role text,
  tech_stack text,
  situation text,
  actions text,
  results text,
  troubleshooting text,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE public.system_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  content text NOT NULL,
  version integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  visitor_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.chat_sessions (id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chat_messages_role_check CHECK (role IN ('user', 'assistant'))
);

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  reason text,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX skills_profile_id_idx ON public.skills (profile_id);
CREATE INDEX projects_profile_id_idx ON public.projects (profile_id);
CREATE INDEX system_prompts_profile_id_idx ON public.system_prompts (profile_id);
CREATE INDEX chat_sessions_profile_id_idx ON public.chat_sessions (profile_id);
CREATE INDEX chat_messages_session_id_idx ON public.chat_messages (session_id);
CREATE INDEX reports_profile_id_idx ON public.reports (profile_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger for profiles
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-create profile row on auth.users insert
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, slug, name)
  VALUES (
    NEW.id,
    'pending_' || replace(NEW.id::text, '-', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- profiles: public read for published profiles; owner full access
CREATE POLICY "profiles_select_public_or_own"
  ON public.profiles
  FOR SELECT
  USING (
    (status = 'published' AND is_private = false)
    OR auth.uid() = id
  );

CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_own"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- skills: owner-only read/write (no public direct select)
CREATE POLICY "skills_select_own"
  ON public.skills
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = skills.profile_id
        AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "skills_insert_own"
  ON public.skills
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = skills.profile_id
        AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "skills_update_own"
  ON public.skills
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = skills.profile_id
        AND profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = skills.profile_id
        AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "skills_delete_own"
  ON public.skills
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = skills.profile_id
        AND profiles.id = auth.uid()
    )
  );

-- projects: owner-only read/write
CREATE POLICY "projects_select_own"
  ON public.projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = projects.profile_id
        AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "projects_insert_own"
  ON public.projects
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = projects.profile_id
        AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "projects_update_own"
  ON public.projects
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = projects.profile_id
        AND profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = projects.profile_id
        AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "projects_delete_own"
  ON public.projects
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = projects.profile_id
        AND profiles.id = auth.uid()
    )
  );

-- system_prompts: owner-only read/write
CREATE POLICY "system_prompts_select_own"
  ON public.system_prompts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = system_prompts.profile_id
        AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "system_prompts_insert_own"
  ON public.system_prompts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = system_prompts.profile_id
        AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "system_prompts_update_own"
  ON public.system_prompts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = system_prompts.profile_id
        AND profiles.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = system_prompts.profile_id
        AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "system_prompts_delete_own"
  ON public.system_prompts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = system_prompts.profile_id
        AND profiles.id = auth.uid()
    )
  );

-- chat_sessions: owner select only; writes via service role in API
CREATE POLICY "chat_sessions_select_own"
  ON public.chat_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = chat_sessions.profile_id
        AND profiles.id = auth.uid()
    )
  );

-- chat_messages: owner select only; visitor inserts via service role in API
CREATE POLICY "chat_messages_select_own"
  ON public.chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.chat_sessions cs
      JOIN public.profiles p ON p.id = cs.profile_id
      WHERE cs.id = chat_messages.session_id
        AND p.id = auth.uid()
    )
  );

-- reports: anyone can submit; owner can read
CREATE POLICY "reports_insert_anyone"
  ON public.reports
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "reports_select_own"
  ON public.reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = reports.profile_id
        AND profiles.id = auth.uid()
    )
  );
