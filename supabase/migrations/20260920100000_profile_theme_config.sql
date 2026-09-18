-- Per-profile appearance for the public page.
--
-- Nullable with no DB default on purpose: the default lives in
-- `lib/types/profile.ts` (DEFAULT_THEME_CONFIG) and `parseThemeConfig` reads a
-- NULL as "use the default preset". That keeps one source of truth for the
-- shape and means existing rows need no backfill.
--
-- Section order is deliberately NOT stored here — `profiles.section_order`
-- already owns it and the builder, the public page and the preview all read
-- that column.

ALTER TABLE public.profiles ADD COLUMN theme_config jsonb;

COMMENT ON COLUMN public.profiles.theme_config IS 'ThemeConfig: { preset, accentColor, fontFamily, avatarShape, cardStyle, headerStyle }';
