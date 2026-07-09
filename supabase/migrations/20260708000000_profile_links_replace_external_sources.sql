-- Replace fixed profile URL columns with flexible profile_links.
-- Remove RSS/GitHub external source sync.

CREATE TABLE IF NOT EXISTS profile_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label text NOT NULL,
  url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS profile_links_profile_id_idx ON profile_links(profile_id);

INSERT INTO profile_links (profile_id, label, url, sort_order)
SELECT profile_id, label, url, sort_order
FROM (
  SELECT id AS profile_id, 'GitHub' AS label, github_url AS url, 0 AS sort_order
  FROM profiles
  WHERE github_url IS NOT NULL AND trim(github_url) <> ''
  UNION ALL
  SELECT id, 'LinkedIn', linkedin_url, 1
  FROM profiles
  WHERE linkedin_url IS NOT NULL AND trim(linkedin_url) <> ''
  UNION ALL
  SELECT id, '블로그', blog_url, 2
  FROM profiles
  WHERE blog_url IS NOT NULL AND trim(blog_url) <> ''
) AS legacy_links;

DROP TABLE IF EXISTS external_sources;

ALTER TABLE profiles
  DROP COLUMN IF EXISTS github_url,
  DROP COLUMN IF EXISTS linkedin_url,
  DROP COLUMN IF EXISTS blog_url,
  DROP COLUMN IF EXISTS blog_rss_url;

ALTER TABLE profile_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY profile_links_owner_all ON profile_links
  FOR ALL USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY profile_links_public_read ON profile_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_links.profile_id
        AND profiles.status = 'published'
        AND profiles.is_private = false
    )
  );
