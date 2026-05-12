-- ==========================================================================
-- SITE CMS — site_texts (editable copy) + site_settings (layouts, switches)
-- Adds a content management layer Nathalie can edit from the admin panel
-- without touching code.
--
-- Tables
--   site_texts     — key/fr/en/he/ru rows, loaded on every page and used to
--                    replace elements that have a data-text="<key>" attribute
--   site_settings  — key/JSONB value rows, e.g. journal_layout, cta visibility
--
-- Both are public-readable so the website can render them without auth, and
-- writeable by editors/admins through RLS (matches the pattern used by the
-- existing listings / journal tables).
-- ==========================================================================

-- ----- site_texts ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_texts (
  key         TEXT PRIMARY KEY,
  category    TEXT NOT NULL DEFAULT 'misc',
  fr          TEXT,
  en          TEXT,
  he          TEXT,
  ru          TEXT,
  notes       TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS site_texts_category_idx ON public.site_texts(category);

ALTER TABLE public.site_texts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_texts read public"      ON public.site_texts;
DROP POLICY IF EXISTS "site_texts write editor"     ON public.site_texts;

CREATE POLICY "site_texts read public"
  ON public.site_texts FOR SELECT
  USING (true);

CREATE POLICY "site_texts write editor"
  ON public.site_texts FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p
                  WHERE p.id = auth.uid()
                    AND p.is_active = true
                    AND p.role IN ('admin','editor')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p
                  WHERE p.id = auth.uid()
                    AND p.is_active = true
                    AND p.role IN ('admin','editor')));

-- ----- site_settings ------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  notes       TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings read public"   ON public.site_settings;
DROP POLICY IF EXISTS "site_settings write editor"  ON public.site_settings;

CREATE POLICY "site_settings read public"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "site_settings write editor"
  ON public.site_settings FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p
                  WHERE p.id = auth.uid()
                    AND p.is_active = true
                    AND p.role IN ('admin','editor')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p
                  WHERE p.id = auth.uid()
                    AND p.is_active = true
                    AND p.role IN ('admin','editor')));

-- ----- Seed: default settings ---------------------------------------------
INSERT INTO public.site_settings (key, value, notes) VALUES
  ('journal.layout',        '"magazine"'::jsonb, 'Layout du journal: magazine | classic | minimal'),
  ('journal.cards_per_row', '3'::jsonb,           'Nombre de cartes par ligne dans la grille (2-4)'),
  ('journal.show_duo',      'true'::jsonb,        'Afficher la rangée de 2 articles entre l''à-la-une et la grille')
ON CONFLICT (key) DO NOTHING;

-- ----- Seed: initial editable texts ---------------------------------------
-- Categorised by page so the admin can group them in the UI.
INSERT INTO public.site_texts (key, category, fr, en, he, ru, notes) VALUES
  -- ===== HOME =====
  ('home.hero.title',
    'home',
    'Votre projet immobilier en Israël,',
    'Your real-estate project in Israel,',
    'הפרויקט הנדל"ני שלך בישראל,',
    'Ваш проект недвижимости в Израиле,',
    'Titre principal sur la page d''accueil — 1ère ligne'),
  ('home.hero.subtitle',
    'home',
    'en toute sérénité.',
    'in complete peace of mind.',
    'בשלוות נפש מוחלטת.',
    'в полном спокойствии.',
    'Titre principal — 2ème ligne italique dorée'),
  ('home.hero.cta_primary',
    'home',
    'Voir nos projets',
    'See our projects',
    'ראה את הפרויקטים שלנו',
    'Смотреть проекты',
    'Bouton CTA principal du hero'),
  ('home.hero.cta_secondary',
    'home',
    'Nous contacter',
    'Contact us',
    'צור קשר',
    'Связаться с нами',
    'Bouton CTA secondaire du hero'),
  ('home.search.eyebrow',
    'home',
    '— TROUVER UN BIEN',
    '— FIND A PROPERTY',
    '— מצא נכס',
    '— НАЙТИ ОБЪЕКТ',
    'Surtitre au-dessus de "Composez votre recherche"'),
  ('home.search.title',
    'home',
    'Composez votre recherche.',
    'Compose your search.',
    'הרכב את החיפוש שלך.',
    'Составьте свой поиск.',
    'Titre du bloc recherche'),

  -- ===== TAGLINE / FOOTER =====
  ('footer.tagline',
    'footer',
    '— VOTRE EXPÉRIENCE, NOTRE RÉUSSITE',
    '— YOUR EXPERIENCE, OUR SUCCESS',
    '— החוויה שלך, ההצלחה שלנו',
    '— ВАШ ОПЫТ, НАШ УСПЕХ',
    'Slogan affiché dans le footer de toutes les pages'),
  ('footer.description',
    'footer',
    'Maison indépendante de courtage immobilier. Tel Aviv depuis 2014. Mossi''a #4218.',
    'Independent real-estate brokerage. Tel Aviv since 2014. Mossi''a license #4218.',
    'בית תיווך עצמאי. תל אביב מאז 2014. רישיון מסיע #4218.',
    'Независимое агентство недвижимости. Тель-Авив с 2014 года. Лицензия #4218.',
    'Texte descriptif sous le slogan dans le footer'),

  -- ===== CONTACT =====
  ('contact.phone',
    'contact',
    '+972 54 783 11 52',
    '+972 54 783 11 52',
    '+972 54 783 11 52',
    '+972 54 783 11 52',
    'Numéro de téléphone affiché dans la topbar, menu, contact, footer'),
  ('contact.email',
    'contact',
    'nathalie@shaharlevi.co.il',
    'nathalie@shaharlevi.co.il',
    'nathalie@shaharlevi.co.il',
    'nathalie@shaharlevi.co.il',
    'Adresse email principale'),
  ('contact.address',
    'contact',
    '14 Rothschild Boulevard · Tel Aviv 6688314 · Israël',
    '14 Rothschild Boulevard · Tel Aviv 6688314 · Israel',
    'שדרות רוטשילד 14 · תל אביב 6688314 · ישראל',
    'Бульвар Ротшильда 14 · Тель-Авив 6688314 · Израиль',
    'Adresse postale de l''agence'),

  -- ===== AGENCE =====
  ('agence.team.title_part1',
    'agence',
    'Une agence',
    'An agency',
    'סוכנות',
    'Агентство',
    'Titre section équipe — 1ère ligne'),
  ('agence.team.title_part2',
    'agence',
    'à taille humaine.',
    'on a human scale.',
    'בקנה מידה אנושי.',
    'на человеческом уровне.',
    'Titre section équipe — 2ème ligne italique'),
  ('agence.team.intro',
    'agence',
    'Une équipe aux parcours complémentaires, réunie par une même exigence : offrir un accompagnement clair, humain et irréprochable à chaque étape. Français, anglais, hébreu et russe — nos équipes accompagnent une clientèle internationale avec fluidité et précision. Profondément ancrés dans le marché immobilier israélien, nos agents suivent personnellement chaque projet, du premier échange jusqu''à la remise des clés, avec disponibilité, discrétion et engagement.',
    'A team with complementary paths, united by one shared standard: deliver clear, human and impeccable support at every step. French, English, Hebrew and Russian — our teams serve an international clientele with fluency and precision. Deeply rooted in the Israeli real-estate market, our agents personally guide every project, from the first exchange through to the handover of keys — with availability, discretion and commitment.',
    'צוות עם מסלולים משלימים, מאוחד סביב תקן אחד משותף: להעניק ליווי ברור, אנושי וללא דופי בכל שלב. צרפתית, אנגלית, עברית ורוסית — הצוותים שלנו מלווים לקוחות בינלאומיים בשטף ובדייקנות. מושרשים עמוקות בשוק הנדל"ן הישראלי, סוכנינו מלווים אישית כל פרויקט, מההתכתבות הראשונה ועד מסירת המפתחות — בזמינות, בדיסקרטיות ובמחויבות.',
    'Команда с дополняющими друг друга путями, объединённая одним общим требованием: обеспечить ясное, человеческое и безупречное сопровождение на каждом этапе. Французский, английский, иврит и русский — наши команды работают с международной клиентурой плавно и точно. Глубоко укоренившись в израильском рынке недвижимости, наши агенты лично сопровождают каждый проект — от первого контакта до передачи ключей — с доступностью, деликатностью и приверженностью.',
    'Paragraphe d''intro de la section équipe'),

  -- ===== JOURNAL =====
  ('journal.hero.eyebrow',
    'journal',
    '— II. LE JOURNAL',
    '— II. THE JOURNAL',
    '— II. היומן',
    '— II. ЖУРНАЛ',
    'Surtitre de la page Journal'),
  ('journal.hero.title_part1',
    'journal',
    'Comprendre',
    'Understanding',
    'להבין',
    'Понять',
    'Titre Journal — 1ère ligne'),
  ('journal.hero.title_part2',
    'journal',
    'avant d''acheter.',
    'before you buy.',
    'לפני שאתם קונים.',
    'прежде чем покупать.',
    'Titre Journal — 2ème ligne italique'),
  ('journal.hero.intro',
    'journal',
    'Quarante-sept articles publiés depuis 2019 — sur l''immobilier israélien, l''aliyah, la fiscalité FR/IL, les quartiers, les notaires. Des analyses honnêtes, jamais commerciales.',
    'Forty-seven articles published since 2019 — on Israeli real estate, aliyah, FR/IL taxation, neighbourhoods and notaries. Honest analyses, never commercial.',
    'ארבעים ושבעה מאמרים פורסמו מאז 2019 — על נדל"ן בישראל, עלייה, מיסוי צרפתי-ישראלי, שכונות ונוטריונים. ניתוחים ישרים, לעולם לא מסחריים.',
    'Сорок семь статей с 2019 года — об израильской недвижимости, алии, налогообложении FR/IL, районах и нотариусах. Честный анализ, никогда коммерческий.',
    'Paragraphe d''intro de la page Journal')
ON CONFLICT (key) DO NOTHING;
