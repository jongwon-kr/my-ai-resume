-- Daily view stats for owner dashboard charts

CREATE TABLE public.profile_daily_stats (
  profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  stat_date date NOT NULL DEFAULT CURRENT_DATE,
  views integer NOT NULL DEFAULT 0,
  PRIMARY KEY (profile_id, stat_date)
);

CREATE INDEX profile_daily_stats_profile_id_idx
  ON public.profile_daily_stats (profile_id);

ALTER TABLE public.profile_daily_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profile_daily_stats_select_own"
  ON public.profile_daily_stats
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = profile_daily_stats.profile_id
        AND profiles.id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public.increment_profile_view(p_profile_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET view_count = view_count + 1
  WHERE id = p_profile_id
    AND status = 'published'
    AND is_private = false;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  INSERT INTO public.profile_daily_stats (profile_id, stat_date, views)
  VALUES (p_profile_id, CURRENT_DATE, 1)
  ON CONFLICT (profile_id, stat_date)
  DO UPDATE SET views = profile_daily_stats.views + 1;
END;
$$;
