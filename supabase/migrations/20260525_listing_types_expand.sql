-- ==========================================================================
-- LISTINGS — expand allowed property types
-- ==========================================================================
-- Adds 'local-commercial', 'terrain', 'immeuble' to the type CHECK constraint.
-- The previous constraint only allowed appartement / penthouse / villa /
-- loft / maison, which rejected any listing for a commercial space, a plot
-- of land, or a full building.
-- ==========================================================================

ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_type_check;

ALTER TABLE public.listings ADD CONSTRAINT listings_type_check
  CHECK (type IN (
    'appartement',
    'penthouse',
    'villa',
    'loft',
    'maison',
    'local-commercial',
    'terrain',
    'immeuble'
  ));
