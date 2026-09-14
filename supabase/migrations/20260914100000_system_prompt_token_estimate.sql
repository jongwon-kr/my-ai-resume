-- Observability only: record how large each generated system prompt is, so we
-- can decide later whether prompt truncation or retrieval-based replacement is
-- actually needed. Nothing reads this yet.

ALTER TABLE public.system_prompts
  ADD COLUMN IF NOT EXISTS token_estimate integer;
