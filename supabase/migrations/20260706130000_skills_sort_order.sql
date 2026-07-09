ALTER TABLE public.skills
  ADD COLUMN sort_order integer NOT NULL DEFAULT 0;

CREATE INDEX skills_profile_sort_idx ON public.skills (profile_id, sort_order);
