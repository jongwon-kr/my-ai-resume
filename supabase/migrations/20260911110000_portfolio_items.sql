-- Portfolio media attached to a résumé: images, files (PDF/slides), video embeds, links.
-- One row per media item; a "gallery" is simply several kind='image' rows.

CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('image', 'file', 'video', 'link')),
  title text NOT NULL,
  description text,
  url text NOT NULL,
  storage_path text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS portfolio_items_profile_sort_idx
  ON public.portfolio_items (profile_id, sort_order);

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- Owner-only, same pattern as the other résumé child tables (20260714100000).
-- No public read policy: the public profile is served through the service-role
-- client in lib/public-profile/queries.ts.
CREATE POLICY "portfolio_items_select_own" ON public.portfolio_items
  FOR SELECT USING (public.profile_owned_by_user(profile_id));
CREATE POLICY "portfolio_items_insert_own" ON public.portfolio_items
  FOR INSERT WITH CHECK (public.profile_owned_by_user(profile_id));
CREATE POLICY "portfolio_items_update_own" ON public.portfolio_items
  FOR UPDATE
  USING (public.profile_owned_by_user(profile_id))
  WITH CHECK (public.profile_owned_by_user(profile_id));
CREATE POLICY "portfolio_items_delete_own" ON public.portfolio_items
  FOR DELETE USING (public.profile_owned_by_user(profile_id));
