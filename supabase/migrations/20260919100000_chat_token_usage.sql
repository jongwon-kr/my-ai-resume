-- Measured Gemini token usage per assistant turn.
--
-- The stream already carries `usageMetadata` on its final chunk; until now the
-- consumption loop dropped it, so the only usage signal in the product was a
-- 429 after the fact. Recording it here lets the owner dashboard show real
-- consumption instead of a character-count estimate.
--
-- Nullable: rows written before this migration stay NULL and the dashboard
-- falls back to `estimateTokens` for them, labelled as an estimate.

ALTER TABLE public.chat_messages
  ADD COLUMN input_tokens integer,
  ADD COLUMN output_tokens integer;

COMMENT ON COLUMN public.chat_messages.input_tokens IS 'assistant rows only: promptTokenCount reported by Gemini';
COMMENT ON COLUMN public.chat_messages.output_tokens IS 'assistant rows only: candidate tokens, including the follow-up question call';
