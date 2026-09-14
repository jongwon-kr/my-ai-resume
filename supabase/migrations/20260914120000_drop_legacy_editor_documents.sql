-- Last remnants of the abandoned standalone editor/portfolio service
-- (NEXT_PUBLIC_PORTFOLIO_SERVICE_URL, localhost:3001). Created directly on the
-- remote DB in 2026-07 with no migration file, and never referenced by this
-- app. The portfolios table from the same effort was dropped in
-- 20260911100000; these two were missed because that pass only searched for
-- "portfolio".
--
-- Superseded by portfolio_items (20260911110000). Contents were exported
-- before this migration was written.

DROP TABLE IF EXISTS public.editor_document_versions CASCADE;
DROP TABLE IF EXISTS public.editor_documents CASCADE;
