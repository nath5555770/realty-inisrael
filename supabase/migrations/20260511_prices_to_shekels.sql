-- One-time migration: convert existing listings.price_usd from USD to ILS.
--
-- The site has switched to a shekel-native model — admin enters prices in
-- shekels, public displays them in shekels — so the historical USD values
-- in price_usd need to be converted once into shekels.
--
-- Rate used: 1 USD = 3.7 ILS (approx. spring 2026). Rounded to 100 000 ₪
-- so amounts stay clean.
--
-- The column is intentionally NOT renamed — keeping price_usd preserves
-- existing references (app code, RLS policies, indexes). The name is just
-- a legacy label now; the stored value is shekels.
--
-- ⚠️  RUN ONCE. Re-running multiplies prices a second time. To detect a
--     re-run before you commit, check the BEFORE/AFTER counts below
--     (max(price_usd) should jump from ~24M to ~89M).

-- Sanity check before — note the current max value
SELECT 'BEFORE' AS step, MIN(price_usd) AS min_p, MAX(price_usd) AS max_p
FROM public.listings WHERE price_usd > 0;

-- The actual conversion
UPDATE public.listings
SET price_usd = ROUND(price_usd * 3.7 / 100000) * 100000
WHERE price_usd > 0;

-- Sanity check after — max should now be ~3.7× the previous max
SELECT 'AFTER' AS step, MIN(price_usd) AS min_p, MAX(price_usd) AS max_p
FROM public.listings WHERE price_usd > 0;
