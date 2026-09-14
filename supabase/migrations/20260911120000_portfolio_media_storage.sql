-- Storage bucket for portfolio images and files.
-- Path convention: {profileId}/{uuid}.{ext} — same folder-ownership predicate as avatars.
-- 10MB is a server-side backstop; per-kind limits are enforced client-side
-- (lib/portfolio/constants.ts): images 3MB, files 8MB.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-media',
  'portfolio-media',
  true,
  10485760,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "portfolio_media_public_read"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'portfolio-media');

CREATE POLICY "portfolio_media_insert_own"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'portfolio-media'
    AND public.profile_owned_by_user((storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "portfolio_media_update_own"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'portfolio-media'
    AND public.profile_owned_by_user((storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "portfolio_media_delete_own"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'portfolio-media'
    AND public.profile_owned_by_user((storage.foldername(name))[1]::uuid)
  );
