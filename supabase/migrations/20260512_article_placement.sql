-- ==========================================================================
-- Article placement — let editors choose where each journal article lands
-- on the public page: featured (à la une), duo (mis en valeur), grid (normal)
-- or hidden (accessible by URL only).
-- ==========================================================================

ALTER TABLE public.journal_articles
  ADD COLUMN IF NOT EXISTS placement     TEXT NOT NULL DEFAULT 'grid',
  ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

-- Constrain placement to known values
ALTER TABLE public.journal_articles
  DROP CONSTRAINT IF EXISTS journal_articles_placement_chk;
ALTER TABLE public.journal_articles
  ADD CONSTRAINT journal_articles_placement_chk
  CHECK (placement IN ('featured','duo','grid','hidden'));

-- Helpful index so the public read query can sort efficiently
CREATE INDEX IF NOT EXISTS journal_articles_placement_order_idx
  ON public.journal_articles (placement, display_order DESC, publish_date DESC);

-- Trigger: ensure at most one "featured" article. Setting one to featured
-- automatically demotes any existing featured to 'duo'.
CREATE OR REPLACE FUNCTION public.enforce_single_featured_article()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.placement = 'featured' THEN
    UPDATE public.journal_articles
       SET placement = 'duo'
     WHERE placement = 'featured'
       AND id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS journal_articles_single_featured ON public.journal_articles;
CREATE TRIGGER journal_articles_single_featured
  BEFORE INSERT OR UPDATE OF placement ON public.journal_articles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_single_featured_article();
