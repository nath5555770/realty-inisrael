-- ==========================================================================
-- Update the "single featured" trigger: when a new article is set to
-- featured, demote the previous featured back to 'grid' (not 'duo').
--
-- Rationale: the admin UI is now a single "Mettre en avant" toggle, so the
-- 'duo' value is no longer surfaced. Sending the old featured to 'grid'
-- keeps the mental model simple — there's only "featured" vs "the rest".
-- The duo row on the public page is still auto-populated from the most
-- recent grid articles by journal.js, so the visual layout is unchanged.
-- ==========================================================================

CREATE OR REPLACE FUNCTION public.enforce_single_featured_article()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.placement = 'featured' THEN
    UPDATE public.journal_articles
       SET placement = 'grid'
     WHERE placement = 'featured'
       AND id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Also normalize any existing 'duo' entries to 'grid' since the UI no
-- longer distinguishes them (the duo row is auto-filled from grid).
UPDATE public.journal_articles
   SET placement = 'grid'
 WHERE placement = 'duo';
