-- Rows hold either a legacy comma-separated string or, once the app started
-- sending arrays into the text column, a serialized JSON array. Both shapes
-- must survive the type change, and an unparseable value must not abort it.
CREATE FUNCTION public.__tech_stack_to_jsonb(value text) RETURNS jsonb
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  parsed jsonb;
BEGIN
  IF value IS NULL OR btrim(value) = '' THEN
    RETURN '[]'::jsonb;
  END IF;

  BEGIN
    parsed := value::jsonb;
    IF jsonb_typeof(parsed) = 'array' THEN
      RETURN parsed;
    END IF;
  EXCEPTION WHEN others THEN
    parsed := NULL;
  END;

  RETURN (
    SELECT COALESCE(jsonb_agg(btrim(part)), '[]'::jsonb)
    FROM unnest(string_to_array(value, ',')) AS part
    WHERE btrim(part) <> ''
  );
END;
$$;

ALTER TABLE public.projects
  ALTER COLUMN tech_stack TYPE jsonb
  USING public.__tech_stack_to_jsonb(tech_stack);

ALTER TABLE public.projects
  ALTER COLUMN tech_stack SET DEFAULT '[]'::jsonb;

DROP FUNCTION public.__tech_stack_to_jsonb(text);
