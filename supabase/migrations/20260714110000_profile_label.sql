-- Owner-only display label for distinguishing multiple profiles

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS label text;

COMMENT ON COLUMN public.profiles.label IS
  'Owner-only nickname to distinguish profiles in the dashboard (not shown on public profile).';
