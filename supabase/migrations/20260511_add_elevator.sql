-- Adds an "ascenseur" (elevator) flag to listings.
--
-- Default false because most existing rows are villas / townhouses where
-- the question doesn't apply. The admin form lets the user tick it on
-- per listing.

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS has_elevator boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS listings_elevator_idx
  ON public.listings (has_elevator)
  WHERE has_elevator = true;
