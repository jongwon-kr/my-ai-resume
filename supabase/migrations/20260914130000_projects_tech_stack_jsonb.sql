ALTER TABLE public.projects
  ALTER COLUMN tech_stack TYPE jsonb
  USING (
    CASE
      WHEN tech_stack IS NULL OR btrim(tech_stack) = '' THEN '[]'::jsonb
      ELSE (
        SELECT COALESCE(jsonb_agg(btrim(part)), '[]'::jsonb)
        FROM unnest(string_to_array(tech_stack, ',')) AS part
        WHERE btrim(part) <> ''
      )
    END
  );

ALTER TABLE public.projects
  ALTER COLUMN tech_stack SET DEFAULT '[]'::jsonb;
