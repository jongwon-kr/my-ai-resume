-- Privacy display toggles for public profile
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS show_phone boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_exact_age boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS suggest_top_questions_in_chat boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS blog_rss_url text;

-- Owner FAQ match mode
ALTER TABLE owner_faqs
  ADD COLUMN IF NOT EXISTS match_mode text NOT NULL DEFAULT 'semantic'
  CHECK (match_mode IN ('exact', 'semantic'));

-- Chat session type (visitor vs owner mock interview / preview)
ALTER TABLE chat_sessions
  ADD COLUMN IF NOT EXISTS session_type text NOT NULL DEFAULT 'visitor'
  CHECK (session_type IN ('visitor', 'mock_interview', 'preview'));

-- Visitor inquiries (human fallback)
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  visitor_name text,
  visitor_email text NOT NULL,
  question text NOT NULL,
  chat_session_id uuid REFERENCES chat_sessions(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inquiries_profile_id_idx ON inquiries(profile_id);
CREATE INDEX IF NOT EXISTS inquiries_created_at_idx ON inquiries(created_at DESC);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY inquiries_owner_select ON inquiries
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY inquiries_public_insert ON inquiries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = inquiries.profile_id
        AND profiles.status = 'published'
        AND profiles.is_private = false
    )
  );

-- External content (RSS / GitHub cache)
CREATE TABLE IF NOT EXISTS external_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source_type text NOT NULL CHECK (source_type IN ('rss', 'github')),
  source_url text NOT NULL,
  content_cache jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_fetched_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, source_type)
);

CREATE INDEX IF NOT EXISTS external_sources_profile_id_idx ON external_sources(profile_id);

ALTER TABLE external_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY external_sources_owner_all ON external_sources
  FOR ALL USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY external_sources_public_read ON external_sources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = external_sources.profile_id
        AND profiles.status = 'published'
        AND profiles.is_private = false
    )
  );
