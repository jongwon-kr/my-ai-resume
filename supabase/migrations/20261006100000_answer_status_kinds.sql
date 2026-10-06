-- Split refusals by cause so the dashboard can act on them.
--
-- unknown_fact: a job question the resume data cannot answer — a gap the owner
--               can fill. prompt_guard: an injection / persona-switch attempt —
--               never a resume gap, and never safe to replay as a chip.

ALTER TABLE public.chat_messages
  DROP CONSTRAINT chat_messages_answer_status_check;

ALTER TABLE public.chat_messages
  ADD CONSTRAINT chat_messages_answer_status_check
    CHECK (answer_status IS NULL OR answer_status IN (
      'answered', 'out_of_scope', 'unknown_fact', 'prompt_guard', 'sensitive_filtered'
    ));
