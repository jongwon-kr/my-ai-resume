-- Remove the abandoned standalone portfolio-service schema.
-- These objects existed only on the remote DB (no migration file) and are unused
-- by the app. Replaced by portfolio_items (20260911110000).

DROP TABLE IF EXISTS public.portfolios CASCADE;

ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS portfolio_published_at,
  DROP COLUMN IF EXISTS portfolio_summary,
  DROP COLUMN IF EXISTS portfolio_version;
