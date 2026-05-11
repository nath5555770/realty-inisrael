-- Adds two new categorizations to the `listings` table:
--   kind  : neuf | occasion | projet | commercial  (property condition / category)
--   deal  : sale | rent                            (transaction type)
--
-- Existing rows default to {kind=occasion, deal=sale}, which matches
-- the historical assumption (existing portfolio = used properties for sale).
--
-- Run this in the Supabase SQL Editor (or via supabase db push if you
-- use the CLI). Safe to re-run — uses IF NOT EXISTS guards.

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'occasion';

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS deal text NOT NULL DEFAULT 'sale';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'listings_kind_check'
      AND table_name = 'listings'
  ) THEN
    ALTER TABLE public.listings
      ADD CONSTRAINT listings_kind_check
      CHECK (kind IN ('neuf', 'occasion', 'projet', 'commercial'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'listings_deal_check'
      AND table_name = 'listings'
  ) THEN
    ALTER TABLE public.listings
      ADD CONSTRAINT listings_deal_check
      CHECK (deal IN ('sale', 'rent'));
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS listings_kind_idx ON public.listings (kind);
CREATE INDEX IF NOT EXISTS listings_deal_idx ON public.listings (deal);
