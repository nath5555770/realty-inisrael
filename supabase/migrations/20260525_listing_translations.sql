-- ==========================================================================
-- LISTINGS — auto-translation columns (FR → EN/HE/RU via OpenAI)
-- ==========================================================================
-- Nathalie writes listings in French only. An Edge Function calls OpenAI
-- to produce professional translations into the 3 other site languages.
-- Stored as a single JSONB column to keep schema simple:
--   translations = { en: {...}, he: {...}, ru: {...} }
-- Each lang sub-object contains: title_main, title_accent, description,
-- neighborhood, extra_label.
-- ==========================================================================

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS translations JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS translated_at TIMESTAMPTZ;

-- Index for the "needs (re-)translation" admin filter
CREATE INDEX IF NOT EXISTS listings_translated_at_idx
  ON public.listings (translated_at);

COMMENT ON COLUMN public.listings.translations IS
  'Auto-generated translations of FR fields via OpenAI. Shape: { en: {title_main, title_accent, description, neighborhood, extra_label}, he: {...}, ru: {...} }';

COMMENT ON COLUMN public.listings.translated_at IS
  'Timestamp of the last successful translation run. NULL = never translated. Reset to NULL when admin edits the listing so the UI flags it as "stale translation".';

-- Trigger : when a translatable FR field changes, mark translations as stale
CREATE OR REPLACE FUNCTION public.listings_mark_translation_stale()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.title_main IS DISTINCT FROM OLD.title_main
     OR NEW.title_accent IS DISTINCT FROM OLD.title_accent
     OR NEW.description IS DISTINCT FROM OLD.description
     OR NEW.neighborhood IS DISTINCT FROM OLD.neighborhood
     OR NEW.extra_label IS DISTINCT FROM OLD.extra_label
  THEN
    -- Don't clear translations themselves (still useful as a fallback),
    -- just mark them as stale so the admin sees "translations outdated".
    NEW.translated_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS listings_mark_translation_stale_trg ON public.listings;
CREATE TRIGGER listings_mark_translation_stale_trg
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.listings_mark_translation_stale();
