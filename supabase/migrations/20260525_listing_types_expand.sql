-- ==========================================================================
-- LISTINGS — relax CHECK constraints (type, city, kind)
-- ==========================================================================
-- The old constraints blocked legitimate listings:
--   * type: was limited to 5 categories — couldn't list local-commercial,
--     terrain, or immeuble
--   * city: was a fixed list of 5 Israeli cities — blocked Eilat, Haifa,
--     Ashkelon, Beer Sheva, etc.
--   * kind: was a fixed list of 4 conditions — blocked anything else
--
-- These fields are already validated at the admin UI level via dropdowns,
-- so the double-validation in the DB just adds friction without security.
--
-- 'type' is rebuilt with the expanded list. 'city' and 'kind' are dropped
-- entirely (free-form text now, drives the public filters dynamically).
-- 'deal' (sale/rent) and 'images' (jsonb array) constraints stay in place.
-- ==========================================================================

-- 1. Expand allowed property types
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_type_check;
ALTER TABLE public.listings ADD CONSTRAINT listings_type_check
  CHECK (type IN (
    'appartement',
    'penthouse',
    'villa',
    'loft',
    'maison',
    'bureaux',
    'local-commercial',
    'terrain',
    'immeuble'
  ));

-- 2. Drop city allowlist — agency may operate in any Israeli city
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_city_check;

-- 3. Drop kind allowlist — same reasoning (UI dropdown is enough)
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_kind_check;
