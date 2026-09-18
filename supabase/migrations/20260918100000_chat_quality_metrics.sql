-- Chat answer quality instrumentation.
--
-- Until now a chat turn stored only role + content, so "which suggested
-- question did the clone fail to answer?" was unanswerable. These columns make
-- failures countable and feed the owner's FAQ loop. All nullable: existing rows
-- and the owner-only RLS policies are untouched.

ALTER TABLE public.chat_messages
  ADD COLUMN answer_status text,
  ADD COLUMN injection_kind text,
  ADD COLUMN model text,
  ADD COLUMN origin text;

ALTER TABLE public.chat_messages
  ADD CONSTRAINT chat_messages_answer_status_check
    CHECK (answer_status IS NULL OR answer_status IN ('answered', 'out_of_scope', 'sensitive_filtered')),
  ADD CONSTRAINT chat_messages_injection_kind_check
    CHECK (injection_kind IS NULL OR injection_kind IN ('faq', 'focus', 'none')),
  ADD CONSTRAINT chat_messages_origin_check
    CHECK (origin IS NULL OR origin IN ('typed', 'suggested', 'follow_up'));

COMMENT ON COLUMN public.chat_messages.answer_status IS 'assistant rows only: whether the clone actually answered';
COMMENT ON COLUMN public.chat_messages.injection_kind IS 'assistant rows only: which evidence block was injected';
COMMENT ON COLUMN public.chat_messages.origin IS 'user rows only: how the visitor entered the question';

-- Answerable-question catalog + evidence vocabulary, computed at publish time
-- so the chat path needs no extra query to validate follow-up questions.
ALTER TABLE public.system_prompts ADD COLUMN coverage jsonb;

COMMENT ON COLUMN public.system_prompts.coverage IS 'ProfileCoverage: { questions, tokens, intents }';
