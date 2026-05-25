-- ==========================================================================
-- LISTINGS — soft-delete (trash bin) instead of hard DELETE
-- ==========================================================================
-- Adds an archived_at / archived_by pair so any deletion goes to a "trash"
-- state that's recoverable by admins or the original author. Hard deletes
-- still possible from the trash view ("Supprimer définitivement"), but the
-- default flow now uses soft-delete.
--
-- The public read policy is tightened so archived listings never show on
-- the public site (defence in depth — even if the admin filter is bypassed).
-- ==========================================================================

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_by UUID;

-- Partial index — most listings are not archived, so the WHERE keeps the
-- index tiny and fast for the "show me the trash" admin query.
CREATE INDEX IF NOT EXISTS listings_archived_at_idx
  ON public.listings (archived_at)
  WHERE archived_at IS NOT NULL;

-- Public can only read non-archived AND visible listings
DROP POLICY IF EXISTS public_read_visible ON public.listings;
CREATE POLICY public_read_visible ON public.listings
  FOR SELECT
  USING (visible = true AND archived_at IS NULL);

-- Existing auth_* policies (DELETE/INSERT/SELECT/UPDATE = true) stay in
-- place. Any authenticated user (admin or agent) can soft-delete, restore,
-- or hard-delete from the admin UI. The 30-day retention is a soft policy
-- enforced in the UI only (no auto-purge cron yet).
