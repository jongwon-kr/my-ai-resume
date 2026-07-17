-- MVP security: block direct anon inserts that bypass API rate limits

DROP POLICY IF EXISTS "reports_insert_anyone" ON public.reports;
DROP POLICY IF EXISTS inquiries_public_insert ON public.inquiries;

-- increment_profile_view: callable only via service role (API route)
REVOKE ALL ON FUNCTION public.increment_profile_view(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_profile_view(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.increment_profile_view(uuid) FROM authenticated;
