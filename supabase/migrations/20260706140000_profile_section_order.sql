ALTER TABLE public.profiles
  ADD COLUMN section_order integer[] NOT NULL DEFAULT '{1,2,3,4,5,6,7,8,9}';
