-- Report moderation status tracking

ALTER TABLE public.reports
  ADD COLUMN status text NOT NULL DEFAULT 'pending',
  ADD COLUMN resolved_at timestamptz,
  ADD COLUMN resolved_by uuid REFERENCES auth.users (id);

ALTER TABLE public.reports
  ADD CONSTRAINT reports_status_check CHECK (status IN ('pending', 'resolved'));

CREATE INDEX reports_status_idx ON public.reports (status);

CREATE POLICY "reports_update_admin"
  ON public.reports
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
