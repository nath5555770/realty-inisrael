-- ==========================================================================
-- Add a multi-photo gallery column to listings
--
-- Until now each listing only had a single `image` (the cover). The cliente
-- wants to upload several photos per listing and have them displayed in a
-- gallery when a visitor clicks on the listing card on the public site.
--
-- We add a JSONB array of object-storage paths. The cover stays in `image`
-- so the listing cards (which only show one photo) keep rendering the same
-- way without code changes; `images` holds the rest of the gallery, with
-- the same path format used for `image` (relative to the listing-images
-- bucket).
-- ==========================================================================

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS images JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Sanity: an empty array is fine; reject anything that's not an array.
ALTER TABLE public.listings
  DROP CONSTRAINT IF EXISTS listings_images_is_array;
ALTER TABLE public.listings
  ADD CONSTRAINT listings_images_is_array
  CHECK (jsonb_typeof(images) = 'array');

CREATE INDEX IF NOT EXISTS listings_images_gin ON public.listings USING gin (images);
