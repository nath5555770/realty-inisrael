/* ==========================================================================
   SHAHAR LEVI REAL ESTATE — Internationalisation (FR / EN / HE / RU)
   Smart phrase-based translation that walks the DOM and swaps known phrases.
   No HTML markup changes required — works with the existing French content.
   ========================================================================== */
(function () {
  'use strict';

  const STORAGE_KEY = 'sl-lang';
  const SUPPORTED = ['fr', 'en', 'he', 'ru'];

  // ---- Dictionary ---------------------------------------------------------
  // Keys are the original French strings (trimmed). Values are the EN / HE.
  // Whenever you add/change French copy, add the matching EN+HE entry here.
  const DICT = {
    en: {
      // Top bar
      'EN LIGNE · LUN—JEU 9H—18H IST': 'ONLINE · MON—THU 9AM—6PM IST',
      'EN LIGNE': 'ONLINE',
      'MOSSI\'A #4218': 'LICENSE #4218',

      // Header / nav
      'Accueil': 'Home',
      'Portefeuille': 'Portfolio',
      "L'Agence": 'The Agency',
      'Aliyah': 'Aliyah',
      'Journal': 'Journal',
      'Contact': 'Contact',
      'Cabinet privé': 'Private office',
      'Cabinet privé →': 'Private office →',

      // Mobile menu / footer
      'MENTIONS': 'LEGAL',
      'RGPD': 'GDPR',
      'HONORAIRES': 'FEES',
      'NAVIGATION': 'NAVIGATION',
      'VILLES': 'CITIES',
      'CONTACT': 'CONTACT',

      // Hero (index)
      "L'immobilier israélien,": 'Israeli real estate,',
      'en français.': 'in French.',
      "Maison de courtage indépendante fondée à Tel Aviv en 2014. Acquisitions et cessions privées sur invitation, accompagnement aliyah, investissement patrimonial — pour une clientèle francophone exigeante.": 'Independent brokerage house founded in Tel Aviv in 2014. Off-market acquisitions and disposals, aliyah support, patrimonial investment — for a discerning French-speaking clientele.',
      'Voir le portefeuille (19) →': 'View portfolio (19) →',
      'Confier un mandat': 'Entrust a mandate',
      'défiler': 'scroll',
      '— MAISON DEPUIS MMXIV · TEL AVIV · PARIS': '— ESTABLISHED MMXIV · TEL AVIV · PARIS',
      '— TEL AVIV · HERZLIYA · CAESAREA · NETANYA · JÉRUSALEM': '— TEL AVIV · HERZLIYA · CAESAREA · NETANYA · JERUSALEM',

      // Trust band
      '— EXPÉRIENCE': '— EXPERIENCE',
      '— CESSIONS': '— TRANSACTIONS',
      '— FAMILLES': '— FAMILIES',
      '— FRANCOPHONIE': '— FRENCH-SPEAKING',
      'ans': 'years',
      'sur le marché israélien': 'on the Israeli market',
      'de transactions accompagnées': 'in advised transactions',
      'familles francophones': 'French-speaking families',
      'tout en français · A à Z': 'fully in French · A to Z',

      // Sélection
      '— Sélection · printemps MMXXVI': '— Spring MMXXVI selection',
      'Trois pièces': 'Three pieces',
      'de notre portefeuille.': 'from our portfolio.',
      'Un aperçu des dix-neuf biens disponibles. Chaque pièce porte une référence, une provenance, et l\'accord explicite des propriétaires.': 'A preview of the nineteen available properties. Each piece carries a reference, provenance, and the explicit consent of its owners.',
      'VOIR TOUT LE PORTEFEUILLE (19) →': 'VIEW THE FULL PORTFOLIO (19) →',
      'Découvrir les 19 biens →': 'Discover all 19 properties →',
      '5 PIÈCES': '5 ROOMS',
      '9 PIÈCES · VUE MER': '9 ROOMS · SEA VIEW',
      '8 P · 600 M² JARDIN': '8 R · 600 M² GARDEN',
      'Penthouse': 'Penthouse',
      'Villa': 'Villa',
      'Akirov.': 'Akirov.',
      'Carmel.': 'Carmel.',
      'front de mer.': 'oceanfront.',

      // Manifesto
      '— La maison': '— The house',
      'd\'exception': 'exceptional',
      'rencontres improbables.': 'improbable encounters.',
      'Découvrir l\'agence →': 'Discover the agency →',

      // Cities
      '— Couverture territoriale': '— Territorial coverage',
      'Cinq villes,': 'Five cities,',
      'une équipe.': 'one team.',
      '— 8 BIENS': '— 8 PROPERTIES',
      '— 4 BIENS': '— 4 PROPERTIES',
      '— 3 BIENS': '— 3 PROPERTIES',
      '— 2 BIENS': '— 2 PROPERTIES',
      'Tel Aviv': 'Tel Aviv',
      'Herzliya': 'Herzliya',
      'Caesarea': 'Caesarea',
      'Netanya': 'Netanya',
      'Jérusalem': 'Jerusalem',

      // Portefeuille page
      'Notre portefeuille': 'Our portfolio',
      "Dix-neuf pièces signées par la maison.": 'Nineteen properties curated by the house.',
      'Filtrer par ville': 'Filter by city',
      'Toutes les villes': 'All cities',
      'Tous les types': 'All types',
      'Tous les budgets': 'All budgets',
      'Réinitialiser': 'Reset',
      'Découvrir': 'Discover',
      'En savoir plus': 'Learn more',
      'biens disponibles': 'properties available',
      'biens en portefeuille': 'properties in portfolio',
      'À VENDRE': 'FOR SALE',
      'CONFIDENTIEL': 'CONFIDENTIAL',
      'NOUVEAU': 'NEW',
      'EXCLUSIVITÉ': 'EXCLUSIVE',

      // Agence page
      'La maison': 'The house',
      'Notre méthode': 'Our method',
      'Notre équipe': 'Our team',
      'Distinctions': 'Awards',
      'Presse': 'Press',
      'Nos engagements': 'Our commitments',
      'Lire le manifeste': 'Read the manifesto',
      'Fondatrice': 'Founder',
      'Directrice associée': 'Associate Director',
      'Conseiller principal': 'Senior advisor',
      "— III. L'équipe": '— III. The team',
      'Une équipe': 'A team',
      'à taille humaine.': 'on a human scale.',
      'Six visages, cinq langues, une exigence commune : que vous compreniez chaque ligne, à chaque étape. Nous ne déléguons rien — chaque dossier est suivi par la même personne, du premier rendez-vous à la remise des clés.': "Six faces, five languages, one shared standard: that you understand every line, at every step. We delegate nothing — each file is handled by the same person, from the first meeting to the handover of keys.",
      'Huit visages, six langues, une exigence commune : que vous compreniez chaque ligne, à chaque étape. Nous ne déléguons rien — chaque dossier est suivi par la même personne, du premier rendez-vous à la remise des clés.': 'Eight faces, six languages, one shared standard: that you understand every line, at every step. We delegate nothing — each file is handled by the same person, from the first meeting to the handover of keys.',
      '— DIRECTEUR FONDATEUR · MMXIV': '— FOUNDING DIRECTOR · MMXIV',
      'Fondateur de la maison à Tel Aviv en 2014, après dix années en finance entre Paris et Londres. Il pilote la stratégie globale, les négociations sensibles et les relations avec les familles propriétaires.': 'Founder of the house in Tel Aviv in 2014, after a decade in finance between Paris and London. He leads global strategy, sensitive negotiations and relationships with owning families.',
      "— DIRECTRICE D'AGENCE · MMXVIII": '— MANAGING DIRECTOR · MMXVIII',
      "Parisienne d'origine, Nathalie pilote l'ensemble du cabinet francophone. Elle accompagne plus de 80 % de la clientèle française, suisse et belge — du premier rendez-vous parisien jusqu'à la remise des clés à Herzliya.": 'Parisian by origin, Nathalie leads the entire French-speaking practice. She personally guides over 80% of French, Swiss and Belgian clients — from the first Paris meeting to the handover of keys in Herzliya.',
      'Prendre rendez-vous avec la direction →': 'Book an appointment with the leadership →',
      'Six conseiller·ère·s,': 'Six advisors,',
      'six langues maîtrisées.': 'six mastered languages.',
      'CONSEILLÈRE ANGLOPHONE': 'ENGLISH-SPEAKING ADVISOR',
      'Clientèle internationale anglophone. Investisseurs étrangers, expatriés, primo-acquéreurs en Israël.': 'International English-speaking clientele. Foreign investors, expatriates, first-time buyers in Israel.',
      "Parisienne d'origine, Nathalie pilote l'ensemble du cabinet francophone depuis Tel Aviv. Elle accompagne plus de 80 % de la clientèle française, suisse et belge — du premier rendez-vous parisien jusqu'à la remise des clés à Herzliya. Elle parle votre langue, comprend votre fiscalité, et tient à ce que vous lisiez chaque ligne avant de signer.": 'Parisian by origin, Nathalie leads the entire French-speaking practice from Tel Aviv. She personally guides over 80% of French, Swiss and Belgian clients — from the first Paris meeting to the handover of keys in Herzliya. She speaks your language, understands your tax framework, and insists you read every line before signing.',
      'Son cabinet privé reçoit sur rendez-vous, à Paris (8ᵉ) comme à Tel Aviv (Rothschild). Discrétion absolue, méthode tranquille, exigence sans concession.': 'Her private office receives by appointment only, in Paris (8th arr.) as in Tel Aviv (Rothschild). Absolute discretion, quiet method, uncompromising standards.',
      '— FORMATION': '— EDUCATION',
      '— LANGUES': '— LANGUAGES',
      'Sciences Po Paris': 'Sciences Po Paris',
      'EM Lyon · MBA Real Estate': 'EM Lyon · MBA Real Estate',
      'Membre FNAIM, FIABCI': 'FNAIM, FIABCI member',
      'Français': 'French',
      'Hébreu': 'Hebrew',
      'Anglais': 'English',
      'Russe': 'Russian',
      'Prendre rendez-vous →': 'Book an appointment →',
      '— LE CABINET': '— THE OFFICE',
      'Cinq conseiller·ère·s,': 'Five advisors,',
      'cinq langues maîtrisées.': 'five mastered languages.',
      'CONSEILLÈRE SENIOR': 'SENIOR ADVISOR',
      'CONSEILLER': 'ADVISOR',
      'CONSEILLÈRE': 'ADVISOR',
      'CONSEILLÈRE INTERNATIONALE': 'INTERNATIONAL ADVISOR',
      'CONSEILLÈRE · ALIYAH': 'ADVISOR · ALIYAH',
      'Tel Aviv & Herzliya. Spécialiste des biens en bord de mer et des résidences secondaires francophones.': 'Tel Aviv & Herzliya. Specialist in seafront properties and French-speaking second residences.',
      'Jérusalem & Netanya. Connaissance fine des quartiers résidentiels francophones et des projets neufs.': 'Jerusalem & Netanya. Deep knowledge of French-speaking residential districts and new-build projects.',
      "Caesarea & côte nord. Villas, golfs, biens d'exception — un œil pour la pierre rare.": 'Caesarea & northern coast. Villas, golf properties, exceptional homes — an eye for rare stone.',
      'Clientèle anglophone et russophone. Investissement patrimonial, structuration internationale.': 'English- and Russian-speaking clientele. Patrimonial investment, international structuring.',
      'Première installation et accompagnement aliyah. Du Misrad Haklita à la remise des clés.': 'First settlement and aliyah support. From Misrad Haklita to the handover of keys.',
      '— UNE MAISON · UN INTERLOCUTEUR': '— ONE HOUSE · ONE CONTACT',
      'Chaque dossier est porté par un·e seul·e conseiller·ère, soutenu·e par la directrice. Pas de hand-off, pas de relais, pas de mauvaise surprise.': 'Each file is handled by a single advisor, supported by the director. No hand-offs, no relays, no unpleasant surprises.',
      'Nous rencontrer →': 'Meet us →',

      // Aliyah page
      'Votre aliyah, accompagnée.': 'Your aliyah, supported.',
      'Sept étapes pour s\'installer en Israël.': 'Seven steps to settle in Israel.',
      'Étape': 'Step',
      'Étapes': 'Steps',
      'Calculateur Mas Rechisha': 'Mas Rechisha calculator',
      'Calculer': 'Calculate',
      'Prix du bien (₪)': 'Property price (₪)',
      'Statut fiscal': 'Tax status',
      'Olé Hadash (nouvel immigrant)': 'Olé Hadash (new immigrant)',
      'Résident fiscal israélien': 'Israeli tax resident',
      'Investisseur étranger': 'Foreign investor',
      'Mas Rechisha estimé': 'Estimated Mas Rechisha',
      'Demander un accompagnement': 'Request guidance',

      // Journal page
      'Le Journal': 'The Journal',
      'Articles, analyses et regards sur le marché israélien.': 'Articles, analyses and perspectives on the Israeli market.',
      'Lire l\'article →': 'Read the article →',
      'Tous les articles': 'All articles',
      'Marché': 'Market',
      'Aliyah': 'Aliyah',
      'Patrimoine': 'Wealth',
      'Décryptage': 'Analysis',
      'Min de lecture': 'min read',

      // Contact page
      'Confions-nous.': 'Let us speak.',
      'Le premier échange est confidentiel et sans engagement.': 'The first exchange is confidential and without obligation.',
      'Nom': 'Name',
      'Prénom': 'First name',
      'Email': 'Email',
      'Téléphone': 'Phone',
      'Sujet': 'Subject',
      'Message': 'Message',
      'Envoyer le message': 'Send message',
      'Acquisition': 'Acquisition',
      'Cession': 'Disposal',
      'Conseil': 'Advice',
      'Aliyah': 'Aliyah',
      'Autre': 'Other',
      'Nos bureaux': 'Our offices',
      'Tel Aviv (siège)': 'Tel Aviv (headquarters)',
      'Paris (représentation)': 'Paris (representation)',
      'Sur rendez-vous uniquement.': 'By appointment only.',
      'Questions fréquentes': 'Frequently asked questions',

      // Honoraires
      'Nos honoraires': 'Our fees',
      'Transparence et clarté.': 'Transparency and clarity.',
      'Acquisition (côté acheteur)': 'Acquisition (buyer side)',
      'Cession (côté vendeur)': 'Disposal (seller side)',
      'Mandat exclusif': 'Exclusive mandate',
      'Conseil patrimonial': 'Wealth advisory',

      // Footer common
      '— Bureau & contact': '— Office & contact',
      'Tel Aviv 6688314 · Israël': 'Tel Aviv 6688314 · Israel',

      // Misc
      'En savoir +': 'Learn more',
      'Retour': 'Back',
      'Suivant': 'Next',
      'Précédent': 'Previous',
      'Voir tout': 'View all',
      'Page non trouvée': 'Page not found',
      "La page que vous cherchez n'existe pas ou a été déplacée.": "The page you're looking for doesn't exist or has been moved.",
      'Retour à l\'accueil': 'Back to home'
    },

    he: {
      // Top bar
      'EN LIGNE · LUN—JEU 9H—18H IST': 'מקוון · ב׳—ה׳ 9:00—18:00 IST',
      'EN LIGNE': 'מקוון',
      'MOSSI\'A #4218': 'רישיון #4218',

      // Header / nav
      'Accueil': 'בית',
      'Portefeuille': 'תיק נכסים',
      "L'Agence": 'הסוכנות',
      'Aliyah': 'עלייה',
      'Journal': 'יומן',
      'Contact': 'צור קשר',
      'Cabinet privé': 'משרד פרטי',
      'Cabinet privé →': '← משרד פרטי',

      // Footer
      'MENTIONS': 'תנאים',
      'RGPD': 'פרטיות',
      'HONORAIRES': 'עמלות',
      'NAVIGATION': 'ניווט',
      'VILLES': 'ערים',
      'CONTACT': 'צור קשר',

      // Hero
      "L'immobilier israélien,": 'נדל״ן ישראלי,',
      'en français.': 'בצרפתית.',
      "Maison de courtage indépendante fondée à Tel Aviv en 2014. Acquisitions et cessions privées sur invitation, accompagnement aliyah, investissement patrimonial — pour une clientèle francophone exigeante.": 'בית תיווך עצמאי שהוקם בתל אביב בשנת 2014. רכישות ומכירות פרטיות בהזמנה, ליווי לעלייה והשקעה בנכסים — עבור לקוחות דוברי צרפתית תובעניים.',
      'Voir le portefeuille (19) →': '← צפו בתיק הנכסים (19)',
      'Confier un mandat': 'הפקדת ייפוי כוח',
      'défiler': 'גלילה',
      '— MAISON DEPUIS MMXIV · TEL AVIV · PARIS': '— מאז MMXIV · תל אביב · פריז',
      '— TEL AVIV · HERZLIYA · CAESAREA · NETANYA · JÉRUSALEM': '— תל אביב · הרצליה · קיסריה · נתניה · ירושלים',

      // Trust band
      '— EXPÉRIENCE': '— ניסיון',
      '— CESSIONS': '— עסקאות',
      '— FAMILLES': '— משפחות',
      '— FRANCOPHONIE': '— צרפתית',
      'ans': 'שנים',
      'sur le marché israélien': 'בשוק הישראלי',
      'de transactions accompagnées': 'עסקאות מלוות',
      'familles francophones': 'משפחות דוברות צרפתית',
      'tout en français · A à Z': 'הכל בצרפתית · מא׳ עד ת׳',

      // Sélection
      '— Sélection · printemps MMXXVI': '— מבחר · אביב MMXXVI',
      'Trois pièces': 'שלושה נכסים',
      'de notre portefeuille.': 'מתיק הנכסים שלנו.',
      "Un aperçu des dix-neuf biens disponibles. Chaque pièce porte une référence, une provenance, et l'accord explicite des propriétaires.": 'סקירה של תשעה-עשר הנכסים הזמינים. לכל נכס יש מספר ייחודי, מקור והסכמה מפורשת מהבעלים.',
      'VOIR TOUT LE PORTEFEUILLE (19) →': '← צפו בתיק הנכסים המלא (19)',
      'Découvrir les 19 biens →': '← גלו את 19 הנכסים',
      '5 PIÈCES': '5 חדרים',
      '9 PIÈCES · VUE MER': '9 חדרים · נוף לים',
      '8 P · 600 M² JARDIN': '8 ח׳ · גינה 600 מ״ר',
      'Penthouse': 'פנטהאוז',
      'Villa': 'וילה',
      'Akirov.': 'אקירוב.',
      'Carmel.': 'הכרמל.',
      'front de mer.': 'על קו החוף.',

      // Manifesto
      '— La maison': '— הבית',
      "d'exception": 'יוצא דופן',
      'rencontres improbables.': 'מפגשים בלתי צפויים.',
      "Découvrir l'agence →": '← גלו את הסוכנות',

      // Cities
      '— Couverture territoriale': '— כיסוי גיאוגרפי',
      'Cinq villes,': 'חמש ערים,',
      'une équipe.': 'צוות אחד.',
      '— 8 BIENS': '— 8 נכסים',
      '— 4 BIENS': '— 4 נכסים',
      '— 3 BIENS': '— 3 נכסים',
      '— 2 BIENS': '— 2 נכסים',
      'Tel Aviv': 'תל אביב',
      'Herzliya': 'הרצליה',
      'Caesarea': 'קיסריה',
      'Netanya': 'נתניה',
      'Jérusalem': 'ירושלים',

      // Portefeuille page
      'Notre portefeuille': 'תיק הנכסים שלנו',
      'Dix-neuf pièces signées par la maison.': 'תשעה-עשר נכסים בחתימת הבית.',
      'Filtrer par ville': 'סינון לפי עיר',
      'Toutes les villes': 'כל הערים',
      'Tous les types': 'כל הסוגים',
      'Tous les budgets': 'כל התקציבים',
      'Réinitialiser': 'איפוס',
      'Découvrir': 'גלו',
      'En savoir plus': 'מידע נוסף',
      'biens disponibles': 'נכסים זמינים',
      'biens en portefeuille': 'נכסים בתיק',
      'À VENDRE': 'למכירה',
      'CONFIDENTIEL': 'חסוי',
      'NOUVEAU': 'חדש',
      'EXCLUSIVITÉ': 'בלעדי',

      // Agence page
      'La maison': 'הבית',
      'Notre méthode': 'השיטה שלנו',
      'Notre équipe': 'הצוות שלנו',
      'Distinctions': 'פרסים',
      'Presse': 'עיתונות',
      'Nos engagements': 'ההתחייבויות שלנו',
      'Lire le manifeste': 'קראו את המניפסט',
      'Fondatrice': 'מייסדת',
      'Directrice associée': 'מנהלת שותפה',
      'Conseiller principal': 'יועץ ראשי',
      "— III. L'équipe": '— III. הצוות',
      'Une équipe': 'צוות',
      'à taille humaine.': 'בקנה מידה אנושי.',
      'Six visages, cinq langues, une exigence commune : que vous compreniez chaque ligne, à chaque étape. Nous ne déléguons rien — chaque dossier est suivi par la même personne, du premier rendez-vous à la remise des clés.': 'שישה פרצופים, חמש שפות, סטנדרט משותף אחד: שתבינו כל שורה, בכל שלב. אנו לא מאצילים דבר — כל תיק מטופל על ידי אותו אדם, מהפגישה הראשונה עד מסירת המפתחות.',
      'Huit visages, six langues, une exigence commune : que vous compreniez chaque ligne, à chaque étape. Nous ne déléguons rien — chaque dossier est suivi par la même personne, du premier rendez-vous à la remise des clés.': 'שמונה פרצופים, שש שפות, סטנדרט משותף אחד: שתבינו כל שורה, בכל שלב. אנו לא מאצילים דבר — כל תיק מטופל על ידי אותו אדם, מהפגישה הראשונה עד מסירת המפתחות.',
      '— DIRECTEUR FONDATEUR · MMXIV': '— מייסד ומנהל · MMXIV',
      'Fondateur de la maison à Tel Aviv en 2014, après dix années en finance entre Paris et Londres. Il pilote la stratégie globale, les négociations sensibles et les relations avec les familles propriétaires.': 'מייסד הבית בתל אביב בשנת 2014, לאחר עשור בעולם הפיננסים בין פריז ללונדון. הוא מוביל את האסטרטגיה הכוללת, משאים ומתנים רגישים והקשרים עם משפחות הבעלים.',
      "— DIRECTRICE D'AGENCE · MMXVIII": '— מנהלת הסוכנות · MMXVIII',
      "Parisienne d'origine, Nathalie pilote l'ensemble du cabinet francophone. Elle accompagne plus de 80 % de la clientèle française, suisse et belge — du premier rendez-vous parisien jusqu'à la remise des clés à Herzliya.": 'נטלי, פריזאית במקור, מנהלת את כל הפרקטיקה דוברת הצרפתית. היא מלווה למעלה מ-80% מהלקוחות הצרפתים, השוויצרים והבלגים — מהפגישה הראשונה בפריז ועד מסירת המפתחות בהרצליה.',
      'Prendre rendez-vous avec la direction →': '← קביעת פגישה עם ההנהלה',
      'Six conseiller·ère·s,': 'שישה יועצים,',
      'six langues maîtrisées.': 'שש שפות שולטות.',
      'CONSEILLÈRE ANGLOPHONE': 'יועצת דוברת אנגלית',
      'Clientèle internationale anglophone. Investisseurs étrangers, expatriés, primo-acquéreurs en Israël.': 'לקוחות בינלאומיים דוברי אנגלית. משקיעים זרים, אקספטים, רוכשים ראשונים בישראל.',
      "Parisienne d'origine, Nathalie pilote l'ensemble du cabinet francophone depuis Tel Aviv. Elle accompagne plus de 80 % de la clientèle française, suisse et belge — du premier rendez-vous parisien jusqu'à la remise des clés à Herzliya. Elle parle votre langue, comprend votre fiscalité, et tient à ce que vous lisiez chaque ligne avant de signer.": 'נטלי, פריזאית במקור, מנהלת את כל הפרקטיקה דוברת הצרפתית מתל אביב. היא מלווה למעלה מ-80% מהלקוחות הצרפתים, השוויצרים והבלגים — מהפגישה הראשונה בפריז ועד מסירת המפתחות בהרצליה. היא דוברת את שפתכם, מבינה את המסגרת המיסויית שלכם ועומדת על כך שתקראו כל שורה לפני החתימה.',
      'Son cabinet privé reçoit sur rendez-vous, à Paris (8ᵉ) comme à Tel Aviv (Rothschild). Discrétion absolue, méthode tranquille, exigence sans concession.': 'משרדה הפרטי מקבל בתיאום מראש בלבד, בפריז (הרובע ה-8) ובתל אביב (רוטשילד). דיסקרטיות מוחלטת, שיטה רגועה, סטנדרטים ללא פשרות.',
      '— FORMATION': '— השכלה',
      '— LANGUES': '— שפות',
      'Sciences Po Paris': "Sciences Po פריז",
      'EM Lyon · MBA Real Estate': 'EM Lyon · MBA נדל״ן',
      'Membre FNAIM, FIABCI': 'חברה ב-FNAIM, FIABCI',
      'Français': 'צרפתית',
      'Hébreu': 'עברית',
      'Anglais': 'אנגלית',
      'Russe': 'רוסית',
      'Prendre rendez-vous →': '← קביעת פגישה',
      '— LE CABINET': '— המשרד',
      'Cinq conseiller·ère·s,': 'חמישה יועצים,',
      'cinq langues maîtrisées.': 'חמש שפות שולטות.',
      'CONSEILLÈRE SENIOR': 'יועצת בכירה',
      'CONSEILLER': 'יועץ',
      'CONSEILLÈRE': 'יועצת',
      'CONSEILLÈRE INTERNATIONALE': 'יועצת בינלאומית',
      'CONSEILLÈRE · ALIYAH': 'יועצת · עלייה',
      'Tel Aviv & Herzliya. Spécialiste des biens en bord de mer et des résidences secondaires francophones.': 'תל אביב והרצליה. מומחית לנכסי חוף ולבתי נופש דוברי צרפתית.',
      'Jérusalem & Netanya. Connaissance fine des quartiers résidentiels francophones et des projets neufs.': 'ירושלים ונתניה. ידע מעמיק בשכונות מגורים דוברות צרפתית ופרויקטים חדשים.',
      "Caesarea & côte nord. Villas, golfs, biens d'exception — un œil pour la pierre rare.": 'קיסריה והחוף הצפוני. וילות, נכסי גולף, בתים יוצאי דופן — עין לאבן נדירה.',
      'Clientèle anglophone et russophone. Investissement patrimonial, structuration internationale.': 'לקוחות דוברי אנגלית ורוסית. השקעות נכסים, מבנה בינלאומי.',
      'Première installation et accompagnement aliyah. Du Misrad Haklita à la remise des clés.': 'התיישבות ראשונית וליווי עלייה. ממשרד הקליטה ועד מסירת המפתחות.',
      '— UNE MAISON · UN INTERLOCUTEUR': '— בית אחד · איש קשר אחד',
      'Chaque dossier est porté par un·e seul·e conseiller·ère, soutenu·e par la directrice. Pas de hand-off, pas de relais, pas de mauvaise surprise.': 'כל תיק מטופל על ידי יועץ יחיד, בליווי המנהלת. ללא העברות, ללא מתווכים, ללא הפתעות.',
      'Nous rencontrer →': '← להיפגש איתנו',

      // Aliyah
      'Votre aliyah, accompagnée.': 'העלייה שלכם, בליווי מקצועי.',
      "Sept étapes pour s'installer en Israël.": 'שבעה שלבים להתיישבות בישראל.',
      'Étape': 'שלב',
      'Étapes': 'שלבים',
      'Calculateur Mas Rechisha': 'מחשבון מס רכישה',
      'Calculer': 'חשב',
      'Prix du bien (₪)': 'מחיר הנכס (₪)',
      'Statut fiscal': 'סטטוס מס',
      'Olé Hadash (nouvel immigrant)': 'עולה חדש',
      'Résident fiscal israélien': 'תושב מס ישראלי',
      'Investisseur étranger': 'משקיע זר',
      'Mas Rechisha estimé': 'אומדן מס רכישה',
      'Demander un accompagnement': 'בקשה לליווי',

      // Journal
      'Le Journal': 'היומן',
      'Articles, analyses et regards sur le marché israélien.': 'מאמרים, ניתוחים ומבטים על השוק הישראלי.',
      "Lire l'article →": '← קראו את המאמר',
      'Tous les articles': 'כל המאמרים',
      'Marché': 'שוק',
      'Patrimoine': 'נכסים',
      'Décryptage': 'ניתוח',
      'Min de lecture': 'דקות קריאה',

      // Contact
      'Confions-nous.': 'בואו נדבר.',
      'Le premier échange est confidentiel et sans engagement.': 'השיחה הראשונה חסויה וללא התחייבות.',
      'Nom': 'שם משפחה',
      'Prénom': 'שם פרטי',
      'Email': 'דוא״ל',
      'Téléphone': 'טלפון',
      'Sujet': 'נושא',
      'Message': 'הודעה',
      'Envoyer le message': 'שלח הודעה',
      'Acquisition': 'רכישה',
      'Cession': 'מכירה',
      'Conseil': 'ייעוץ',
      'Autre': 'אחר',
      'Nos bureaux': 'המשרדים שלנו',
      'Tel Aviv (siège)': 'תל אביב (המשרד הראשי)',
      'Paris (représentation)': 'פריז (נציגות)',
      'Sur rendez-vous uniquement.': 'בתיאום מראש בלבד.',
      'Questions fréquentes': 'שאלות נפוצות',

      // Honoraires
      'Nos honoraires': 'העמלות שלנו',
      'Transparence et clarté.': 'שקיפות ובהירות.',
      'Acquisition (côté acheteur)': 'רכישה (צד קונה)',
      'Cession (côté vendeur)': 'מכירה (צד מוכר)',
      'Mandat exclusif': 'ייפוי כוח בלעדי',
      'Conseil patrimonial': 'ייעוץ נכסים',

      // Footer common
      '— Bureau & contact': '— משרד וצור קשר',
      'Tel Aviv 6688314 · Israël': 'תל אביב 6688314 · ישראל',

      // Misc
      'En savoir +': 'מידע נוסף',
      'Retour': 'חזרה',
      'Suivant': 'הבא',
      'Précédent': 'הקודם',
      'Voir tout': 'הצג הכל',
      'Page non trouvée': 'הדף לא נמצא',
      "La page que vous cherchez n'existe pas ou a été déplacée.": 'הדף שחיפשתם לא קיים או הועבר.',
      "Retour à l'accueil": 'חזרה לעמוד הבית'
    },

    ru: {
      // Top bar
      'EN LIGNE · LUN—JEU 9H—18H IST': 'ОНЛАЙН · ПН—ЧТ 9:00—18:00 IST',
      'EN LIGNE': 'ОНЛАЙН',
      "MOSSI'A #4218": 'ЛИЦЕНЗИЯ #4218',

      // Header / nav
      'Accueil': 'Главная',
      'Portefeuille': 'Портфолио',
      "L'Agence": 'Агентство',
      'Aliyah': 'Алия',
      'Journal': 'Журнал',
      'Contact': 'Контакты',
      'Cabinet privé': 'Частный кабинет',
      'Cabinet privé →': 'Частный кабинет →',

      // Footer
      'MENTIONS': 'УСЛОВИЯ',
      'RGPD': 'GDPR',
      'HONORAIRES': 'УСЛУГИ',
      'NAVIGATION': 'НАВИГАЦИЯ',
      'VILLES': 'ГОРОДА',
      'CONTACT': 'КОНТАКТЫ',
      'NOUS SUIVRE': 'СЛЕДИТЕ ЗА НАМИ',
      '— NOUS SUIVRE': '— СЛЕДИТЕ ЗА НАМИ',

      // Hero
      "L'immobilier israélien,": 'Недвижимость Израиля,',
      'en français.': 'на французском.',
      "Maison de courtage indépendante fondée à Tel Aviv en 2014. Acquisitions et cessions privées sur invitation, accompagnement aliyah, investissement patrimonial — pour une clientèle francophone exigeante.": 'Независимое брокерское агентство, основанное в Тель-Авиве в 2014 году. Частные приобретения и продажи по приглашению, сопровождение алии, имущественные инвестиции — для требовательной франкоязычной клиентуры.',
      'Voir le portefeuille (19) →': 'Посмотреть портфолио (19) →',
      'Confier un mandat': 'Передать мандат',
      'défiler': 'листать',
      '— MAISON DEPUIS MMXIV · TEL AVIV · PARIS': '— ДОМ С MMXIV · ТЕЛЬ-АВИВ · ПАРИЖ',
      '— TEL AVIV · HERZLIYA · CAESAREA · NETANYA · JÉRUSALEM': '— ТЕЛЬ-АВИВ · ГЕРЦЛИЯ · КЕСАРИЯ · НЕТАНИЯ · ИЕРУСАЛИМ',

      // Trust band
      '— EXPÉRIENCE': '— ОПЫТ',
      '— CESSIONS': '— СДЕЛКИ',
      '— FAMILLES': '— СЕМЬИ',
      '— FRANCOPHONIE': '— ФРАНЦУЗСКИЙ',
      'ans': 'лет',
      'sur le marché israélien': 'на израильском рынке',
      'de transactions accompagnées': 'сопровождённых сделок',
      'familles francophones': 'франкоязычных семей',
      'tout en français · A à Z': 'всё на французском · от А до Я',

      // Sélection
      '— Sélection · printemps MMXXVI': '— Подборка · весна MMXXVI',
      'Trois pièces': 'Три объекта',
      'de notre portefeuille.': 'из нашего портфолио.',
      "Un aperçu des dix-neuf biens disponibles. Chaque pièce porte une référence, une provenance, et l'accord explicite des propriétaires.": 'Обзор девятнадцати доступных объектов. Каждый объект имеет номер, происхождение и явное согласие владельцев.',
      'VOIR TOUT LE PORTEFEUILLE (19) →': 'СМОТРЕТЬ ВСЁ ПОРТФОЛИО (19) →',
      'Découvrir les 19 biens →': 'Открыть 19 объектов →',
      '5 PIÈCES': '5 КОМНАТ',
      '9 PIÈCES · VUE MER': '9 КОМНАТ · ВИД НА МОРЕ',
      '8 P · 600 M² JARDIN': '8 К · САД 600 М²',
      'Penthouse': 'Пентхаус',
      'Villa': 'Вилла',
      'Akirov.': 'Акиров.',
      'Carmel.': 'Кармель.',
      'front de mer.': 'на берегу моря.',

      // Manifesto
      '— La maison': '— Дом',
      "d'exception": 'исключительная',
      'rencontres improbables.': 'невероятные встречи.',
      "Découvrir l'agence →": 'Открыть агентство →',

      // Cities
      '— Couverture territoriale': '— Территориальное покрытие',
      'Cinq villes,': 'Пять городов,',
      'une équipe.': 'одна команда.',
      '— 8 BIENS': '— 8 ОБЪЕКТОВ',
      '— 4 BIENS': '— 4 ОБЪЕКТА',
      '— 3 BIENS': '— 3 ОБЪЕКТА',
      '— 2 BIENS': '— 2 ОБЪЕКТА',
      'Tel Aviv': 'Тель-Авив',
      'Herzliya': 'Герцлия',
      'Caesarea': 'Кесария',
      'Netanya': 'Нетания',
      'Jérusalem': 'Иерусалим',

      // Portefeuille page
      'Notre portefeuille': 'Наше портфолио',
      'Dix-neuf pièces signées par la maison.': 'Девятнадцать объектов от нашего дома.',
      'Filtrer par ville': 'Фильтр по городу',
      'Toutes les villes': 'Все города',
      'Tous les types': 'Все типы',
      'Tous les budgets': 'Все бюджеты',
      'Réinitialiser': 'Сбросить',
      'Découvrir': 'Открыть',
      'En savoir plus': 'Узнать больше',
      'biens disponibles': 'доступных объектов',
      'biens en portefeuille': 'объектов в портфолио',
      'À VENDRE': 'ПРОДАЁТСЯ',
      'CONFIDENTIEL': 'КОНФИДЕНЦИАЛЬНО',
      'NOUVEAU': 'НОВОЕ',
      'EXCLUSIVITÉ': 'ЭКСКЛЮЗИВ',

      // Agence page
      'La maison': 'Дом',
      'Notre méthode': 'Наш метод',
      'Notre équipe': 'Наша команда',
      'Distinctions': 'Награды',
      'Presse': 'Пресса',
      'Nos engagements': 'Наши обязательства',
      'Lire le manifeste': 'Читать манифест',
      'Fondatrice': 'Основательница',
      'Directrice associée': 'Ассоциированный директор',
      'Conseiller principal': 'Главный консультант',
      'Six visages, cinq langues, une exigence commune : que vous compreniez chaque ligne, à chaque étape. Nous ne déléguons rien — chaque dossier est suivi par la même personne, du premier rendez-vous à la remise des clés.': 'Шесть лиц, пять языков, одно общее требование: чтобы вы понимали каждую строку на каждом этапе. Мы ничего не делегируем — каждое дело ведёт один и тот же человек, от первой встречи до передачи ключей.',
      'Huit visages, six langues, une exigence commune : que vous compreniez chaque ligne, à chaque étape. Nous ne déléguons rien — chaque dossier est suivi par la même personne, du premier rendez-vous à la remise des clés.': 'Восемь лиц, шесть языков, одно общее требование: чтобы вы понимали каждую строку на каждом этапе. Мы ничего не делегируем — каждое дело ведёт один и тот же человек, от первой встречи до передачи ключей.',
      '— DIRECTEUR FONDATEUR · MMXIV': '— ДИРЕКТОР-ОСНОВАТЕЛЬ · MMXIV',
      'Fondateur de la maison à Tel Aviv en 2014, après dix années en finance entre Paris et Londres. Il pilote la stratégie globale, les négociations sensibles et les relations avec les familles propriétaires.': 'Основатель дома в Тель-Авиве в 2014 году, после десяти лет работы в финансах между Парижем и Лондоном. Он руководит общей стратегией, деликатными переговорами и отношениями с семьями-владельцами.',
      "— DIRECTRICE D'AGENCE · MMXVIII": '— ДИРЕКТОР АГЕНТСТВА · MMXVIII',
      "Parisienne d'origine, Nathalie pilote l'ensemble du cabinet francophone. Elle accompagne plus de 80 % de la clientèle française, suisse et belge — du premier rendez-vous parisien jusqu'à la remise des clés à Herzliya.": 'Парижанка по происхождению, Натали руководит всей франкоязычной практикой. Она лично сопровождает более 80% французских, швейцарских и бельгийских клиентов — от первой встречи в Париже до передачи ключей в Герцлии.',
      'Prendre rendez-vous avec la direction →': 'Записаться на встречу с руководством →',
      'Six conseiller·ère·s,': 'Шесть консультантов,',
      'six langues maîtrisées.': 'шесть освоенных языков.',
      'CONSEILLÈRE ANGLOPHONE': 'АНГЛОЯЗЫЧНАЯ КОНСУЛЬТАНТКА',
      'Clientèle internationale anglophone. Investisseurs étrangers, expatriés, primo-acquéreurs en Israël.': 'Международная англоязычная клиентура. Иностранные инвесторы, экспаты, первые покупатели в Израиле.',
      'CONSEILLÈRE SENIOR': 'СТАРШАЯ КОНСУЛЬТАНТКА',
      'CONSEILLÈRE INTERNATIONALE': 'МЕЖДУНАРОДНАЯ КОНСУЛЬТАНТКА',
      'CONSEILLÈRE · ALIYAH': 'КОНСУЛЬТАНТКА · АЛИЯ',
      'CONSEILLER': 'КОНСУЛЬТАНТ',
      'Français': 'Французский',
      'Hébreu': 'Иврит',
      'Anglais': 'Английский',
      'Russe': 'Русский',

      // Aliyah page
      'Votre aliyah, accompagnée.': 'Ваша алия, с поддержкой.',
      "Sept étapes pour s'installer en Israël.": 'Семь шагов для переезда в Израиль.',
      'Étape': 'Шаг',
      'Étapes': 'Шаги',
      'Calculateur Mas Rechisha': 'Калькулятор Мас Рехиша',
      'Calculer': 'Рассчитать',
      'Prix du bien (₪)': 'Цена объекта (₪)',
      'Statut fiscal': 'Налоговый статус',
      'Olé Hadash (nouvel immigrant)': 'Оле Хадаш (новый репатриант)',
      'Résident fiscal israélien': 'Налоговый резидент Израиля',
      'Investisseur étranger': 'Иностранный инвестор',
      'Mas Rechisha estimé': 'Расчётный Мас Рехиша',
      'Demander un accompagnement': 'Запросить сопровождение',

      // Journal
      'Le Journal': 'Журнал',
      'Articles, analyses et regards sur le marché israélien.': 'Статьи, аналитика и взгляды на израильский рынок.',
      "Lire l'article →": 'Читать статью →',
      'Tous les articles': 'Все статьи',
      'Marché': 'Рынок',
      'Patrimoine': 'Имущество',
      'Décryptage': 'Анализ',
      'Min de lecture': 'мин чтения',

      // Contact
      'Confions-nous.': 'Доверьтесь нам.',
      'Le premier échange est confidentiel et sans engagement.': 'Первая беседа конфиденциальна и без обязательств.',
      'Nom': 'Фамилия',
      'Prénom': 'Имя',
      'Email': 'Эл. почта',
      'Téléphone': 'Телефон',
      'Sujet': 'Тема',
      'Message': 'Сообщение',
      'Envoyer le message': 'Отправить сообщение',
      'Acquisition': 'Приобретение',
      'Cession': 'Продажа',
      'Conseil': 'Консультация',
      'Autre': 'Другое',
      'Nos bureaux': 'Наши офисы',
      'Tel Aviv (siège)': 'Тель-Авив (главный офис)',
      'Paris (représentation)': 'Париж (представительство)',
      'Sur rendez-vous uniquement.': 'Только по записи.',
      'Questions fréquentes': 'Частые вопросы',

      // Honoraires
      'Nos honoraires': 'Наши гонорары',
      'Transparence et clarté.': 'Прозрачность и ясность.',
      'Acquisition (côté acheteur)': 'Приобретение (сторона покупателя)',
      'Cession (côté vendeur)': 'Продажа (сторона продавца)',
      'Mandat exclusif': 'Эксклюзивный мандат',
      'Conseil patrimonial': 'Консультация по имуществу',

      // Footer common
      '— Bureau & contact': '— Офис и контакты',
      'Tel Aviv 6688314 · Israël': 'Тель-Авив 6688314 · Израиль',

      // Misc
      'En savoir +': 'Узнать больше',
      'Retour': 'Назад',
      'Suivant': 'Далее',
      'Précédent': 'Предыдущий',
      'Voir tout': 'Смотреть всё',
      'Page non trouvée': 'Страница не найдена',
      "La page que vous cherchez n'existe pas ou a été déplacée.": 'Страница, которую вы ищете, не существует или была перемещена.',
      "Retour à l'accueil": 'Вернуться на главную'
    }
  };

  // Phrase keys (for ordered/longest-first replacement)
  const KEYS_EN = Object.keys(DICT.en).sort((a, b) => b.length - a.length);
  const KEYS_HE = Object.keys(DICT.he).sort((a, b) => b.length - a.length);
  const KEYS_RU = Object.keys(DICT.ru).sort((a, b) => b.length - a.length);

  // ---- Snapshot original FR text -----------------------------------------
  // We need to translate from FR every time, not from previously translated text.
  let snapshot = null;

  function takeSnapshot() {
    snapshot = new Map();
    walkText((node) => snapshot.set(node, node.nodeValue));
    // Snapshot translatable attributes too
    document.querySelectorAll('[placeholder], [title], [alt], [aria-label]').forEach((el) => {
      ['placeholder', 'title', 'alt', 'aria-label'].forEach((attr) => {
        if (el.hasAttribute(attr)) {
          if (!el.dataset.i18nAttrs) el.dataset.i18nAttrs = '';
          if (!el.dataset[`i18nOrig${attr}`]) el.dataset[`i18nOrig${attr}`] = el.getAttribute(attr);
        }
      });
    });
  }

  function walkText(callback) {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          const parent = node.parentNode;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.nodeName;
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
          if (parent.closest('[data-i18n-skip]')) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    let n;
    while ((n = walker.nextNode())) callback(n);
  }

  // ---- Apply ---------------------------------------------------------------
  function applyLang(lang) {
    if (!SUPPORTED.includes(lang)) lang = 'fr';
    if (!snapshot) takeSnapshot();

    // Restore original FR
    snapshot.forEach((origValue, node) => {
      if (node.nodeValue !== origValue) node.nodeValue = origValue;
    });
    document.querySelectorAll('[data-i18n-orig-placeholder], [data-i18n-orig-title], [data-i18n-orig-alt], [data-i18n-orig-aria-label]').forEach((el) => {
      ['placeholder', 'title', 'alt', 'aria-label'].forEach((attr) => {
        const key = `i18nOrig${attr}`;
        if (el.dataset[key]) el.setAttribute(attr, el.dataset[key]);
      });
    });

    // Update <html lang> + dir
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.body.classList.toggle('lang-he', lang === 'he');
    document.body.classList.toggle('lang-en', lang === 'en');
    document.body.classList.toggle('lang-fr', lang === 'fr');
    document.body.classList.toggle('lang-ru', lang === 'ru');

    if (lang === 'fr') {
      updateSwitcher(lang);
      return;
    }

    const dict = DICT[lang];
    const keys = lang === 'en' ? KEYS_EN : (lang === 'he' ? KEYS_HE : KEYS_RU);

    // Translate text nodes
    snapshot.forEach((origValue, node) => {
      const trimmed = origValue.trim();
      if (!trimmed) return;
      // Exact match first (most reliable)
      if (dict[trimmed]) {
        node.nodeValue = origValue.replace(trimmed, dict[trimmed]);
        return;
      }
      // Fallback: phrase replacement for nodes with mixed content
      let result = origValue;
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (result.indexOf(k) !== -1) {
          // Use split/join for global replacement without regex special-char risks
          result = result.split(k).join(dict[k]);
        }
      }
      if (result !== origValue) node.nodeValue = result;
    });

    // Translate attributes
    document.querySelectorAll('[data-i18n-orig-placeholder], [data-i18n-orig-title], [data-i18n-orig-alt], [data-i18n-orig-aria-label]').forEach((el) => {
      ['placeholder', 'title', 'alt', 'aria-label'].forEach((attr) => {
        const key = `i18nOrig${attr}`;
        const orig = el.dataset[key];
        if (!orig) return;
        const t = orig.trim();
        if (dict[t]) {
          el.setAttribute(attr, orig.replace(t, dict[t]));
        }
      });
    });

    updateSwitcher(lang);
  }

  // ---- Switcher UI --------------------------------------------------------
  function updateSwitcher(lang) {
    document.querySelectorAll('[data-lang]').forEach((el) => {
      const isActive = el.dataset.lang === lang;
      el.classList.toggle('opacity-100', isActive);
      el.classList.toggle('underline', isActive);
      el.classList.toggle('opacity-50', !isActive);
      el.classList.toggle('opacity-90', false);
      el.classList.toggle('hover:opacity-100', !isActive);
    });
  }

  function wireSwitcher() {
    // Find the FR / EN / HE links by text content and attach data-lang.
    const candidates = document.querySelectorAll('a, button');
    candidates.forEach((el) => {
      const txt = (el.textContent || '').trim().toUpperCase();
      if (txt === 'FR' || txt === 'EN' || txt === 'HE' || txt === 'RU') {
        el.dataset.lang = txt.toLowerCase();
        el.style.cursor = 'pointer';
        if (!el.hasAttribute('href')) el.setAttribute('href', '#');
        el.addEventListener('click', (e) => {
          e.preventDefault();
          const lang = el.dataset.lang;
          try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) {}
          applyLang(lang);
        });
      }
    });
  }

  // ---- Boot ---------------------------------------------------------------
  function boot() {
    let lang = 'fr';
    try { lang = localStorage.getItem(STORAGE_KEY) || 'fr'; } catch (_) {}
    if (!SUPPORTED.includes(lang)) lang = 'fr';

    wireSwitcher();
    // Defer translation slightly so other DOM/animation init runs first
    requestAnimationFrame(() => applyLang(lang));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Public API
  window.SLI18n = {
    set: (lang) => {
      try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) {}
      applyLang(lang);
    },
    get: () => document.documentElement.lang || 'fr'
  };
})();
