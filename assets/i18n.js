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
      /* SL-en-reponse */
      "Réponse": "Reply",
      /* SL-en-rest */
      "Portefeuille de biens immobiliers de luxe en Israël": "Portfolio of luxury real estate in Israel",
      "PORTEFEUILLE · MAJ 28.04.MMXXVI": "PORTFOLIO · UPDATED 28.04.MMXXVI",
      "19 PIÈCES À CÉDER · 13 EN OFF-MARKET": "19 PROPERTIES FOR SALE · 13 OFF-MARKET",
      "＋ Plus": "＋ More",
      "Surface min": "Min. area",
      "Surface max": "Max. area",
      "Nos biens disponibles": "Our available properties",
      "Chargement du portefeuille…": "Loading the portfolio…",
      "Recherche par mot-clé": "Keyword search",
      "Trier les résultats": "Sort results",
      "Treize biens": "Thirteen properties",
      "ne figurent pas ici.": "are not shown here.",
      "Ils sont confiés à notre maison sous condition de discrétion absolue. Nous ne les présentons qu'à des acquéreurs qualifiés, après un premier rendez-vous.": "They are entrusted to our firm under strict confidentiality. We present them only to qualified buyers, after an initial meeting.",
      "Netanya · Jérusalem · Ashkelon": "Netanya · Jerusalem · Ashkelon",
      "Tous · 47": "All · 47",
      "Marché · 12": "Market · 12",
      "Fiscalité · 9": "Taxation · 9",
      "Quartiers · 7": "Neighborhoods · 7",
      "Demander d'autres analyses →": "Request more analyses →",
      "Le carnet privé": "The private notebook",
      "Quelques envois par trimestre. Les nouveaux articles + les biens off-market avant publication. Jamais de spam.": "A few sends per quarter. New articles + off-market properties before publication. Never any spam.",
      "S'inscrire →": "Subscribe →",
      "prenom@nom.fr": "name@email.com",
      "L'agence SHAHAR LEVI & NATHALIE HAIK Real Estate": "The SHAHAR LEVI & NATHALIE HAIK Real Estate agency",
      "LA MAISON · DEPUIS MMXIV": "THE FIRM · SINCE MMXIV",
      "Fondateur de la maison à Netanya en 2014, après dix années en finance entre Paris et Londres. Il pilote la stratégie globale, les négociations sensibles et les relations avec les familles propriétaires.": "Founder of the firm in Netanya in 2014, after ten years in finance between Paris and London. He leads overall strategy, sensitive negotiations and relationships with owner families.",
      "LE CABINET": "THE PRACTICE",
      "Caesarea & côte nord. Villas, golfs, biens d'exception — un œil pour la pierre rare.": "Caesarea & the northern coast. Villas, golf estates, exceptional properties — an eye for rare stone.",
      "Netanya & Herzliya. Spécialiste des biens en bord de mer et des résidences secondaires francophones.": "Netanya & Herzliya. Specialist in seafront properties and French-speaking second homes.",
      "Clientèle anglophone et russophone. Investissement patrimonial, structuration internationale.": "English- and Russian-speaking clients. Wealth investment, international structuring.",
      "Jérusalem & Netanya. Connaissance fine des quartiers résidentiels francophones et des projets neufs.": "Jerusalem & Netanya. In-depth knowledge of French-speaking residential districts and new developments.",
      "Première installation et accompagnement aliyah. Du Misrad Haklita à la remise des clés.": "First settling-in and aliyah support. From the Misrad HaKlita (absorption office) to the handover of the keys.",
      "À Netanya ou en visioconférence. Sans engagement. Toujours en français.": "In Netanya or by video call. No commitment. Always in French.",
      "Shahar Levi — Directeur fondateur": "Shahar Levi — Founding Director",
      "Nathalie Haik — Directrice d'agence": "Nathalie Haik — Agency Director",
      "Eyal Barone — Conseiller": "Eyal Barone — Advisor",
      "Chloé Mimoun — Conseillère senior": "Chloé Mimoun — Senior Advisor",
      "Eden Rabinkov — Conseillère internationale": "Eden Rabinkov — International Advisor",
      "Salomon Benhamou — Conseiller": "Salomon Benhamou — Advisor",
      "Neve Betan — Conseillère Aliyah": "Neve Betan — Aliyah Advisor",
      "Gal Hirschl — Conseillère anglophone": "Gal Hirschl — English-speaking Advisor",
      "Shoshana Damari 10, Piano Center · Ir Yamim, Netanya · Israël": "Shoshana Damari 10, Piano Center · Ir Yamim, Netanya · Israel",
      /* SL-en-faq */
      "QUESTIONS FRÉQUENTES · IMMOBILIER EN ISRAËL": "FREQUENTLY ASKED QUESTIONS · REAL ESTATE IN ISRAEL",
      "Questions fréquentes · MMXXVI": "Frequently asked questions · MMXXVI",
      "Vos": "Your",
      "Tout ce qu'il faut savoir pour acheter, vendre ou investir dans l'immobilier de prestige en Israël, avec un interlocuteur francophone. Une autre question ?": "Everything you need to know to buy, sell or invest in prestige real estate in Israel, with a French-speaking contact. Another question?",
      "Écrivez-nous": "Write to us",
      "— réponse personnelle sous 24 h.": "— personal reply within 24 h.",
      "Quels sont les frais d'agence immobilière en Israël ?": "What are real-estate agency fees in Israel?",
      "En Israël, les honoraires d'agence sont généralement de l'ordre de 2 % du prix (plus TVA), à la charge du vendeur dans le cadre d'un mandat. Chez SHAHAR LEVI & NATHALIE HAIK, le barème est": "In Israel, agency fees are typically around 2% of the price (plus VAT), paid by the seller under a mandate. At SHAHAR LEVI & NATHALIE HAIK, the scale is",
      "dégressif": "degressive",
      "— de 3,5 % sous 2 M₪ à 2 % au-delà de 15 M₪ — entièrement transparent et inscrit au mandat signé, sans frais caché. Pour l'acquéreur, nos services de recherche sont": "— from 3.5% below 2M₪ to 2% above 15M₪ — fully transparent and written into the signed mandate, with no hidden fees. For the buyer, our search services are",
      "sans frais directs": "free of direct charge",
      "Comment se déroule un achat immobilier à Netanya ?": "How does a property purchase in Netanya work?",
      "L'achat suit plusieurs étapes : définition du cahier des charges, sélection et visites des biens, négociation du prix, vérification cadastrale (": "The purchase follows several steps: defining the brief, selecting and viewing properties, negotiating the price, cadastral verification (",
      "), signature du contrat de vente (": "), signing the sale contract (",
      "), puis inscription au Tabu et remise des clés. Notre maison coordonne l'avocat bilingue et la banque, et accompagne le client de la recherche jusqu'à la remise des clés.": "), then registration at the Tabu and handover of the keys. Our firm coordinates the bilingual lawyer and the bank, and supports the client from the search to the handover of the keys.",
      "Un non-résident ou un étranger peut-il acheter un bien en Israël ?": "Can a non-resident or foreigner buy a property in Israel?",
      "Oui. Il n'existe pas de restriction de nationalité pour acquérir un bien résidentiel en Israël : résidents comme non-résidents peuvent acheter. La principale différence concerne la": "Yes. There is no nationality restriction on acquiring a residential property in Israel: residents and non-residents alike can buy. The main difference concerns the",
      "taxe d'achat (Mas Rechisha)": "purchase tax (Mas Rechisha)",
      ", dont les taux varient selon le statut de l'acheteur et le prix du bien. Un financement bancaire israélien reste accessible aux non-résidents, généralement jusqu'à environ 50 % de la valeur.": ", whose rates vary with the buyer's status and the property price. Israeli bank financing remains available to non-residents, generally up to around 50% of the value.",
      "Quelles zones couvrez-vous ?": "Which areas do you cover?",
      "La maison est établie à Netanya et intervient sur le littoral et les secteurs de prestige :": "The firm is based in Netanya and operates along the coast and in the prestige districts:",
      "(dont Ir Yamim), Herzliya, Césarée, Jérusalem et Tel Aviv. Nous sommes spécialisés dans les biens résidentiels haut de gamme — appartements, penthouses, villas — ainsi que les locaux commerciaux et bureaux.": "(including Ir Yamim), Herzliya, Caesarea, Jerusalem and Tel Aviv. We specialise in high-end residential properties — apartments, penthouses, villas — as well as commercial premises and offices.",
      "Proposez-vous des biens off-market (hors marché) ?": "Do you offer off-market (off-listing) properties?",
      "Oui. Une partie de nos biens de prestige n'est pas diffusée publiquement, à la demande des vendeurs. Ces opportunités confidentielles sont présentées directement aux acquéreurs qualifiés. Il suffit de": "Yes. Some of our prestige properties are not advertised publicly, at the sellers' request. These confidential opportunities are presented directly to qualified buyers. Simply",
      "nous contacter": "contact us",
      "pour accéder, sur dossier, à notre portefeuille off-market.": "to access our off-market portfolio, subject to review.",
      "En quelles langues êtes-vous accompagné ?": "In which languages are you assisted?",
      "Notre équipe accompagne ses clients en": "Our team assists its clients in",
      "français, hébreu, anglais et russe": "French, Hebrew, English and Russian",
      ". La maison s'adresse particulièrement à la clientèle francophone et à la diaspora qui investit en Israël, avec un interlocuteur dédié dans sa langue à chaque étape.": ". The firm caters especially to French-speaking clients and to the diaspora investing in Israel, with a dedicated contact in their language at every step.",
      "Faut-il un avocat pour acheter en Israël ?": "Do you need a lawyer to buy in Israel?",
      "Oui, c'est l'usage et c'est vivement recommandé : en Israël, la transaction immobilière est sécurisée par un": "Yes, it is customary and strongly recommended: in Israel, the real-estate transaction is secured by a",
      "avocat spécialisé": "specialised lawyer",
      "qui rédige le contrat de vente (": "who drafts the sale contract (",
      ") et procède aux vérifications. Nous travaillons avec des praticiens bilingues et coordonnons l'ensemble pour le compte de nos clients.": ") and carries out the checks. We work with bilingual practitioners and coordinate everything on our clients' behalf.",
      "Pourquoi passer par un courtier agréé plutôt qu'en direct ?": "Why use a licensed broker rather than going direct?",
      "Un courtier agréé — titulaire d'une licence officielle, la nôtre porte le": "A licensed broker — holder of an official licence, ours bears",
      "n° 3183878": "no. 3183878",
      "— connaît les prix réels, donne accès aux biens off-market, maîtrise la négociation locale et les points de vigilance juridiques. Pour l'acquéreur, nos services de recherche sont sans frais directs, les honoraires étant portés par le mandat de vente. Vous gagnez du temps, de la sécurité et un meilleur prix.": "— knows the real prices, gives access to off-market properties, and masters local negotiation and the legal points to watch. For the buyer, our search services carry no direct fees, as the commission is borne by the sale mandate. You save time, gain security and a better price.",
      "Poser votre question →": "Ask your question →",
      /* SL-en-contact */
      "RÉPONSE SOUS 24H OUVRÉES · DIM—JEU 9H—18H IST": "REPLY WITHIN 24 BUSINESS HOURS · SUN—THU 9AM—6PM IST",
      "À Netanya ou en visioconférence. Sans engagement, sans frais initiaux. Toujours en français.": "In Netanya or by video call. No commitment, no upfront fees. Always in French.",
      "NETANYA (SIÈGE)": "NETANYA (HEAD OFFICE)",
      "HORAIRES": "HOURS",
      "DIM—JEU 9H—18H": "SUN—THU 9AM—6PM",
      "VEN 9H—14H": "FRI 9AM—2PM",
      "EMAIL DIRECT": "DIRECT EMAIL",
      "NOM *": "NAME *",
      "Acquisition · résidence secondaire": "Acquisition · second home",
      "Acquisition · aliyah patrimoniale": "Acquisition · aliyah (wealth relocation)",
      "Acquisition · investissement locatif": "Acquisition · rental investment",
      "Cession · vente de mon bien": "Sale · selling my property",
      "Conseil · estimation discrète": "Advisory · discreet valuation",
      "Conseil · fiscalité FR/IL": "Advisory · FR/IL taxation",
      "VOTRE PROJET": "YOUR PROJECT",
      "J'accepte que mes données soient traitées conformément à la": "I agree that my data may be processed in accordance with the",
      "politique RGPD": "GDPR policy",
      "de la maison. Aucun partage avec des tiers.": "of the firm. No sharing with third parties.",
      "⊕ Réponse personnelle de Nathalie sous 24h ouvrées": "⊕ Personal reply from Nathalie within 24 business hours",
      "Avant de nous contacter,": "Before contacting us,",
      "Faut-il être citoyen israélien pour acheter en Israël ?": "Do you need to be an Israeli citizen to buy in Israel?",
      "Non. Tout étranger peut acheter librement. En revanche, un acquéreur étranger paie 8% de Mas Rechisha (taxe d'achat) au lieu de 0—5% pour un olé hadash. C'est pourquoi l'aliyah patrimoniale (acheter avant ou pendant la procédure) est intéressante.": "No. Any foreigner may buy freely. However, a foreign buyer pays 8% Mas Rechisha (purchase tax) instead of 0—5% for an oleh hadash (new immigrant). This is why buying before or during the immigration process can be advantageous.",
      "Quels sont vos honoraires ?": "What are your fees?",
      "Sur les acquisitions, nos honoraires sont à la charge du vendeur (commission inscrite au mandat). Pour le client acquéreur, nos services sont sans frais directs. Sur les cessions, nos honoraires varient selon la complexité du dossier — discutés et fixés au mandat. Grille publique disponible sur demande.": "On acquisitions, our fees are paid by the seller (commission set in the mandate). For the buyer, our services carry no direct fees. On sales, our fees vary with the complexity of the case — discussed and set in the mandate. A public schedule is available on request.",
      "Combien de temps prend une transaction en Israël ?": "How long does a transaction take in Israel?",
      "Le délai médian est de 52 jours entre le heskem zikaron (compromis) et le heskem mekher avec inscription au Tabu. Pour un acquéreur depuis la France, le parcours complet dure en moyenne 8 à 14 mois.": "The median time is 52 days between the heskem zikaron (preliminary agreement) and the heskem mekher with registration at the Tabu (land registry). For a buyer based in France, the full journey averages 8 to 14 months.",
      "Travaillez-vous avec un notaire spécifique ?": "Do you work with a specific notary?",
      "Oui — Maître Eitan Cohen, notaire bilingue inscrit aux barreaux de Tel Aviv et Paris. Toutes les transactions de la maison passent par son cabinet. Vous lisez ce que vous signez.": "Yes — Maître Eitan Cohen, a bilingual notary admitted to the Tel Aviv and Paris bars. All of the firm's transactions go through his office. You read what you sign.",
      "Les biens du portefeuille sont-ils tous off-market ?": "Are all portfolio properties off-market?",
      "La majorité (environ 70%) ne sont pas publiés sur les portails publics israéliens. Les autres 30% sont aussi visibles sur Yad2/Madlan mais nous accompagnons exclusivement en français.": "The majority (around 70%) are not published on the Israeli public portals. The other 30% are also visible on Yad2/Madlan, but we provide guidance exclusively in French.",
      "Quelle fiscalité s'applique en France pour un bien en Israël ?": "What French taxation applies to a property in Israel?",
      "La convention fiscale franco-israélienne du 31 juillet 1995 évite la double imposition. Revenus locatifs déclarés en France, IFI au-delà de 1.3 M€ de patrimoine immobilier, plus-value imposable en France. Nous travaillons avec un fiscaliste FR/IL si nécessaire.": "The France–Israel tax treaty of 31 July 1995 prevents double taxation. Rental income is declared in France, IFI (wealth tax) applies above €1.3M of real-estate assets, and capital gains are taxable in France. We work with an FR/IL tax specialist when needed.",
      "Votre prénom": "Your first name",
      "Votre nom": "Your last name",
      "Pays de résidence actuel": "Country of current residence",
      "Objet du rendez-vous": "Subject of the appointment",
      "Enveloppe budgétaire": "Budget range",
      "Zone géographique": "Geographic area",
      "Quelques lignes sur votre projet, vos contraintes, vos questions...": "A few lines about your project, your constraints, your questions...",
      /* SL-i18n-completion-v1 */
      "Aller au contenu principal": "Skip to main content",
      "Nous contacter →": "Contact us →",
      "Discuter sur WhatsApp": "Chat on WhatsApp",
      "ACCESSIBILITÉ": "ACCESSIBILITY",
      "Menu": "Menu",
      "Ir Yamim, Netanya · Israël": "Ir Yamim, Netanya · Israel",
      "EN LIGNE · DIM—JEU 9H—18H IST": "ONLINE · SUN—THU 9AM—6PM IST",
      "Lic. courtier 3183878": "Broker license 3183878",
      "Composez votre recherche.": "Compose your search.",
      "Bureaux": "Offices",
      "Terrain": "Land",
      "Immeuble": "Building",
      "Mrd ₪": "Bn ₪",
      "Chargement de la sélection…": "Loading the selection…",
      "Nous croyons qu'un bien": "We believe a property",
      "ne se vend pas — il se confie. À une famille, un héritier, un connaisseur. Notre métier consiste à orchestrer, dans la plus grande confidentialité, des": "is not sold — it is entrusted. To a family, an heir, a connoisseur. Our craft is to orchestrate, in the utmost confidentiality,",
      "À Netanya, à Paris (sur rendez-vous), ou en visioconférence. Sans engagement, sans publication. Toujours en français.": "In Netanya, in Paris (by appointment), or by video call. No commitment, no listing. Always in French.",
      "Villa de luxe en Israël - SHAHAR LEVI & NATHALIE HAIK Real Estate": "Luxury villa in Israel - SHAHAR LEVI & NATHALIE HAIK Real Estate",
      "Bien d’exception à Tel Aviv": "Exceptional property in Tel Aviv",
      "Villa contemporaine en Israël": "Contemporary villa in Israel",
      "Penthouse vue mer en Israël": "Sea-view penthouse in Israel",
      "Maison de prestige à Caesarea": "Prestige home in Caesarea",
      "Appartement de standing à Jérusalem": "Upscale apartment in Jerusalem",
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
      'Votre projet immobilier en Israël,': 'Your real-estate project in Israel,',
      'en toute sérénité.': 'with complete peace of mind.',
      "Maison de courtage indépendante fondée à Tel Aviv en 2014. Acquisitions et cessions privées sur invitation, accompagnement aliyah, investissement patrimonial — pour une clientèle francophone exigeante.": 'Independent brokerage house founded in Tel Aviv in 2014. Off-market acquisitions and disposals, aliyah support, patrimonial investment — for a discerning French-speaking clientele.',
      'Voir le portefeuille (19) →': 'View portfolio (19) →',
      'Confier un mandat': 'Entrust a mandate',
      'Voir nos projets': 'See our projects',
      'Nous contacter': 'Contact us',
      'défiler': 'scroll',

      // Trust band
      'EXPÉRIENCE': 'EXPERIENCE',
      'CESSIONS': 'TRANSACTIONS',
      'FAMILLES': 'FAMILIES',
      'FRANCOPHONIE': 'FRENCH-SPEAKING',
      'ans': 'years',
      'sur le marché israélien': 'on the Israeli market',
      'de transactions accompagnées': 'in advised transactions',
      'familles francophones': 'French-speaking families',
      'tout en français · A à Z': 'fully in French · A to Z',

      // Sélection
      'Sélection · printemps MMXXVI': 'Spring MMXXVI selection',
      'Les biens récents': 'Recent properties',
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
      'Votre expérience, notre réussite': 'Your experience, our success',
      'd\'exception': 'exceptional',
      'rencontres improbables.': 'improbable encounters.',
      'Découvrir l\'agence →': 'Discover the agency →',

      // Cities
      'Couverture territoriale': 'Territorial coverage',
      'Cinq villes,': 'Five cities,',
      'une équipe.': 'one team.',
      '8 BIENS': '8 PROPERTIES',
      '4 BIENS': '4 PROPERTIES',
      '3 BIENS': '3 PROPERTIES',
      '2 BIENS': '2 PROPERTIES',
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
      'À LOUER': 'FOR RENT',
      'NEUF': 'NEW BUILD',
      'OCCASION': 'RESALE',
      'PROJET': 'OFF-PLAN',
      'LOCAL COMMERCIAL': 'COMMERCIAL',
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
      'Une agence': 'An agency',
      'à taille humaine.': 'on a human scale.',
      'Six visages, cinq langues, une exigence commune : que vous compreniez chaque ligne, à chaque étape. Nous ne déléguons rien — chaque dossier est suivi par la même personne, du premier rendez-vous à la remise des clés.': "Six faces, five languages, one shared standard: that you understand every line, at every step. We delegate nothing — each file is handled by the same person, from the first meeting to the handover of keys.",
      "Une équipe aux parcours complémentaires, réunie par une même exigence : offrir un accompagnement clair, humain et irréprochable à chaque étape. Français, anglais, hébreu et russe — nos équipes accompagnent une clientèle internationale avec fluidité et précision. Profondément ancrés dans le marché immobilier israélien, nos agents suivent personnellement chaque projet, du premier échange jusqu'à la remise des clés, avec disponibilité, discrétion et engagement.": "A team with complementary paths, united by one shared standard: deliver clear, human and impeccable support at every step. French, English, Hebrew and Russian — our teams serve an international clientele with fluency and precision. Deeply rooted in the Israeli real-estate market, our agents personally guide every project, from the first exchange through to the handover of keys — with availability, discretion and commitment.",
      'DIRECTEUR FONDATEUR · MMXIV': 'FOUNDING DIRECTOR · MMXIV',
      'Fondateur de la maison à Tel Aviv en 2014, après dix années en finance entre Paris et Londres. Il pilote la stratégie globale, les négociations sensibles et les relations avec les familles propriétaires.': 'Founder of the house in Tel Aviv in 2014, after a decade in finance between Paris and London. He leads global strategy, sensitive negotiations and relationships with owning families.',
      "DIRECTRICE D'AGENCE · MMXVIII": 'MANAGING DIRECTOR · MMXVIII',
      "Parisienne d'origine, Nathalie pilote l'ensemble du cabinet francophone. Elle accompagne plus de 80 % de la clientèle française, suisse et belge — du premier rendez-vous parisien jusqu'à la remise des clés à Herzliya.": 'Parisian by origin, Nathalie leads the entire French-speaking practice. She personally guides over 80% of French, Swiss and Belgian clients — from the first Paris meeting to the handover of keys in Herzliya.',
      'Prendre rendez-vous avec la direction →': 'Book an appointment with the leadership →',
      'Six conseiller·ère·s,': 'Six advisors,',
      'six langues maîtrisées.': 'six mastered languages.',
      'CONSEILLÈRE ANGLOPHONE': 'ENGLISH-SPEAKING ADVISOR',
      'Clientèle internationale anglophone. Investisseurs étrangers, expatriés, primo-acquéreurs en Israël.': 'International English-speaking clientele. Foreign investors, expatriates, first-time buyers in Israel.',
      "Parisienne d'origine, Nathalie pilote l'ensemble du cabinet francophone depuis Tel Aviv. Elle accompagne plus de 80 % de la clientèle française, suisse et belge — du premier rendez-vous parisien jusqu'à la remise des clés à Herzliya. Elle parle votre langue, comprend votre fiscalité, et tient à ce que vous lisiez chaque ligne avant de signer.": 'Parisian by origin, Nathalie leads the entire French-speaking practice from Tel Aviv. She personally guides over 80% of French, Swiss and Belgian clients — from the first Paris meeting to the handover of keys in Herzliya. She speaks your language, understands your tax framework, and insists you read every line before signing.',
      'Son cabinet privé reçoit sur rendez-vous, à Paris (8ᵉ) comme à Tel Aviv (Rothschild). Discrétion absolue, méthode tranquille, exigence sans concession.': 'Her private office receives by appointment only, in Paris (8th arr.) as in Tel Aviv (Rothschild). Absolute discretion, quiet method, uncompromising standards.',
      'FORMATION': 'EDUCATION',
      'LANGUES': 'LANGUAGES',
      'Sciences Po Paris': 'Sciences Po Paris',
      'EM Lyon · MBA Real Estate': 'EM Lyon · MBA Real Estate',
      'Membre FNAIM, FIABCI': 'FNAIM, FIABCI member',
      'Français': 'French',
      'Hébreu': 'Hebrew',
      'Anglais': 'English',
      'Russe': 'Russian',
      'Prendre rendez-vous →': 'Book an appointment →',
      'LE CABINET': 'THE OFFICE',
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
      'UNE MAISON · UN INTERLOCUTEUR': 'ONE HOUSE · ONE CONTACT',
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
      'Nos': 'Our',
      'honoraires.': 'fees.',
      'Transparence et clarté.': 'Transparency and clarity.',
      'Acquisition (côté acheteur)': 'Acquisition (buyer side)',
      'Cession (côté vendeur)': 'Disposal (seller side)',
      'Mandat exclusif': 'Exclusive mandate',
      'Conseil patrimonial': 'Wealth advisory',

      // Agence — section titles
      'Une conversation,': 'A conversation,',
      'jamais une démonstration.': 'never a demonstration.',
      'Quatre familles,': 'Four families,',
      'quatre récits.': 'four stories.',
      'Un rendez-vous,': 'An appointment,',
      'en confidence.': 'in confidence.',
      'Nos conseiller·ère·s.': 'Our advisors.',
      'Membre des principales institutions immobilières.': 'Member of the leading real-estate institutions.',
      'Membre des principales': 'Member of the leading',
      'institutions immobilières.': 'real-estate institutions.',
      'Chaque dossier est porté par un·e seul·e conseiller·ère, soutenu·e par la directrice. Pas de hand-off, pas de relais, pas de mauvaise surprise.': 'Each file is handled by a single advisor, supported by the director. No hand-off, no relay, no bad surprises.',
      'Nous rencontrer →': 'Meet us →',
      'I. Manifeste': 'I. Manifesto',
      'III. L\'équipe': 'III. The team',
      'VI. Reconnaissances et certifications': 'VI. Recognition and certifications',
      // Agence manifesto pillars
      'DISCRÉTION': 'DISCRETION',
      'FRANCOPHONIE': 'FRANCOPHONE',
      'RESPONSABILITÉ': 'RESPONSIBILITY',
      "Aucune pièce du portefeuille n'est publiée tant que les propriétaires ne l'autorisent pas. La majorité de nos cessions sont signées sans visite extérieure.": "No property in the portfolio is published until the owners authorize it. The majority of our sales are signed without an external viewing.",
      "100% du parcours en français. Du premier rendez-vous à la signature notariale, en passant par la fiscalité, le compromis et le notaire bilingue.": "100% of the journey in French. From the first meeting to the notarial signature, including taxation, the promise and the bilingual notary.",
      "Nous restons joignables longtemps après la remise des clés — mise en location, gestion, fiscalité FR/IL annuelle. La transaction n'est jamais terminée.": "We remain reachable long after handing over the keys — rental, management, annual FR/IL taxation. The transaction is never finished.",
      'VII. Confidences clientes': 'VII. Client confidences',
      'Solliciter le cabinet': 'Request the firm',
      'Envoyer la demande →': 'Send request →',

      // Section tabs + property kind filter
      'Tout': 'All',
      'À vendre': 'For sale',
      'À louer': 'For rent',
      'Type de bien': 'Property kind',
      'Neuf': 'New build',
      'Occasion': 'Resale',
      'Projet': 'Project',
      'Local commercial': 'Commercial',
      '⇡ Avec ascenseur': '⇡ With elevator',
      '⇡ ASC': '⇡ ELV',
      'ASCENSEUR': 'ELEVATOR',
      'Ascenseur': 'Elevator',
      'Oui': 'Yes',
      'Non': 'No',
      // Portefeuille
      'Dix-neuf pièces': 'Nineteen properties',
      'à céder discrètement.': 'to be transferred discreetly.',
      '★ Pièces signature': '★ Signature properties',
      'À la une': 'Featured',
      'Trier par': 'Sort by',
      'Pertinence': 'Relevance',
      'Prix décroissant': 'Price (high to low)',
      'Prix croissant': 'Price (low to high)',
      'Surface ↓': 'Area ↓',
      'Pièces ↓': 'Rooms ↓',
      'Récent': 'Recent',
      'Treize biens supplémentaires ne figurent pas ici.': 'Thirteen additional properties are not shown here.',
      'bien': 'property',
      'biens': 'properties',
      'supplémentaires': 'additional',
      'Solliciter le carnet privé →': 'Request the private book →',
      'Villa front de mer.': 'Seafront villa.',
      'Bauhaus restauré.': 'Restored Bauhaus.',
      'restauré.': 'restored.',
      'Le portefeuille · printemps MMXXVI': 'The portfolio · spring MMXXVI',
      "Chaque bien du portefeuille porte une référence, une provenance et l'accord explicite des propriétaires. La majorité ne sera jamais publiée publiquement — réservée à notre clientèle qualifiée.": "Every property in the portfolio carries a reference, a provenance and the explicit agreement of the owners. The majority will never be publicly published — reserved for our qualified clientele.",
      // Portefeuille — listing cards & filters
      // Hero search (homepage)
      'TROUVER UN BIEN': 'FIND A PROPERTY',
      'Ville': 'City',
      'Type': 'Type',
      'Pièces minimum': 'Minimum rooms',
      'Rechercher →': 'Search →',
      // Portfolio search filters
      'Toutes les villes': 'All cities',
      'Tous les types': 'All types',
      'Pièces': 'Rooms',
      'Appartement': 'Apartment',
      'Penthouse': 'Penthouse',
      'Villa': 'Villa',
      'Loft': 'Loft',
      'Maison': 'House',
      '2+ pièces': '2+ rooms',
      '3+ pièces': '3+ rooms',
      '4+ pièces': '4+ rooms',
      '5+ pièces': '5+ rooms',
      '6+ pièces': '6+ rooms',
      '7+ pièces': '7+ rooms',
      '8+ pièces': '8+ rooms',
      'Indifférent': 'Any',
      'Tous budgets': 'All budgets',
      "Jusqu'à 11 M ₪": 'Up to 11 M ₪',
      'Au-delà de 65 M ₪': 'Above 65 M ₪',
      // Contact form budget ranges
      'Préfère ne pas dire': 'Prefer not to say',
      '< 7 M ₪': '< 7 M ₪',
      // Footer (homepage)
      'VOTRE EXPÉRIENCE, NOTRE RÉUSSITE': 'YOUR EXPERIENCE, OUR SUCCESS',
      'Maison indépendante de courtage immobilier, fondée à Tel Aviv en 2014. Acquisitions et cessions privées sur invitation. Mossi\'a #4218 · FNAIM partenaire · FIABCI.': 'Independent real-estate brokerage, founded in Tel Aviv in 2014. Private acquisitions and disposals by invitation. Mossi\'a #4218 · FNAIM partner · FIABCI.',
      'PAGES': 'PAGES',
      'VILLES': 'CITIES',
      'CONTACT': 'CONTACT',
      'Accueil': 'Home',
      "L'Agence": 'The Agency',
      'MENTIONS': 'LEGAL',
      'RGPD': 'GDPR',
      'HONORAIRES': 'FEES',
      'NOUS SUIVRE': 'FOLLOW US',
      // CTA Contact section homepage
      'Cabinet privé': 'Private office',
      'À Tel Aviv, à Paris (sur rendez-vous), ou en visioconférence. Sans engagement, sans publication. Toujours en français.': 'In Tel Aviv, in Paris (by appointment), or via video call. No commitment, no publication. Always in French.',
      'Solliciter un rendez-vous →': 'Request an appointment →',
      "« L'immobilier israélien, en confidence et en français. »": '« Israeli real estate, in confidence and in French. »',
      'PIÈCES TOTAL': 'TOTAL PROPERTIES',
      'PIÈCE SIGNATURE': 'SIGNATURE PROPERTY',
      'À LA UNE': 'FEATURED',
      'QUARTIER': 'DISTRICT',
      'PIÈCES': 'ROOMS',
      'SURFACE': 'AREA',
      'PRIX': 'PRICE',
      'RÉF': 'REF',
      'RÉF.': 'REF.',
      'DÉTAILS': 'DETAILS',
      'Voir l\'annonce': 'View listing',
      'ÉTAGE': 'FLOOR',
      'Visiter →': 'Visit →',
      'Aucun bien ne correspond.': 'No property matches.',
      "Essayez d'élargir vos critères, ou": 'Try broadening your criteria, or',
      "demandez l'accès au carnet privé": 'request access to the private book',
      '(13 pièces off-market non listées ici).': '(13 off-market properties not listed here).',
      'Réinitialiser les filtres': 'Reset filters',
      'Chargement…': 'Loading…',
      'Adresse, référence, quartier…': 'Address, reference, neighborhood…',
      'Pièces': 'Rooms',
      'Budget': 'Budget',
      '+ Plus': '+ More',
      'BIENS OFF-MARKET': 'OFF-MARKET PROPERTIES',
      '★ Signature': '★ Signature',
      'pièces': 'rooms',
      'pièce': 'room',
      'Retirer': 'Remove',
      'bien': 'property',
      'biens': 'properties',
      'BIEN': 'PROPERTY',
      'BIENS': 'PROPERTIES',

      // Journal — article cards & modal
      // Journal — page chrome
      'LE JOURNAL · ANALYSES, CONSEILS, REPORTAGES': 'THE JOURNAL · ANALYSES, ADVICE, REPORTS',
      'Le journal · MMXXVI': 'The journal · MMXXVI',
      'Analyses, conseils,': 'Analyses, advice,',
      'reportages.': 'reports.',
      "Quarante-sept articles publiés depuis 2019 — sur l'immobilier israélien, l'aliyah, la fiscalité FR/IL, les quartiers, les notaires. Des analyses honnêtes, jamais commerciales.": "Forty-seven articles published since 2019 — on Israeli real estate, aliyah, FR/IL taxation, neighborhoods, notaries. Honest analyses, never commercial.",
      'THÈMES': 'THEMES',
      'Tous': 'All',
      'Fiscalité': 'Taxation',
      'Notarial': 'Notarial',
      'Quartiers': 'Neighborhoods',
      'Recevoir le journal': 'Receive the journal',
      'avant publication.': 'before publication.',
      '★ À LA UNE · MARCHÉ': '★ FEATURED · MARKET',
      '★ À LA UNE · ALIYAH': '★ FEATURED · ALIYAH',
      '★ À LA UNE · PATRIMOINE': '★ FEATURED · WEALTH',
      '★ À LA UNE · DÉCRYPTAGE': '★ FEATURED · ANALYSIS',
      'MARCHÉ': 'MARKET',
      'PATRIMOINE': 'WEALTH',
      'DÉCRYPTAGE': 'ANALYSIS',
      'MIN': 'MIN',
      'PUBLIÉ LE': 'PUBLISHED ON',
      "Lire l'article →": 'Read the article →',
      'LIRE →': 'READ →',
      'Aucun article publié pour le moment.': 'No articles published yet.',
      'Impossible de charger les articles.': 'Unable to load articles.',
      'Fermer': 'Close',
      'Impossible de charger le portefeuille.': 'Unable to load the portfolio.',
      "Impossible de charger l'équipe.": 'Unable to load the team.',
      'visages': 'faces',
      'langues': 'languages',

      // Aliyah
      'Acheter avant': 'Buy before',
      'de monter.': 'making aliyah.',
      'Un parcours': 'A path',
      'balisé en français.': 'guided in French.',
      'Acheter en olé,': 'Buy as an olé,',
      'économiser 6%.': 'save 6%.',
      '8% pour un étranger': '8% for a foreigner',
      '0—5% pour un olé hadash': '0—5% for an olé hadash',
      'Demander une simulation →': 'Request a simulation →',
      'Les questions qu\'on nous pose souvent.': 'The questions we are often asked.',
      'qu\'on nous pose souvent.': 'we are often asked.',
      'Voir le portefeuille': 'View the portfolio',
      'Voir le portefeuille (19) →': 'View the portfolio (19) →',

      // Aliyah — stats & 7 steps
      'ÉCONOMIE MOYENNE': 'AVERAGE SAVINGS',
      'DÉLAI MOYEN': 'AVERAGE TIMELINE',
      'FAMILLES ACCOMPAGNÉES': 'FAMILIES ACCOMPANIED',
      'sur un bien à 5M ₪ (vs taux étranger)': 'on a 5M ₪ property (vs foreign rate)',
      'de la première visite à la signature': 'from first viewing to signature',
      "LES 7 ÉTAPES DE L'ALIYAH PATRIMONIALE": 'THE 7 STEPS OF WEALTH ALIYAH',
      'Visites présélectionnées': 'Pre-selected viewings',
      '2—3 JOURS EN ISRAËL': '2—3 DAYS IN ISRAEL',
      'COMPROMIS NOTARIÉ': 'NOTARIAL PROMISE',
      'Financement': 'Financing',
      'CRÉDIT IL OU APPORT FR': 'IL CREDIT OR FR EQUITY',
      'Transfert des fonds': 'Transfer of funds',
      'DÉCLARATION TRÉSOR FR': 'FR TREASURY DECLARATION',
      'ACTE DE VENTE + CADASTRE': 'DEED OF SALE + CADASTRE',
      'Suivi annuel': 'Annual follow-up',
      'GESTION + FISCALITÉ FR/IL': 'MANAGEMENT + FR/IL TAXATION',
      'Le levier fiscal · Mas Rechisha': 'The tax lever · Mas Rechisha',
      'EXEMPLE CHIFFRÉ · BIEN À 5 000 000 ₪': 'WORKED EXAMPLE · PROPERTY AT 5,000,000 ₪',
      'Étranger non-résident': 'Non-resident foreigner',

      // Contact
      'Réponse sous 24h ouvrées.': 'Reply within 24 business hours.',
      'PRÉNOM *': 'FIRST NAME *',
      'TÉLÉPHONE': 'PHONE',
      'PAYS DE RÉSIDENCE ACTUEL': 'CURRENT COUNTRY OF RESIDENCE',
      'OBJET DU RENDEZ-VOUS *': 'PURPOSE OF THE APPOINTMENT *',
      'ENVELOPPE BUDGÉTAIRE': 'BUDGET RANGE',
      'ZONE GÉOGRAPHIQUE': 'GEOGRAPHIC AREA',
      'FORMAT DU RENDEZ-VOUS PRÉFÉRÉ': 'PREFERRED APPOINTMENT FORMAT',
      'Visioconférence': 'Video call',
      'J\'accepte que mes données soient traitées conformément à la politique GDPR de la maison. Aucun partage avec des tiers.': 'I agree that my data may be processed in accordance with the firm\'s GDPR policy. No sharing with third parties.',
      'Avant de nous contacter, peut-être ces réponses ?': 'Before contacting us, perhaps these answers?',
      'peut-être ces réponses ?': 'perhaps these answers?',
      // Contact — additional copy
      'RÉPONSE SOUS 24H OUVRÉES · LUN—JEU 9H—18H IST': 'REPLY WITHIN 24 BUSINESS HOURS · MON—THU 9AM—6PM IST',
      'CABINET PRIVÉ': 'PRIVATE OFFICE',
      'Un rendez-vous,': 'An appointment,',
      'À Tel Aviv, Paris (sur rendez-vous), ou en visioconférence. Sans engagement, sans frais initiaux. Toujours en français.': 'In Tel Aviv, Paris (by appointment), or via video call. No commitment, no upfront fees. Always in French.',
      'TEL AVIV (SIÈGE)': 'TEL AVIV (HEADQUARTERS)',
      'PARIS (SUR RENDEZ-VOUS)': 'PARIS (BY APPOINTMENT)',
      'DISPONIBILITÉ': 'AVAILABILITY',
      'UNE FOIS': 'ONCE',
      'PAR MOIS': 'PER MONTH',
      'Pour les sollicitations confidentielles. Réponse personnelle de Nathalie sous 24h ouvrées.': 'For confidential inquiries. Personal reply from Nathalie within 24 business hours.',
      'RÉSEAUX': 'SOCIAL',
      'YouTube · Le journal': 'YouTube · The journal',
      'FORMULAIRE DE PRISE DE RENDEZ-VOUS': 'APPOINTMENT REQUEST FORM',
      'sous 24h ouvrées.': 'within 24 business hours.',
      'France': 'France',
      'Belgique': 'Belgium',
      'Suisse': 'Switzerland',
      'Israël': 'Israel',
      'Autre': 'Other',
      'Préfère ne pas dire': 'Prefer not to say',
      'Pas de préférence': 'No preference',
      'Plusieurs zones': 'Multiple areas',

      // Footer common
      'Bureau & contact': 'Office & contact',
      'Tel Aviv 6688314 · Israël': 'Tel Aviv 6688314 · Israel',

      // Misc
      'En savoir +': 'Learn more',
      'Retour': 'Back',
      'Suivant': 'Next',
      'Précédent': 'Previous',
      'Voir tout': 'View all',
      'Page non trouvée': 'Page not found',
      "La page que vous cherchez n'existe pas ou a été déplacée.": "The page you're looking for doesn't exist or has been moved.",
      'Retour à l\'accueil': 'Back to home',
      // Legal & 404 page chrome
      "BARÈME D'HONORAIRES · TRANSPARENT": "FEE SCHEDULE · TRANSPARENT",
      'Barème transparent · MMXXVI': 'Transparent fee schedule · MMXXVI',
      "Notre grille d'honoraires est publique, dégressive selon le montant de la transaction. Aucun frais caché, aucune facturation supplémentaire — tout est inclus dans le mandat signé.": 'Our fee schedule is public, sliding-scale based on transaction amount. No hidden fees, no extra invoicing — everything is included in the signed mandate.',
      // Mentions légales — titles only
      'CONFORMITÉ LÉGALE': 'LEGAL COMPLIANCE',
      'Mentions légales.': 'Legal notice.',
      'Dernière mise à jour : 28 avril 2026': 'Last updated: 28 April 2026',
      'Éditeur du site': 'Site publisher',
      'Hébergement': 'Hosting',
      'Propriété intellectuelle': 'Intellectual property',
      'Crédits': 'Credits',
      'Activité réglementée': 'Regulated activity',
      'Limitation de responsabilité': 'Limitation of liability',
      'Loi applicable et juridiction': 'Applicable law and jurisdiction',
      // RGPD — titles only
      'CONFORMITÉ EUROPE': 'EU COMPLIANCE',
      'Politique RGPD.': 'GDPR Policy.',
      'Vos données.': 'Your data.',
      // Footer short version (legal/contact pages)
      'Maison indépendante de courtage immobilier. Tel Aviv depuis 2014. Mossi\'a #4218.': 'Independent real-estate brokerage. Tel Aviv since 2014. Mossi\'a #4218.',
      'MENTIONS LÉGALES': 'LEGAL NOTICE',
      'POLITIQUE RGPD · CONFORMITÉ EUROPE': 'GDPR POLICY · EU COMPLIANCE',
      'ERREUR 404 · PAGE INTROUVABLE': 'ERROR 404 · PAGE NOT FOUND',
      'Cette pièce': 'This property',
      "n'est plus": 'is no longer',
      'au portefeuille.': 'in the portfolio.',
      "Comme certains biens off-market, cette page a peut-être été retirée de la circulation. Reprenons la visite depuis le début.": 'Like some off-market properties, this page may have been withdrawn. Let us restart the tour from the beginning.',
      "Retour à l'accueil →": 'Back to home →',
      'Si le problème persiste, contactez-nous :': 'If the problem persists, contact us:'
    },

    he: {
      /* SL-he-rep */
      "Réponse": "מענה",
      /* SL-he-rest */
      "Portefeuille de biens immobiliers de luxe en Israël": "תיק נכסי נדל״ן יוקרה בישראל",
      "PORTEFEUILLE · MAJ 28.04.MMXXVI": "תיק נכסים · עודכן 28.04.MMXXVI",
      "19 PIÈCES À CÉDER · 13 EN OFF-MARKET": "19 נכסים למכירה · 13 ב-OFF-MARKET",
      "＋ Plus": "＋ עוד",
      "Surface min": "שטח מינ׳",
      "Surface max": "שטח מקס׳",
      "Nos biens disponibles": "הנכסים הזמינים שלנו",
      "Chargement du portefeuille…": "טוען את תיק הנכסים…",
      "Recherche par mot-clé": "חיפוש לפי מילת מפתח",
      "Trier les résultats": "מיון התוצאות",
      "Treize biens": "שלושה עשר נכסים",
      "ne figurent pas ici.": "אינם מופיעים כאן.",
      "Ils sont confiés à notre maison sous condition de discrétion absolue. Nous ne les présentons qu'à des acquéreurs qualifiés, après un premier rendez-vous.": "הם מופקדים בידי המשרד שלנו בתנאי דיסקרטיות מוחלטת. אנו מציגים אותם רק לרוכשים מתאימים, לאחר פגישה ראשונה.",
      "Netanya · Jérusalem · Ashkelon": "נתניה · ירושלים · אשקלון",
      "Tous · 47": "הכול · 47",
      "Marché · 12": "שוק · 12",
      "Fiscalité · 9": "מיסוי · 9",
      "Quartiers · 7": "שכונות · 7",
      "Demander d'autres analyses →": "בקשו ניתוחים נוספים →",
      "Le carnet privé": "הפנקס הפרטי",
      "Quelques envois par trimestre. Les nouveaux articles + les biens off-market avant publication. Jamais de spam.": "מספר דיוורים ברבעון. המאמרים החדשים + נכסי ה-off-market לפני פרסום. אף פעם לא ספאם.",
      "S'inscrire →": "הרשמה →",
      "prenom@nom.fr": "name@email.com",
      "L'agence SHAHAR LEVI & NATHALIE HAIK Real Estate": "סוכנות הנדל״ן SHAHAR LEVI & NATHALIE HAIK",
      "LA MAISON · DEPUIS MMXIV": "המשרד · משנת MMXIV",
      "Fondateur de la maison à Netanya en 2014, après dix années en finance entre Paris et Londres. Il pilote la stratégie globale, les négociations sensibles et les relations avec les familles propriétaires.": "מייסד המשרד בנתניה בשנת 2014, לאחר עשר שנים בעולם הפיננסים בין פריז ללונדון. הוא מוביל את האסטרטגיה הכוללת, את המשאים ומתנים הרגישים ואת הקשרים עם המשפחות בעלות הנכסים.",
      "LE CABINET": "הצוות",
      "Caesarea & côte nord. Villas, golfs, biens d'exception — un œil pour la pierre rare.": "קיסריה והחוף הצפוני. וילות, מתחמי גולף, נכסים יוצאי דופן — עין לאבן הנדירה.",
      "Netanya & Herzliya. Spécialiste des biens en bord de mer et des résidences secondaires francophones.": "נתניה והרצליה. מומחית לנכסים על קו החוף ולבתים שניים של דוברי צרפתית.",
      "Clientèle anglophone et russophone. Investissement patrimonial, structuration internationale.": "לקוחות דוברי אנגלית ורוסית. השקעות הון, מבנים בינלאומיים.",
      "Jérusalem & Netanya. Connaissance fine des quartiers résidentiels francophones et des projets neufs.": "ירושלים ונתניה. היכרות מעמיקה עם שכונות המגורים של דוברי הצרפתית ועם פרויקטים חדשים.",
      "Première installation et accompagnement aliyah. Du Misrad Haklita à la remise des clés.": "קליטה ראשונית וליווי עלייה. ממשרד הקליטה ועד מסירת המפתחות.",
      "À Netanya ou en visioconférence. Sans engagement. Toujours en français.": "בנתניה או בשיחת וידאו. ללא התחייבות. תמיד בצרפתית.",
      "Shahar Levi — Directeur fondateur": "Shahar Levi — מנהל ומייסד",
      "Nathalie Haik — Directrice d'agence": "Nathalie Haik — מנהלת הסוכנות",
      "Eyal Barone — Conseiller": "Eyal Barone — יועץ",
      "Chloé Mimoun — Conseillère senior": "Chloé Mimoun — יועצת בכירה",
      "Eden Rabinkov — Conseillère internationale": "Eden Rabinkov — יועצת בינלאומית",
      "Salomon Benhamou — Conseiller": "Salomon Benhamou — יועץ",
      "Neve Betan — Conseillère Aliyah": "Neve Betan — יועצת עלייה",
      "Gal Hirschl — Conseillère anglophone": "Gal Hirschl — יועצת דוברת אנגלית",
      "Shoshana Damari 10, Piano Center · Ir Yamim, Netanya · Israël": "שושנה דמארי 10, פיאנו סנטר · עיר ימים, נתניה · ישראל",
      /* SL-he-faq */
      "QUESTIONS FRÉQUENTES · IMMOBILIER EN ISRAËL": "שאלות נפוצות · נדל״ן בישראל",
      "Questions fréquentes · MMXXVI": "שאלות נפוצות · MMXXVI",
      "Tout ce qu'il faut savoir pour acheter, vendre ou investir dans l'immobilier de prestige en Israël, avec un interlocuteur francophone. Une autre question ?": "כל מה שצריך לדעת כדי לקנות, למכור או להשקיע בנדל״ן יוקרה בישראל, עם איש קשר דובר צרפתית. יש לכם שאלה נוספת?",
      "Écrivez-nous": "כתבו לנו",
      "— réponse personnelle sous 24 h.": "— מענה אישי תוך 24 שעות.",
      "Quels sont les frais d'agence immobilière en Israël ?": "מהם דמי תיווך הנדל״ן בישראל?",
      "En Israël, les honoraires d'agence sont généralement de l'ordre de 2 % du prix (plus TVA), à la charge du vendeur dans le cadre d'un mandat. Chez SHAHAR LEVI & NATHALIE HAIK, le barème est": "בישראל, דמי התיווך הם בדרך כלל כ-2% מהמחיר (בתוספת מע״מ), על חשבון המוכר במסגרת הסכם תיווך. ב-SHAHAR LEVI & NATHALIE HAIK, התעריף",
      "dégressif": "פוחת",
      "— de 3,5 % sous 2 M₪ à 2 % au-delà de 15 M₪ — entièrement transparent et inscrit au mandat signé, sans frais caché. Pour l'acquéreur, nos services de recherche sont": "— מ-3.5% מתחת ל-2 מיליון ₪ ועד 2% מעל 15 מיליון ₪ — שקוף לחלוטין ומעוגן בהסכם החתום, ללא עלויות נסתרות. עבור הרוכש, שירותי החיפוש שלנו",
      "sans frais directs": "ללא עלות ישירה",
      "Comment se déroule un achat immobilier à Netanya ?": "כיצד מתבצעת רכישת נכס בנתניה?",
      "L'achat suit plusieurs étapes : définition du cahier des charges, sélection et visites des biens, négociation du prix, vérification cadastrale (": "הרכישה כוללת מספר שלבים: הגדרת דרישות, איתור וביקור בנכסים, משא ומתן על המחיר, בדיקה קדסטרלית (",
      "), signature du contrat de vente (": "), חתימת הסכם המכר (",
      "), puis inscription au Tabu et remise des clés. Notre maison coordonne l'avocat bilingue et la banque, et accompagne le client de la recherche jusqu'à la remise des clés.": "), ולאחר מכן רישום בטאבו ומסירת המפתחות. המשרד שלנו מתאם את עורך הדין הדו-לשוני ואת הבנק, ומלווה את הלקוח מהחיפוש ועד מסירת המפתחות.",
      "Un non-résident ou un étranger peut-il acheter un bien en Israël ?": "האם תושב חוץ או זר יכול לקנות נכס בישראל?",
      "Oui. Il n'existe pas de restriction de nationalité pour acquérir un bien résidentiel en Israël : résidents comme non-résidents peuvent acheter. La principale différence concerne la": "כן. אין הגבלת אזרחות לרכישת נכס למגורים בישראל: גם תושבים וגם תושבי חוץ יכולים לקנות. ההבדל העיקרי נוגע ל",
      "taxe d'achat (Mas Rechisha)": "מס רכישה",
      ", dont les taux varient selon le statut de l'acheteur et le prix du bien. Un financement bancaire israélien reste accessible aux non-résidents, généralement jusqu'à environ 50 % de la valeur.": ", ששיעוריו משתנים לפי מעמד הרוכש ומחיר הנכס. מימון בנקאי ישראלי זמין גם לתושבי חוץ, בדרך כלל עד כ-50% מהשווי.",
      "Quelles zones couvrez-vous ?": "אילו אזורים אתם מכסים?",
      "La maison est établie à Netanya et intervient sur le littoral et les secteurs de prestige :": "המשרד ממוקם בנתניה ופועל לאורך החוף ובאזורי היוקרה:",
      "(dont Ir Yamim), Herzliya, Césarée, Jérusalem et Tel Aviv. Nous sommes spécialisés dans les biens résidentiels haut de gamme — appartements, penthouses, villas — ainsi que les locaux commerciaux et bureaux.": "(כולל עיר ימים), הרצליה, קיסריה, ירושלים ותל אביב. אנו מתמחים בנכסי מגורים יוקרתיים — דירות, פנטהאוזים, וילות — וכן בנכסים מסחריים ומשרדים.",
      "Proposez-vous des biens off-market (hors marché) ?": "האם אתם מציעים נכסים off-market (מחוץ לשוק)?",
      "Oui. Une partie de nos biens de prestige n'est pas diffusée publiquement, à la demande des vendeurs. Ces opportunités confidentielles sont présentées directement aux acquéreurs qualifiés. Il suffit de": "כן. חלק מנכסי היוקרה שלנו אינם מתפרסמים בפומבי, לבקשת המוכרים. הזדמנויות חסויות אלה מוצגות ישירות לרוכשים מתאימים. די ל",
      "nous contacter": "ליצור איתנו קשר",
      "pour accéder, sur dossier, à notre portefeuille off-market.": "כדי לקבל גישה, לפי בקשה, לתיק ה-off-market שלנו.",
      "En quelles langues êtes-vous accompagné ?": "באילו שפות מתבצע הליווי?",
      "Notre équipe accompagne ses clients en": "הצוות שלנו מלווה את לקוחותיו ב",
      "français, hébreu, anglais et russe": "צרפתית, עברית, אנגלית ורוסית",
      ". La maison s'adresse particulièrement à la clientèle francophone et à la diaspora qui investit en Israël, avec un interlocuteur dédié dans sa langue à chaque étape.": ". המשרד פונה במיוחד ללקוחות דוברי צרפתית ולקהילות התפוצה המשקיעות בישראל, עם איש קשר ייעודי בשפתם בכל שלב.",
      "Faut-il un avocat pour acheter en Israël ?": "האם צריך עורך דין כדי לקנות בישראל?",
      "Oui, c'est l'usage et c'est vivement recommandé : en Israël, la transaction immobilière est sécurisée par un": "כן, זהו הנוהג והדבר מומלץ בחום: בישראל, עסקת הנדל״ן מאובטחת על ידי",
      "avocat spécialisé": "עורך דין מומחה",
      "qui rédige le contrat de vente (": "המנסח את הסכם המכר (",
      ") et procède aux vérifications. Nous travaillons avec des praticiens bilingues et coordonnons l'ensemble pour le compte de nos clients.": ") ומבצע את הבדיקות. אנו עובדים עם אנשי מקצוע דו-לשוניים ומתאמים את הכול עבור לקוחותינו.",
      "Pourquoi passer par un courtier agréé plutôt qu'en direct ?": "מדוע לעבוד דרך מתווך מורשה ולא ישירות?",
      "Un courtier agréé — titulaire d'une licence officielle, la nôtre porte le": "מתווך מורשה — בעל רישיון רשמי, שלנו נושא את",
      "n° 3183878": "מס׳ 3183878",
      "— connaît les prix réels, donne accès aux biens off-market, maîtrise la négociation locale et les points de vigilance juridiques. Pour l'acquéreur, nos services de recherche sont sans frais directs, les honoraires étant portés par le mandat de vente. Vous gagnez du temps, de la sécurité et un meilleur prix.": "— מכיר את המחירים האמיתיים, מעניק גישה לנכסי off-market, ושולט במשא ומתן המקומי ובנקודות הזהירות המשפטיות. עבור הרוכש, שירותי החיפוש שלנו ללא עלות ישירה, שכן העמלה מגולמת בהסכם המכירה. אתם חוסכים זמן, מרוויחים ביטחון ומחיר טוב יותר.",
      "Poser votre question →": "שאלו את שאלתכם →",
      /* SL-he-contact */
      "RÉPONSE SOUS 24H OUVRÉES · DIM—JEU 9H—18H IST": "מענה תוך 24 שעות עבודה · א׳—ה׳ 9:00—18:00 שעון ישראל",
      "À Netanya ou en visioconférence. Sans engagement, sans frais initiaux. Toujours en français.": "בנתניה או בשיחת וידאו. ללא התחייבות, ללא עלות התחלתית. תמיד בצרפתית.",
      "NETANYA (SIÈGE)": "נתניה (משרד ראשי)",
      "HORAIRES": "שעות פעילות",
      "DIM—JEU 9H—18H": "א׳—ה׳ 9:00—18:00",
      "VEN 9H—14H": "ו׳ 9:00—14:00",
      "EMAIL DIRECT": "אימייל ישיר",
      "NOM *": "שם *",
      "Acquisition · résidence secondaire": "רכישה · בית שני",
      "Acquisition · aliyah patrimoniale": "רכישה · עלייה (השקעת הון)",
      "Acquisition · investissement locatif": "רכישה · השקעה להשכרה",
      "Cession · vente de mon bien": "מכירה · מכירת הנכס שלי",
      "Conseil · estimation discrète": "ייעוץ · הערכת שווי דיסקרטית",
      "Conseil · fiscalité FR/IL": "ייעוץ · מיסוי צרפת/ישראל",
      "VOTRE PROJET": "הפרויקט שלכם",
      "J'accepte que mes données soient traitées conformément à la": "אני מסכים/ה שהנתונים שלי יעובדו בהתאם ל",
      "politique RGPD": "מדיניות הפרטיות (GDPR)",
      "de la maison. Aucun partage avec des tiers.": "של המשרד. ללא שיתוף עם צד שלישי.",
      "⊕ Réponse personnelle de Nathalie sous 24h ouvrées": "⊕ מענה אישי מאת נטלי האיק תוך 24 שעות עבודה",
      "Avant de nous contacter,": "לפני שתפנו אלינו,",
      "Faut-il être citoyen israélien pour acheter en Israël ?": "האם צריך להיות אזרח ישראלי כדי לקנות בישראל?",
      "Non. Tout étranger peut acheter librement. En revanche, un acquéreur étranger paie 8% de Mas Rechisha (taxe d'achat) au lieu de 0—5% pour un olé hadash. C'est pourquoi l'aliyah patrimoniale (acheter avant ou pendant la procédure) est intéressante.": "לא. כל זר רשאי לקנות בחופשיות. עם זאת, רוכש זר משלם 8% מס רכישה במקום 0—5% לעולה חדש. לכן רכישה לפני או במהלך תהליך העלייה משתלמת.",
      "Quels sont vos honoraires ?": "מהם דמי התיווך שלכם?",
      "Sur les acquisitions, nos honoraires sont à la charge du vendeur (commission inscrite au mandat). Pour le client acquéreur, nos services sont sans frais directs. Sur les cessions, nos honoraires varient selon la complexité du dossier — discutés et fixés au mandat. Grille publique disponible sur demande.": "ברכישות, דמי התיווך חלים על המוכר (עמלה הנקבעת בהסכם התיווך). עבור הרוכש, השירות שלנו ללא עלות ישירה. במכירות, דמי התיווך משתנים לפי מורכבות התיק — נדונים ונקבעים בהסכם. מחירון פומבי זמין לפי בקשה.",
      "Combien de temps prend une transaction en Israël ?": "כמה זמן אורכת עסקה בישראל?",
      "Le délai médian est de 52 jours entre le heskem zikaron (compromis) et le heskem mekher avec inscription au Tabu. Pour un acquéreur depuis la France, le parcours complet dure en moyenne 8 à 14 mois.": "משך הזמן החציוני הוא 52 ימים בין הסכם זיכרון (הסכם מקדים) להסכם מכר עם רישום בטאבו. עבור רוכש מצרפת, התהליך המלא נמשך בממוצע 8 עד 14 חודשים.",
      "Travaillez-vous avec un notaire spécifique ?": "האם אתם עובדים עם נוטריון מסוים?",
      "Oui — Maître Eitan Cohen, notaire bilingue inscrit aux barreaux de Tel Aviv et Paris. Toutes les transactions de la maison passent par son cabinet. Vous lisez ce que vous signez.": "כן — עו״ד איתן כהן, נוטריון דו-לשוני החבר בלשכות עורכי הדין בתל אביב ובפריז. כל עסקאות המשרד עוברות דרך משרדו. אתם קוראים את מה שאתם חותמים.",
      "Les biens du portefeuille sont-ils tous off-market ?": "האם כל הנכסים בתיק הם off-market?",
      "La majorité (environ 70%) ne sont pas publiés sur les portails publics israéliens. Les autres 30% sont aussi visibles sur Yad2/Madlan mais nous accompagnons exclusivement en français.": "הרוב (כ-70%) אינם מתפרסמים בפורטלים הציבוריים בישראל. ה-30% הנותרים גלויים גם ב-Yad2/Madlan, אך אנו מלווים אך ורק בצרפתית.",
      "Quelle fiscalité s'applique en France pour un bien en Israël ?": "איזה מיסוי חל בצרפת על נכס בישראל?",
      "La convention fiscale franco-israélienne du 31 juillet 1995 évite la double imposition. Revenus locatifs déclarés en France, IFI au-delà de 1.3 M€ de patrimoine immobilier, plus-value imposable en France. Nous travaillons avec un fiscaliste FR/IL si nécessaire.": "אמנת המס צרפת—ישראל מ-31 ביולי 1995 מונעת כפל מס. הכנסות שכירות מדווחות בצרפת, מס ה-IFI חל מעל 1.3 מיליון אירו בנכסי נדל״ן, ורווח ההון חייב במס בצרפת. אנו עובדים עם יועץ מס צרפת/ישראל בעת הצורך.",
      "Votre prénom": "השם הפרטי שלכם",
      "Votre nom": "שם המשפחה שלכם",
      "Pays de résidence actuel": "מדינת מגורים נוכחית",
      "Objet du rendez-vous": "מטרת הפגישה",
      "Enveloppe budgétaire": "טווח תקציב",
      "Zone géographique": "אזור גאוגרפי",
      "Quelques lignes sur votre projet, vos contraintes, vos questions...": "כמה שורות על הפרויקט שלכם, האילוצים והשאלות שלכם...",
      /* SL-i18n-completion-v1 */
      "Aller au contenu principal": "דלג לתוכן הראשי",
      "Nous contacter →": "צרו קשר →",
      "Discuter sur WhatsApp": "שיחה בוואטסאפ",
      "ACCESSIBILITÉ": "נגישות",
      "Menu": "תפריט",
      "Ir Yamim, Netanya · Israël": "עיר ימים, נתניה · ישראל",
      "EN LIGNE · DIM—JEU 9H—18H IST": "מקוון · א׳—ה׳ 9:00—18:00 שעון ישראל",
      "Lic. courtier 3183878": "רישיון תיווך 3183878",
      "Composez votre recherche.": "הרכיבו את החיפוש שלכם.",
      "Bureaux": "משרדים",
      "Terrain": "מגרש",
      "Immeuble": "בניין",
      "Mrd ₪": "מיליארד ₪",
      "Chargement de la sélection…": "טוען את המבחר…",
      "Nous croyons qu'un bien": "אנו מאמינים שנכס",
      "ne se vend pas — il se confie. À une famille, un héritier, un connaisseur. Notre métier consiste à orchestrer, dans la plus grande confidentialité, des": "אינו נמכר — הוא מופקד. למשפחה, ליורש, למבין דבר. תפקידנו לתזמר, בדיסקרטיות מוחלטת,",
      "À Netanya, à Paris (sur rendez-vous), ou en visioconférence. Sans engagement, sans publication. Toujours en français.": "בנתניה, בפריז (בתיאום מראש) או בשיחת וידאו. ללא התחייבות, ללא פרסום. תמיד בצרפתית.",
      "Villa de luxe en Israël - SHAHAR LEVI & NATHALIE HAIK Real Estate": "וילת יוקרה בישראל - SHAHAR LEVI & NATHALIE HAIK Real Estate",
      "Bien d’exception à Tel Aviv": "נכס יוצא דופן בתל אביב",
      "Villa contemporaine en Israël": "וילה עכשווית בישראל",
      "Penthouse vue mer en Israël": "פנטהאוז עם נוף לים בישראל",
      "Maison de prestige à Caesarea": "בית יוקרה בקיסריה",
      "Appartement de standing à Jérusalem": "דירה יוקרתית בירושלים",
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
      'Votre projet immobilier en Israël,': 'פרויקט הנדל״ן שלכם בישראל,',
      'en toute sérénité.': 'בשלוות נפש מלאה.',
      "Maison de courtage indépendante fondée à Tel Aviv en 2014. Acquisitions et cessions privées sur invitation, accompagnement aliyah, investissement patrimonial — pour une clientèle francophone exigeante.": 'בית תיווך עצמאי שהוקם בתל אביב בשנת 2014. רכישות ומכירות פרטיות בהזמנה, ליווי לעלייה והשקעה בנכסים — עבור לקוחות דוברי צרפתית תובעניים.',
      'Voir le portefeuille (19) →': '← צפו בתיק הנכסים (19)',
      'Confier un mandat': 'הפקדת ייפוי כוח',
      'Voir nos projets': 'הצגת הפרויקטים שלנו',
      'Nous contacter': 'צור קשר',
      'défiler': 'גלילה',

      // Trust band
      'EXPÉRIENCE': 'ניסיון',
      'CESSIONS': 'עסקאות',
      'FAMILLES': 'משפחות',
      'FRANCOPHONIE': 'צרפתית',
      'ans': 'שנים',
      'sur le marché israélien': 'בשוק הישראלי',
      'de transactions accompagnées': 'עסקאות מלוות',
      'familles francophones': 'משפחות דוברות צרפתית',
      'tout en français · A à Z': 'הכל בצרפתית · מא׳ עד ת׳',

      // Sélection
      'Sélection · printemps MMXXVI': 'מבחר · אביב MMXXVI',
      'Les biens récents': 'נכסים חדשים',
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
      'Votre expérience, notre réussite': 'החוויה שלך, ההצלחה שלנו',
      "d'exception": 'יוצא דופן',
      'rencontres improbables.': 'מפגשים בלתי צפויים.',
      "Découvrir l'agence →": '← גלו את הסוכנות',

      // Cities
      'Couverture territoriale': 'כיסוי גיאוגרפי',
      'Cinq villes,': 'חמש ערים,',
      'une équipe.': 'צוות אחד.',
      '8 BIENS': '8 נכסים',
      '4 BIENS': '4 נכסים',
      '3 BIENS': '3 נכסים',
      '2 BIENS': '2 נכסים',
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
      'À LOUER': 'להשכרה',
      'NEUF': 'חדש',
      'OCCASION': 'יד שנייה',
      'PROJET': 'פרויקט',
      'LOCAL COMMERCIAL': 'מסחרי',
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
      'Une agence': 'סוכנות',
      'à taille humaine.': 'בקנה מידה אנושי.',
      'Six visages, cinq langues, une exigence commune : que vous compreniez chaque ligne, à chaque étape. Nous ne déléguons rien — chaque dossier est suivi par la même personne, du premier rendez-vous à la remise des clés.': 'שישה פרצופים, חמש שפות, סטנדרט משותף אחד: שתבינו כל שורה, בכל שלב. אנו לא מאצילים דבר — כל תיק מטופל על ידי אותו אדם, מהפגישה הראשונה עד מסירת המפתחות.',
      "Une équipe aux parcours complémentaires, réunie par une même exigence : offrir un accompagnement clair, humain et irréprochable à chaque étape. Français, anglais, hébreu et russe — nos équipes accompagnent une clientèle internationale avec fluidité et précision. Profondément ancrés dans le marché immobilier israélien, nos agents suivent personnellement chaque projet, du premier échange jusqu'à la remise des clés, avec disponibilité, discrétion et engagement.": "צוות עם מסלולים משלימים, מאוחד סביב תקן אחד משותף: להעניק ליווי ברור, אנושי וללא דופי בכל שלב. צרפתית, אנגלית, עברית ורוסית — הצוותים שלנו מלווים לקוחות בינלאומיים בשטף ובדייקנות. מושרשים עמוקות בשוק הנדל\"ן הישראלי, סוכנינו מלווים אישית כל פרויקט, מההתכתבות הראשונה ועד מסירת המפתחות — בזמינות, בדיסקרטיות ובמחויבות.",
      'DIRECTEUR FONDATEUR · MMXIV': 'מייסד ומנהל · MMXIV',
      'Fondateur de la maison à Tel Aviv en 2014, après dix années en finance entre Paris et Londres. Il pilote la stratégie globale, les négociations sensibles et les relations avec les familles propriétaires.': 'מייסד הבית בתל אביב בשנת 2014, לאחר עשור בעולם הפיננסים בין פריז ללונדון. הוא מוביל את האסטרטגיה הכוללת, משאים ומתנים רגישים והקשרים עם משפחות הבעלים.',
      "DIRECTRICE D'AGENCE · MMXVIII": 'מנהלת הסוכנות · MMXVIII',
      "Parisienne d'origine, Nathalie pilote l'ensemble du cabinet francophone. Elle accompagne plus de 80 % de la clientèle française, suisse et belge — du premier rendez-vous parisien jusqu'à la remise des clés à Herzliya.": 'נטלי, פריזאית במקור, מנהלת את כל הפרקטיקה דוברת הצרפתית. היא מלווה למעלה מ-80% מהלקוחות הצרפתים, השוויצרים והבלגים — מהפגישה הראשונה בפריז ועד מסירת המפתחות בהרצליה.',
      'Prendre rendez-vous avec la direction →': '← קביעת פגישה עם ההנהלה',
      'Six conseiller·ère·s,': 'שישה יועצים,',
      'six langues maîtrisées.': 'שש שפות שולטות.',
      'CONSEILLÈRE ANGLOPHONE': 'יועצת דוברת אנגלית',
      'Clientèle internationale anglophone. Investisseurs étrangers, expatriés, primo-acquéreurs en Israël.': 'לקוחות בינלאומיים דוברי אנגלית. משקיעים זרים, אקספטים, רוכשים ראשונים בישראל.',
      "Parisienne d'origine, Nathalie pilote l'ensemble du cabinet francophone depuis Tel Aviv. Elle accompagne plus de 80 % de la clientèle française, suisse et belge — du premier rendez-vous parisien jusqu'à la remise des clés à Herzliya. Elle parle votre langue, comprend votre fiscalité, et tient à ce que vous lisiez chaque ligne avant de signer.": 'נטלי, פריזאית במקור, מנהלת את כל הפרקטיקה דוברת הצרפתית מתל אביב. היא מלווה למעלה מ-80% מהלקוחות הצרפתים, השוויצרים והבלגים — מהפגישה הראשונה בפריז ועד מסירת המפתחות בהרצליה. היא דוברת את שפתכם, מבינה את המסגרת המיסויית שלכם ועומדת על כך שתקראו כל שורה לפני החתימה.',
      'Son cabinet privé reçoit sur rendez-vous, à Paris (8ᵉ) comme à Tel Aviv (Rothschild). Discrétion absolue, méthode tranquille, exigence sans concession.': 'משרדה הפרטי מקבל בתיאום מראש בלבד, בפריז (הרובע ה-8) ובתל אביב (רוטשילד). דיסקרטיות מוחלטת, שיטה רגועה, סטנדרטים ללא פשרות.',
      'FORMATION': 'השכלה',
      'LANGUES': 'שפות',
      'Sciences Po Paris': "Sciences Po פריז",
      'EM Lyon · MBA Real Estate': 'EM Lyon · MBA נדל״ן',
      'Membre FNAIM, FIABCI': 'חברה ב-FNAIM, FIABCI',
      'Français': 'צרפתית',
      'Hébreu': 'עברית',
      'Anglais': 'אנגלית',
      'Russe': 'רוסית',
      'Prendre rendez-vous →': '← קביעת פגישה',
      'LE CABINET': 'המשרד',
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
      'UNE MAISON · UN INTERLOCUTEUR': 'בית אחד · איש קשר אחד',
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
      'Nos': 'העמלות',
      'honoraires.': 'שלנו.',
      'Transparence et clarté.': 'שקיפות ובהירות.',
      'Acquisition (côté acheteur)': 'רכישה (צד קונה)',
      'Cession (côté vendeur)': 'מכירה (צד מוכר)',
      'Mandat exclusif': 'ייפוי כוח בלעדי',
      'Conseil patrimonial': 'ייעוץ נכסים',

      // Agence — section titles
      'Une conversation,': 'שיחה,',
      'jamais une démonstration.': 'לעולם לא הדגמה.',
      'Quatre familles,': 'ארבע משפחות,',
      'quatre récits.': 'ארבעה סיפורים.',
      'Un rendez-vous,': 'פגישה,',
      'en confidence.': 'בדיסקרטיות.',
      'Nos conseiller·ère·s.': 'היועצים שלנו.',
      'Membre des principales institutions immobilières.': 'חבר במוסדות הנדל״ן המובילים.',
      'Membre des principales': 'חבר',
      'institutions immobilières.': 'במוסדות הנדל״ן המובילים.',
      'Chaque dossier est porté par un·e seul·e conseiller·ère, soutenu·e par la directrice. Pas de hand-off, pas de relais, pas de mauvaise surprise.': 'כל תיק מטופל על ידי יועץ·ת אחד·ת בלבד, בליווי המנהלת. ללא העברות, ללא ממסר, ללא הפתעות לא נעימות.',
      'Nous rencontrer →': 'בואו ניפגש →',
      "Maison indépendante de courtage immobilier, fondée à Tel Aviv en 2014 par Shahar Levi. Aujourd'hui dirigée à deux, accompagnant 214 familles francophones depuis sa création.": "סוכנות תיווך נדל\"ן עצמאית, נוסדה בתל אביב ב-2014 על ידי שחר לוי. כיום בהובלת שתיים, מלווה 214 משפחות דוברות צרפתית מאז הקמתה.",
      'I. Manifeste': 'I. מניפסט',
      'III. L\'équipe': 'III. הצוות',
      'VI. Reconnaissances et certifications': 'VI. הכרות ואישורים',
      // Agence manifesto pillars
      'DISCRÉTION': 'דיסקרטיות',
      'FRANCOPHONIE': 'שפה צרפתית',
      'RESPONSABILITÉ': 'אחריות',
      "Aucune pièce du portefeuille n'est publiée tant que les propriétaires ne l'autorisent pas. La majorité de nos cessions sont signées sans visite extérieure.": "אף נכס בתיק אינו מתפרסם עד שהבעלים מאשרים זאת. רוב המכירות שלנו נחתמות ללא ביקור חיצוני.",
      "100% du parcours en français. Du premier rendez-vous à la signature notariale, en passant par la fiscalité, le compromis et le notaire bilingue.": "100% מהמסלול בצרפתית. מהפגישה הראשונה ועד החתימה הנוטריונית, דרך המיסוי, ההסכם והנוטריון הדו-לשוני.",
      "Nous restons joignables longtemps après la remise des clés — mise en location, gestion, fiscalité FR/IL annuelle. La transaction n'est jamais terminée.": "אנו נשארים זמינים זמן רב לאחר מסירת המפתחות — השכרה, ניהול, מיסוי שנתי צרפת/ישראל. העסקה לעולם אינה מסתיימת.",
      'VII. Confidences clientes': 'VII. עדויות לקוחות',
      'Solliciter le cabinet': 'ליצור קשר עם הקבינט',
      'Envoyer la demande →': 'שלחו את הבקשה →',

      // Section tabs + property kind filter
      'Tout': 'הכל',
      'À vendre': 'למכירה',
      'À louer': 'להשכרה',
      'Type de bien': 'סוג הנכס',
      'Neuf': 'חדש',
      'Occasion': 'יד שנייה',
      'Projet': 'פרויקט',
      'Local commercial': 'מסחרי',
      '⇡ Avec ascenseur': '⇡ עם מעלית',
      '⇡ ASC': '⇡ מעלית',
      'ASCENSEUR': 'מעלית',
      'Ascenseur': 'מעלית',
      'Oui': 'כן',
      'Non': 'לא',
      // Portefeuille
      'Dix-neuf pièces': 'תשעה-עשר נכסים',
      'à céder discrètement.': 'להעברה בדיסקרטיות.',
      '★ Pièces signature': '★ נכסי חתימה',
      'À la une': 'מובחר',
      'Trier par': 'מיין לפי',
      'Pertinence': 'רלוונטיות',
      'Prix décroissant': 'מחיר (יורד)',
      'Prix croissant': 'מחיר (עולה)',
      'Surface ↓': 'שטח ↓',
      'Pièces ↓': 'חדרים ↓',
      'Récent': 'אחרונים',
      'Treize biens supplémentaires ne figurent pas ici.': 'שלושה-עשר נכסים נוספים אינם מוצגים כאן.',
      'bien': 'נכס',
      'biens': 'נכסים',
      'supplémentaires': 'נוספים',
      'Solliciter le carnet privé →': 'בקשו את הספר הפרטי →',
      'Villa front de mer.': 'וילה על קו החוף.',
      'Bauhaus restauré.': 'באוהאוס משוחזר.',
      'restauré.': 'משוחזר.',
      'Le portefeuille · printemps MMXXVI': 'התיק · אביב MMXXVI',
      "Chaque bien du portefeuille porte une référence, une provenance et l'accord explicite des propriétaires. La majorité ne sera jamais publiée publiquement — réservée à notre clientèle qualifiée.": 'כל נכס בתיק נושא הפניה, מקור והסכמה מפורשת של הבעלים. הרוב לעולם לא יפורסם בפומבי — שמור ללקוחותינו המוסמכים.',
      // Portefeuille — listing cards & filters
      // Hero search (homepage)
      'TROUVER UN BIEN': 'מצא נכס',
      'Ville': 'עיר',
      'Type': 'סוג',
      'Pièces minimum': 'חדרים מינימום',
      'Rechercher →': 'חפש →',
      // Portfolio search filters
      'Toutes les villes': 'כל הערים',
      'Tous les types': 'כל הסוגים',
      'Pièces': 'חדרים',
      'Appartement': 'דירה',
      'Penthouse': 'פנטהאוז',
      'Villa': 'וילה',
      'Loft': 'לופט',
      'Maison': 'בית',
      '2+ pièces': '2+ חדרים',
      '3+ pièces': '3+ חדרים',
      '4+ pièces': '4+ חדרים',
      '5+ pièces': '5+ חדרים',
      '6+ pièces': '6+ חדרים',
      '7+ pièces': '7+ חדרים',
      '8+ pièces': '8+ חדרים',
      'Indifférent': 'אין העדפה',
      'Tous budgets': 'כל התקציבים',
      "Jusqu'à 11 M ₪": 'עד 11 M ₪',
      'Au-delà de 65 M ₪': 'מעל 65 M ₪',
      // Footer (homepage)
      'VOTRE EXPÉRIENCE, NOTRE RÉUSSITE': 'החוויה שלך, ההצלחה שלנו',
      'Maison indépendante de courtage immobilier, fondée à Tel Aviv en 2014. Acquisitions et cessions privées sur invitation. Mossi\'a #4218 · FNAIM partenaire · FIABCI.': 'סוכנות תיווך נדל"ן עצמאית, נוסדה בתל אביב ב-2014. רכישות ומכירות פרטיות לפי הזמנה. רישיון #4218 · שותף FNAIM · FIABCI.',
      'PAGES': 'דפים',
      'VILLES': 'ערים',
      'CONTACT': 'יצירת קשר',
      'Accueil': 'דף הבית',
      "L'Agence": 'הסוכנות',
      'MENTIONS': 'תקנון',
      'RGPD': 'GDPR',
      'HONORAIRES': 'תעריפים',
      'NOUS SUIVRE': 'עקבו אחרינו',
      // CTA Contact section homepage
      'Cabinet privé': 'משרד פרטי',
      'À Tel Aviv, à Paris (sur rendez-vous), ou en visioconférence. Sans engagement, sans publication. Toujours en français.': 'בתל אביב, בפריז (לפי תיאום) או בשיחת וידאו. ללא התחייבות, ללא פרסום. תמיד בצרפתית.',
      'Solliciter un rendez-vous →': 'בקשו פגישה →',
      "« L'immobilier israélien, en confidence et en français. »": '« נדל"ן ישראלי, בדיסקרטיות ובצרפתית. »',
      'PIÈCES TOTAL': 'סך נכסים',
      'PIÈCE SIGNATURE': 'נכס חתימה',
      'À LA UNE': 'מומלץ',
      'QUARTIER': 'שכונה',
      'PIÈCES': 'חדרים',
      'SURFACE': 'שטח',
      'PRIX': 'מחיר',
      'RÉF': 'מס׳',
      'RÉF.': 'מס׳',
      'DÉTAILS': 'פרטים',
      'Voir l\'annonce': 'צפייה בנכס',
      'ÉTAGE': 'קומה',
      'Visiter →': 'לבקר →',
      'Aucun bien ne correspond.': 'אין נכס תואם.',
      "Essayez d'élargir vos critères, ou": 'נסו להרחיב את הקריטריונים, או',
      "demandez l'accès au carnet privé": 'בקשו גישה לספר הפרטי',
      '(13 pièces off-market non listées ici).': '(13 נכסים off-market שאינם מופיעים כאן).',
      'Réinitialiser les filtres': 'איפוס המסננים',
      'Chargement…': 'טוען…',
      'Adresse, référence, quartier…': 'כתובת, הפניה, שכונה…',
      'Pièces': 'חדרים',
      'Budget': 'תקציב',
      '+ Plus': '+ עוד',
      'BIENS OFF-MARKET': 'נכסי OFF-MARKET',
      '★ Signature': '★ חתימה',
      'pièces': 'חדרים',
      'pièce': 'חדר',
      'Retirer': 'הסר',
      'bien': 'נכס',
      'biens': 'נכסים',
      'BIEN': 'נכס',
      'BIENS': 'נכסים',

      // Journal — article cards & modal
      // Journal — page chrome
      'LE JOURNAL · ANALYSES, CONSEILS, REPORTAGES': 'הז׳ורנל · ניתוחים, ייעוץ, כתבות',
      'Le journal · MMXXVI': 'הז׳ורנל · MMXXVI',
      'Analyses, conseils,': 'ניתוחים, ייעוץ,',
      'reportages.': 'כתבות.',
      "Quarante-sept articles publiés depuis 2019 — sur l'immobilier israélien, l'aliyah, la fiscalité FR/IL, les quartiers, les notaires. Des analyses honnêtes, jamais commerciales.": 'ארבעים ושבע כתבות שפורסמו מאז 2019 — על נדל״ן ישראלי, עלייה, מיסוי צרפת/ישראל, השכונות, הנוטריונים. ניתוחים כנים, לעולם לא מסחריים.',
      'THÈMES': 'נושאים',
      'Tous': 'הכל',
      'Fiscalité': 'מיסוי',
      'Notarial': 'נוטריון',
      'Quartiers': 'שכונות',
      'Recevoir le journal': 'לקבל את הז׳ורנל',
      'avant publication.': 'לפני הפרסום.',
      '★ À LA UNE · MARCHÉ': '★ מובחר · שוק',
      '★ À LA UNE · ALIYAH': '★ מובחר · עלייה',
      '★ À LA UNE · PATRIMOINE': '★ מובחר · נכסים',
      '★ À LA UNE · DÉCRYPTAGE': '★ מובחר · ניתוח',
      'MARCHÉ': 'שוק',
      'PATRIMOINE': 'נכסים',
      'DÉCRYPTAGE': 'ניתוח',
      'MIN': 'דק׳',
      'PUBLIÉ LE': 'פורסם ב',
      "Lire l'article →": 'קרא את הכתבה →',
      'LIRE →': 'קרא →',
      'Aucun article publié pour le moment.': 'אין כתבות שפורסמו כרגע.',
      'Impossible de charger les articles.': 'לא ניתן לטעון את הכתבות.',
      'Fermer': 'סגירה',
      'Impossible de charger le portefeuille.': 'לא ניתן לטעון את התיק.',
      "Impossible de charger l'équipe.": 'לא ניתן לטעון את הצוות.',
      'visages': 'פנים',
      'langues': 'שפות',

      // Aliyah
      'Acheter avant': 'לקנות לפני',
      'de monter.': 'העלייה.',
      'Un parcours': 'מסלול',
      'balisé en français.': 'מסומן בצרפתית.',
      'Acheter en olé,': 'לקנות כעולה,',
      'économiser 6%.': 'לחסוך 6%.',
      '8% pour un étranger': '8% עבור תושב חוץ',
      '0—5% pour un olé hadash': '0—5% עבור עולה חדש',
      'Demander une simulation →': 'בקשו סימולציה →',
      'Les questions qu\'on nous pose souvent.': 'השאלות שאנו נשאלים לעיתים קרובות.',
      'qu\'on nous pose souvent.': 'שאנו נשאלים לעיתים קרובות.',
      'Voir le portefeuille': 'צפו בתיק',
      'Voir le portefeuille (19) →': 'צפו בתיק (19) →',

      // Aliyah — stats & 7 steps
      'ÉCONOMIE MOYENNE': 'חיסכון ממוצע',
      'DÉLAI MOYEN': 'זמן ממוצע',
      'FAMILLES ACCOMPAGNÉES': 'משפחות שליווינו',
      'sur un bien à 5M ₪ (vs taux étranger)': 'על נכס של 5 מיליון ₪ (לעומת שיעור לתושב חוץ)',
      'de la première visite à la signature': 'מהביקור הראשון ועד החתימה',
      "LES 7 ÉTAPES DE L'ALIYAH PATRIMONIALE": '7 השלבים של עליית הנכסים',
      'Visites présélectionnées': 'ביקורים מסוננים מראש',
      '2—3 JOURS EN ISRAËL': '2—3 ימים בישראל',
      'COMPROMIS NOTARIÉ': 'הסכם נוטריוני',
      'Financement': 'מימון',
      'CRÉDIT IL OU APPORT FR': 'משכנתא ישראלית או הון צרפתי',
      'Transfert des fonds': 'העברת הכספים',
      'DÉCLARATION TRÉSOR FR': 'הצהרה לאוצר הצרפתי',
      'ACTE DE VENTE + CADASTRE': 'שטר מכר + טאבו',
      'Suivi annuel': 'מעקב שנתי',
      'GESTION + FISCALITÉ FR/IL': 'ניהול + מיסוי צרפת/ישראל',
      'Le levier fiscal · Mas Rechisha': 'המינוף המס · מס רכישה',
      'EXEMPLE CHIFFRÉ · BIEN À 5 000 000 ₪': 'דוגמה מספרית · נכס ב-5,000,000 ₪',
      'Étranger non-résident': 'תושב חוץ',

      // Contact
      'Réponse sous 24h ouvrées.': 'תשובה תוך 24 שעות עסקים.',
      'PRÉNOM *': 'שם פרטי *',
      'TÉLÉPHONE': 'טלפון',
      'PAYS DE RÉSIDENCE ACTUEL': 'ארץ מגורים נוכחית',
      'OBJET DU RENDEZ-VOUS *': 'מטרת הפגישה *',
      'ENVELOPPE BUDGÉTAIRE': 'תקציב',
      'ZONE GÉOGRAPHIQUE': 'אזור גיאוגרפי',
      'FORMAT DU RENDEZ-VOUS PRÉFÉRÉ': 'פורמט פגישה מועדף',
      'Visioconférence': 'שיחת וידאו',
      'J\'accepte que mes données soient traitées conformément à la politique GDPR de la maison. Aucun partage avec des tiers.': 'אני מסכים·ה שהנתונים שלי יעובדו בהתאם למדיניות ה-GDPR של הבית. אין שיתוף עם צדדים שלישיים.',
      'Avant de nous contacter, peut-être ces réponses ?': 'לפני יצירת הקשר, אולי התשובות האלו?',
      'peut-être ces réponses ?': 'אולי התשובות האלו?',
      // Contact — additional copy
      'RÉPONSE SOUS 24H OUVRÉES · LUN—JEU 9H—18H IST': 'תשובה תוך 24 שעות עסקים · ב׳—ה׳ 9:00—18:00 IST',
      'CABINET PRIVÉ': 'משרד פרטי',
      'Un rendez-vous,': 'פגישה,',
      'À Tel Aviv, Paris (sur rendez-vous), ou en visioconférence. Sans engagement, sans frais initiaux. Toujours en français.': 'בתל אביב, פריז (לפי תיאום) או בשיחת וידאו. ללא התחייבות, ללא עלויות התחלתיות. תמיד בצרפתית.',
      'TEL AVIV (SIÈGE)': 'תל אביב (משרד ראשי)',
      'PARIS (SUR RENDEZ-VOUS)': 'פריז (לפי תיאום)',
      'DISPONIBILITÉ': 'זמינות',
      'UNE FOIS': 'פעם',
      'PAR MOIS': 'בחודש',
      'Pour les sollicitations confidentielles. Réponse personnelle de Nathalie sous 24h ouvrées.': 'לפניות חסויות. תשובה אישית מנטלי תוך 24 שעות עסקים.',
      'RÉSEAUX': 'רשתות',
      'YouTube · Le journal': 'YouTube · הז׳ורנל',
      'FORMULAIRE DE PRISE DE RENDEZ-VOUS': 'טופס בקשת פגישה',
      'sous 24h ouvrées.': 'תוך 24 שעות עסקים.',
      'France': 'צרפת',
      'Belgique': 'בלגיה',
      'Suisse': 'שווייץ',
      'Israël': 'ישראל',
      'Autre': 'אחר',
      'Préfère ne pas dire': 'מעדיף·ה לא להגיד',
      'Pas de préférence': 'ללא העדפה',
      'Plusieurs zones': 'מספר אזורים',

      // Footer common
      'Bureau & contact': 'משרד וצור קשר',
      'Tel Aviv 6688314 · Israël': 'תל אביב 6688314 · ישראל',

      // Misc
      'En savoir +': 'מידע נוסף',
      'Retour': 'חזרה',
      'Suivant': 'הבא',
      'Précédent': 'הקודם',
      'Voir tout': 'הצג הכל',
      'Page non trouvée': 'הדף לא נמצא',
      "La page que vous cherchez n'existe pas ou a été déplacée.": 'הדף שחיפשתם לא קיים או הועבר.',
      "Retour à l'accueil": 'חזרה לעמוד הבית',
      // Legal & 404 page chrome
      "BARÈME D'HONORAIRES · TRANSPARENT": "תעריפי שירות · שקיפות",
      'Barème transparent · MMXXVI': 'תעריף שקוף · MMXXVI',
      "Notre grille d'honoraires est publique, dégressive selon le montant de la transaction. Aucun frais caché, aucune facturation supplémentaire — tout est inclus dans le mandat signé.": 'תעריפי השירות שלנו פומביים, יורדים בהדרגה לפי גובה העסקה. ללא עלויות חבויות, ללא חיובים נוספים — הכל כלול במנדט החתום.',
      // Mentions légales — titles only
      'CONFORMITÉ LÉGALE': 'תאימות משפטית',
      'Mentions légales.': 'תקנון משפטי.',
      'Dernière mise à jour : 28 avril 2026': 'עודכן לאחרונה: 28 באפריל 2026',
      'Éditeur du site': 'מוציא לאור של האתר',
      'Hébergement': 'אחסון',
      'Propriété intellectuelle': 'קניין רוחני',
      'Crédits': 'קרדיטים',
      'Activité réglementée': 'פעילות מוסדרת',
      'Limitation de responsabilité': 'הגבלת אחריות',
      'Loi applicable et juridiction': 'הדין החל וסמכות השיפוט',
      // RGPD — titles only
      'CONFORMITÉ EUROPE': 'תאימות לאירופה',
      'Politique RGPD.': 'מדיניות GDPR.',
      'Vos données.': 'הנתונים שלכם.',
      // Footer short version
      'Maison indépendante de courtage immobilier. Tel Aviv depuis 2014. Mossi\'a #4218.': 'סוכנות תיווך נדל"ן עצמאית. תל אביב מאז 2014. רישיון #4218.',
      'MENTIONS LÉGALES': 'תקנון משפטי',
      'POLITIQUE RGPD · CONFORMITÉ EUROPE': 'מדיניות GDPR · תאימות לאירופה',
      'ERREUR 404 · PAGE INTROUVABLE': 'שגיאה 404 · הדף לא נמצא',
      'Cette pièce': 'נכס זה',
      "n'est plus": 'אינו עוד',
      'au portefeuille.': 'בתיק.',
      "Comme certains biens off-market, cette page a peut-être été retirée de la circulation. Reprenons la visite depuis le début.": 'כמו חלק מהנכסים off-market, ייתכן שהדף הזה הוסר. נתחיל מחדש את הסיור.',
      "Retour à l'accueil →": 'חזרה לעמוד הבית →',
      'Si le problème persiste, contactez-nous :': 'אם הבעיה נמשכת, צרו קשר :'
    },

    ru: {
      /* SL-ru-rep */
      "Réponse": "Ответ",
      /* SL-ru-rest */
      "Portefeuille de biens immobiliers de luxe en Israël": "Портфель элитной недвижимости в Израиле",
      "PORTEFEUILLE · MAJ 28.04.MMXXVI": "ПОРТФЕЛЬ · ОБНОВЛЕНО 28.04.MMXXVI",
      "19 PIÈCES À CÉDER · 13 EN OFF-MARKET": "19 ОБЪЕКТОВ В ПРОДАЖЕ · 13 OFF-MARKET",
      "＋ Plus": "＋ Ещё",
      "Surface min": "Площадь мин.",
      "Surface max": "Площадь макс.",
      "Nos biens disponibles": "Наши доступные объекты",
      "Chargement du portefeuille…": "Загрузка портфеля…",
      "Recherche par mot-clé": "Поиск по ключевому слову",
      "Trier les résultats": "Сортировать результаты",
      "Treize biens": "Тринадцать объектов",
      "ne figurent pas ici.": "здесь не представлены.",
      "Ils sont confiés à notre maison sous condition de discrétion absolue. Nous ne les présentons qu'à des acquéreurs qualifiés, après un premier rendez-vous.": "Они доверены нашему агентству на условиях полной конфиденциальности. Мы представляем их только квалифицированным покупателям после первой встречи.",
      "Netanya · Jérusalem · Ashkelon": "Нетания · Иерусалим · Ашкелон",
      "Tous · 47": "Все · 47",
      "Marché · 12": "Рынок · 12",
      "Fiscalité · 9": "Налоги · 9",
      "Quartiers · 7": "Районы · 7",
      "Demander d'autres analyses →": "Запросить другие материалы →",
      "Le carnet privé": "Частный блокнот",
      "Quelques envois par trimestre. Les nouveaux articles + les biens off-market avant publication. Jamais de spam.": "Несколько рассылок в квартал. Новые статьи + объекты off-market до публикации. Никогда никакого спама.",
      "S'inscrire →": "Подписаться →",
      "prenom@nom.fr": "name@email.com",
      "L'agence SHAHAR LEVI & NATHALIE HAIK Real Estate": "Агентство недвижимости SHAHAR LEVI & NATHALIE HAIK",
      "LA MAISON · DEPUIS MMXIV": "АГЕНТСТВО · С MMXIV",
      "Fondateur de la maison à Netanya en 2014, après dix années en finance entre Paris et Londres. Il pilote la stratégie globale, les négociations sensibles et les relations avec les familles propriétaires.": "Основатель агентства в Нетании в 2014 году, после десяти лет в финансах между Парижем и Лондоном. Он руководит общей стратегией, деликатными переговорами и отношениями с семьями-владельцами.",
      "LE CABINET": "КОМАНДА",
      "Caesarea & côte nord. Villas, golfs, biens d'exception — un œil pour la pierre rare.": "Кесария и северное побережье. Виллы, гольф-резиденции, исключительные объекты — глаз на редкий камень.",
      "Netanya & Herzliya. Spécialiste des biens en bord de mer et des résidences secondaires francophones.": "Нетания и Герцлия. Специалист по объектам на берегу моря и вторым домам для франкоязычных клиентов.",
      "Clientèle anglophone et russophone. Investissement patrimonial, structuration internationale.": "Англоязычные и русскоязычные клиенты. Инвестиции капитала, международное структурирование.",
      "Jérusalem & Netanya. Connaissance fine des quartiers résidentiels francophones et des projets neufs.": "Иерусалим и Нетания. Тонкое знание франкоязычных жилых районов и новых проектов.",
      "Première installation et accompagnement aliyah. Du Misrad Haklita à la remise des clés.": "Первичное обустройство и сопровождение алии. От Мисрад а-Клита до передачи ключей.",
      "À Netanya ou en visioconférence. Sans engagement. Toujours en français.": "В Нетании или по видеосвязи. Без обязательств. Всегда на французском.",
      "Shahar Levi — Directeur fondateur": "Shahar Levi — Директор-основатель",
      "Nathalie Haik — Directrice d'agence": "Nathalie Haik — Директор агентства",
      "Eyal Barone — Conseiller": "Eyal Barone — Консультант",
      "Chloé Mimoun — Conseillère senior": "Chloé Mimoun — Старший консультант",
      "Eden Rabinkov — Conseillère internationale": "Eden Rabinkov — Международный консультант",
      "Salomon Benhamou — Conseiller": "Salomon Benhamou — Консультант",
      "Neve Betan — Conseillère Aliyah": "Neve Betan — Консультант по алие",
      "Gal Hirschl — Conseillère anglophone": "Gal Hirschl — Англоязычный консультант",
      "Shoshana Damari 10, Piano Center · Ir Yamim, Netanya · Israël": "Шошана Дамари 10, Пиано Центр · Ир-Ямим, Нетания · Израиль",
      /* SL-ru-faq */
      "QUESTIONS FRÉQUENTES · IMMOBILIER EN ISRAËL": "ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ · НЕДВИЖИМОСТЬ В ИЗРАИЛЕ",
      "Questions fréquentes · MMXXVI": "Часто задаваемые вопросы · MMXXVI",
      "Tout ce qu'il faut savoir pour acheter, vendre ou investir dans l'immobilier de prestige en Israël, avec un interlocuteur francophone. Une autre question ?": "Всё, что нужно знать, чтобы купить, продать или инвестировать в элитную недвижимость в Израиле, с франкоязычным контактным лицом. Есть ещё вопрос?",
      "Écrivez-nous": "Напишите нам",
      "— réponse personnelle sous 24 h.": "— личный ответ в течение 24 ч.",
      "Quels sont les frais d'agence immobilière en Israël ?": "Каковы агентские комиссии за недвижимость в Израиле?",
      "En Israël, les honoraires d'agence sont généralement de l'ordre de 2 % du prix (plus TVA), à la charge du vendeur dans le cadre d'un mandat. Chez SHAHAR LEVI & NATHALIE HAIK, le barème est": "В Израиле агентская комиссия обычно составляет около 2% от цены (плюс НДС) и оплачивается продавцом в рамках договора. В SHAHAR LEVI & NATHALIE HAIK тариф",
      "dégressif": "регрессивный",
      "— de 3,5 % sous 2 M₪ à 2 % au-delà de 15 M₪ — entièrement transparent et inscrit au mandat signé, sans frais caché. Pour l'acquéreur, nos services de recherche sont": "— от 3,5% ниже 2 млн ₪ до 2% свыше 15 млн ₪ — полностью прозрачный и закреплённый в подписанном договоре, без скрытых платежей. Для покупателя наши услуги по поиску",
      "sans frais directs": "без прямых расходов",
      "Comment se déroule un achat immobilier à Netanya ?": "Как проходит покупка недвижимости в Нетании?",
      "L'achat suit plusieurs étapes : définition du cahier des charges, sélection et visites des biens, négociation du prix, vérification cadastrale (": "Покупка проходит несколько этапов: определение требований, подбор и просмотр объектов, переговоры о цене, кадастровая проверка (",
      "), signature du contrat de vente (": "), подписание договора купли-продажи (",
      "), puis inscription au Tabu et remise des clés. Notre maison coordonne l'avocat bilingue et la banque, et accompagne le client de la recherche jusqu'à la remise des clés.": "), затем регистрация в Табу и передача ключей. Наше агентство координирует двуязычного юриста и банк и сопровождает клиента от поиска до передачи ключей.",
      "Un non-résident ou un étranger peut-il acheter un bien en Israël ?": "Может ли нерезидент или иностранец купить недвижимость в Израиле?",
      "Oui. Il n'existe pas de restriction de nationalité pour acquérir un bien résidentiel en Israël : résidents comme non-résidents peuvent acheter. La principale différence concerne la": "Да. Нет ограничений по гражданству для приобретения жилой недвижимости в Израиле: покупать могут как резиденты, так и нерезиденты. Основное различие касается",
      "taxe d'achat (Mas Rechisha)": "налога на покупку (Mas Rechisha)",
      ", dont les taux varient selon le statut de l'acheteur et le prix du bien. Un financement bancaire israélien reste accessible aux non-résidents, généralement jusqu'à environ 50 % de la valeur.": ", ставки которого зависят от статуса покупателя и цены объекта. Израильское банковское финансирование доступно и нерезидентам, обычно до примерно 50% от стоимости.",
      "Quelles zones couvrez-vous ?": "Какие районы вы охватываете?",
      "La maison est établie à Netanya et intervient sur le littoral et les secteurs de prestige :": "Агентство находится в Нетании и работает на побережье и в престижных районах:",
      "(dont Ir Yamim), Herzliya, Césarée, Jérusalem et Tel Aviv. Nous sommes spécialisés dans les biens résidentiels haut de gamme — appartements, penthouses, villas — ainsi que les locaux commerciaux et bureaux.": "(включая Ир-Ямим), Герцлия, Кесария, Иерусалим и Тель-Авив. Мы специализируемся на элитной жилой недвижимости — квартиры, пентхаусы, виллы — а также на коммерческих помещениях и офисах.",
      "Proposez-vous des biens off-market (hors marché) ?": "Предлагаете ли вы объекты off-market (вне рынка)?",
      "Oui. Une partie de nos biens de prestige n'est pas diffusée publiquement, à la demande des vendeurs. Ces opportunités confidentielles sont présentées directement aux acquéreurs qualifiés. Il suffit de": "Да. Часть наших элитных объектов не публикуется открыто по просьбе продавцов. Эти конфиденциальные возможности представляются напрямую квалифицированным покупателям. Достаточно",
      "nous contacter": "связаться с нами",
      "pour accéder, sur dossier, à notre portefeuille off-market.": "чтобы получить доступ, по запросу, к нашему портфелю off-market.",
      "En quelles langues êtes-vous accompagné ?": "На каких языках осуществляется сопровождение?",
      "Notre équipe accompagne ses clients en": "Наша команда сопровождает клиентов на",
      "français, hébreu, anglais et russe": "французском, иврите, английском и русском",
      ". La maison s'adresse particulièrement à la clientèle francophone et à la diaspora qui investit en Israël, avec un interlocuteur dédié dans sa langue à chaque étape.": ". Агентство ориентировано прежде всего на франкоязычных клиентов и диаспору, инвестирующую в Израиле, с выделенным контактным лицом на их языке на каждом этапе.",
      "Faut-il un avocat pour acheter en Israël ?": "Нужен ли адвокат для покупки в Израиле?",
      "Oui, c'est l'usage et c'est vivement recommandé : en Israël, la transaction immobilière est sécurisée par un": "Да, это принято и настоятельно рекомендуется: в Израиле сделку с недвижимостью обеспечивает",
      "avocat spécialisé": "профильный адвокат",
      "qui rédige le contrat de vente (": ", который составляет договор купли-продажи (",
      ") et procède aux vérifications. Nous travaillons avec des praticiens bilingues et coordonnons l'ensemble pour le compte de nos clients.": ") и проводит проверки. Мы работаем с двуязычными специалистами и координируем весь процесс от имени наших клиентов.",
      "Pourquoi passer par un courtier agréé plutôt qu'en direct ?": "Почему стоит обращаться к лицензированному брокеру, а не напрямую?",
      "Un courtier agréé — titulaire d'une licence officielle, la nôtre porte le": "Лицензированный брокер — обладатель официальной лицензии, наша имеет",
      "n° 3183878": "№ 3183878",
      "— connaît les prix réels, donne accès aux biens off-market, maîtrise la négociation locale et les points de vigilance juridiques. Pour l'acquéreur, nos services de recherche sont sans frais directs, les honoraires étant portés par le mandat de vente. Vous gagnez du temps, de la sécurité et un meilleur prix.": "— знает реальные цены, даёт доступ к объектам off-market, владеет местными переговорами и юридическими нюансами. Для покупателя наши услуги по поиску без прямых расходов, так как комиссия покрывается договором продажи. Вы экономите время, получаете надёжность и лучшую цену.",
      "Poser votre question →": "Задайте свой вопрос →",
      /* SL-ru-contact */
      "RÉPONSE SOUS 24H OUVRÉES · DIM—JEU 9H—18H IST": "ОТВЕТ В ТЕЧЕНИЕ 24 РАБОЧИХ ЧАСОВ · ВС—ЧТ 9:00—18:00 IST",
      "À Netanya ou en visioconférence. Sans engagement, sans frais initiaux. Toujours en français.": "В Нетании или по видеосвязи. Без обязательств, без первоначальных расходов. Всегда на французском.",
      "NETANYA (SIÈGE)": "НЕТАНИЯ (ГЛАВНЫЙ ОФИС)",
      "HORAIRES": "ЧАСЫ РАБОТЫ",
      "DIM—JEU 9H—18H": "ВС—ЧТ 9:00—18:00",
      "VEN 9H—14H": "ПТ 9:00—14:00",
      "EMAIL DIRECT": "ПРЯМОЙ EMAIL",
      "NOM *": "ФАМИЛИЯ *",
      "Acquisition · résidence secondaire": "Покупка · второй дом",
      "Acquisition · aliyah patrimoniale": "Покупка · алия (инвестиция капитала)",
      "Acquisition · investissement locatif": "Покупка · арендная инвестиция",
      "Cession · vente de mon bien": "Продажа · продажа моего объекта",
      "Conseil · estimation discrète": "Консультация · конфиденциальная оценка",
      "Conseil · fiscalité FR/IL": "Консультация · налогообложение FR/IL",
      "VOTRE PROJET": "ВАШ ПРОЕКТ",
      "J'accepte que mes données soient traitées conformément à la": "Я согласен(на), что мои данные будут обработаны в соответствии с",
      "politique RGPD": "политикой GDPR",
      "de la maison. Aucun partage avec des tiers.": "агентства. Без передачи третьим лицам.",
      "⊕ Réponse personnelle de Nathalie sous 24h ouvrées": "⊕ Личный ответ Натали в течение 24 рабочих часов",
      "Avant de nous contacter,": "Прежде чем связаться с нами,",
      "Faut-il être citoyen israélien pour acheter en Israël ?": "Нужно ли быть гражданином Израиля, чтобы купить недвижимость в Израиле?",
      "Non. Tout étranger peut acheter librement. En revanche, un acquéreur étranger paie 8% de Mas Rechisha (taxe d'achat) au lieu de 0—5% pour un olé hadash. C'est pourquoi l'aliyah patrimoniale (acheter avant ou pendant la procédure) est intéressante.": "Нет. Любой иностранец может свободно покупать. Однако иностранный покупатель платит 8% налога на покупку (Mas Rechisha) вместо 0—5% для нового репатрианта (оле хадаш). Поэтому покупка до или во время процесса репатриации выгодна.",
      "Quels sont vos honoraires ?": "Каковы ваши комиссионные?",
      "Sur les acquisitions, nos honoraires sont à la charge du vendeur (commission inscrite au mandat). Pour le client acquéreur, nos services sont sans frais directs. Sur les cessions, nos honoraires varient selon la complexité du dossier — discutés et fixés au mandat. Grille publique disponible sur demande.": "При покупке наши комиссионные оплачивает продавец (комиссия закреплена в договоре). Для покупателя наши услуги без прямых расходов. При продаже комиссионные зависят от сложности сделки — обсуждаются и фиксируются в договоре. Публичный тариф доступен по запросу.",
      "Combien de temps prend une transaction en Israël ?": "Сколько времени занимает сделка в Израиле?",
      "Le délai médian est de 52 jours entre le heskem zikaron (compromis) et le heskem mekher avec inscription au Tabu. Pour un acquéreur depuis la France, le parcours complet dure en moyenne 8 à 14 mois.": "Медианный срок — 52 дня между хескем зикарон (предварительным договором) и хескем мехер с регистрацией в Табу. Для покупателя из Франции весь процесс занимает в среднем от 8 до 14 месяцев.",
      "Travaillez-vous avec un notaire spécifique ?": "Работаете ли вы с конкретным нотариусом?",
      "Oui — Maître Eitan Cohen, notaire bilingue inscrit aux barreaux de Tel Aviv et Paris. Toutes les transactions de la maison passent par son cabinet. Vous lisez ce que vous signez.": "Да — мэтр Эйтан Коэн, двуязычный нотариус, член коллегий адвокатов Тель-Авива и Парижа. Все сделки агентства проходят через его контору. Вы читаете то, что подписываете.",
      "Les biens du portefeuille sont-ils tous off-market ?": "Все ли объекты портфеля являются off-market?",
      "La majorité (environ 70%) ne sont pas publiés sur les portails publics israéliens. Les autres 30% sont aussi visibles sur Yad2/Madlan mais nous accompagnons exclusivement en français.": "Большинство (около 70%) не публикуются на израильских публичных порталах. Остальные 30% также видны на Yad2/Madlan, но мы сопровождаем исключительно на французском языке.",
      "Quelle fiscalité s'applique en France pour un bien en Israël ?": "Какое налогообложение применяется во Франции к недвижимости в Израиле?",
      "La convention fiscale franco-israélienne du 31 juillet 1995 évite la double imposition. Revenus locatifs déclarés en France, IFI au-delà de 1.3 M€ de patrimoine immobilier, plus-value imposable en France. Nous travaillons avec un fiscaliste FR/IL si nécessaire.": "Налоговая конвенция между Францией и Израилем от 31 июля 1995 года устраняет двойное налогообложение. Доход от аренды декларируется во Франции, налог IFI применяется при объёме недвижимости свыше 1,3 млн €, прирост капитала облагается налогом во Франции. При необходимости мы работаем с налоговым консультантом FR/IL.",
      "Votre prénom": "Ваше имя",
      "Votre nom": "Ваша фамилия",
      "Pays de résidence actuel": "Текущая страна проживания",
      "Objet du rendez-vous": "Тема встречи",
      "Enveloppe budgétaire": "Бюджетный диапазон",
      "Zone géographique": "Географическая зона",
      "Quelques lignes sur votre projet, vos contraintes, vos questions...": "Несколько строк о вашем проекте, ваших ограничениях, ваших вопросах...",
      /* SL-i18n-completion-v1 */
      "Aller au contenu principal": "Перейти к основному содержанию",
      "Nous contacter →": "Связаться с нами →",
      "Discuter sur WhatsApp": "Написать в WhatsApp",
      "ACCESSIBILITÉ": "ДОСТУПНОСТЬ",
      "Menu": "Меню",
      "Ir Yamim, Netanya · Israël": "Ир-Ямим, Нетания · Израиль",
      "EN LIGNE · DIM—JEU 9H—18H IST": "ОНЛАЙН · ВС—ЧТ 9:00—18:00 IST",
      "Lic. courtier 3183878": "Лиц. брокера 3183878",
      "Composez votre recherche.": "Составьте свой поиск.",
      "Bureaux": "Офисы",
      "Terrain": "Участок",
      "Immeuble": "Здание",
      "Mrd ₪": "млрд ₪",
      "Chargement de la sélection…": "Загрузка подборки…",
      "Nous croyons qu'un bien": "Мы убеждены, что объект",
      "ne se vend pas — il se confie. À une famille, un héritier, un connaisseur. Notre métier consiste à orchestrer, dans la plus grande confidentialité, des": "не продаётся — его доверяют. Семье, наследнику, ценителю. Наше ремесло — с величайшей конфиденциальностью выстраивать",
      "À Netanya, à Paris (sur rendez-vous), ou en visioconférence. Sans engagement, sans publication. Toujours en français.": "В Нетании, в Париже (по записи) или по видеосвязи. Без обязательств, без публикации. Всегда на французском.",
      "Villa de luxe en Israël - SHAHAR LEVI & NATHALIE HAIK Real Estate": "Элитная вилла в Израиле - SHAHAR LEVI & NATHALIE HAIK Real Estate",
      "Bien d’exception à Tel Aviv": "Исключительный объект в Тель-Авиве",
      "Villa contemporaine en Israël": "Современная вилла в Израиле",
      "Penthouse vue mer en Israël": "Пентхаус с видом на море в Израиле",
      "Maison de prestige à Caesarea": "Престижный дом в Кейсарии",
      "Appartement de standing à Jérusalem": "Престижная квартира в Иерусалиме",
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
      'NOUS SUIVRE': 'СЛЕДИТЕ ЗА НАМИ',

      // Hero
      "L'immobilier israélien,": 'Недвижимость Израиля,',
      'en français.': 'на французском.',
      'Votre projet immobilier en Israël,': 'Ваш проект недвижимости в Израиле,',
      'en toute sérénité.': 'с полным спокойствием.',
      "Maison de courtage indépendante fondée à Tel Aviv en 2014. Acquisitions et cessions privées sur invitation, accompagnement aliyah, investissement patrimonial — pour une clientèle francophone exigeante.": 'Независимое брокерское агентство, основанное в Тель-Авиве в 2014 году. Частные приобретения и продажи по приглашению, сопровождение алии, имущественные инвестиции — для требовательной франкоязычной клиентуры.',
      'Voir le portefeuille (19) →': 'Посмотреть портфолио (19) →',
      'Confier un mandat': 'Передать мандат',
      'Voir nos projets': 'Наши проекты',
      'Nous contacter': 'Связаться с нами',
      'défiler': 'листать',

      // Trust band
      'EXPÉRIENCE': 'ОПЫТ',
      'CESSIONS': 'СДЕЛКИ',
      'FAMILLES': 'СЕМЬИ',
      'FRANCOPHONIE': 'ФРАНЦУЗСКИЙ',
      'ans': 'лет',
      'sur le marché israélien': 'на израильском рынке',
      'de transactions accompagnées': 'сопровождённых сделок',
      'familles francophones': 'франкоязычных семей',
      'tout en français · A à Z': 'всё на французском · от А до Я',

      // Sélection
      'Sélection · printemps MMXXVI': 'Подборка · весна MMXXVI',
      'Les biens récents': 'Недавние объекты',
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
      'Votre expérience, notre réussite': 'Ваш опыт, наш успех',
      "d'exception": 'исключительная',
      'rencontres improbables.': 'невероятные встречи.',
      "Découvrir l'agence →": 'Открыть агентство →',

      // Cities
      'Couverture territoriale': 'Территориальное покрытие',
      'Cinq villes,': 'Пять городов,',
      'une équipe.': 'одна команда.',
      '8 BIENS': '8 ОБЪЕКТОВ',
      '4 BIENS': '4 ОБЪЕКТА',
      '3 BIENS': '3 ОБЪЕКТА',
      '2 BIENS': '2 ОБЪЕКТА',
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
      'À LOUER': 'В АРЕНДУ',
      'NEUF': 'НОВОСТРОЙКА',
      'OCCASION': 'ВТОРИЧНОЕ',
      'PROJET': 'ПРОЕКТ',
      'LOCAL COMMERCIAL': 'КОММЕРЧЕСКАЯ',
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
      "Une équipe aux parcours complémentaires, réunie par une même exigence : offrir un accompagnement clair, humain et irréprochable à chaque étape. Français, anglais, hébreu et russe — nos équipes accompagnent une clientèle internationale avec fluidité et précision. Profondément ancrés dans le marché immobilier israélien, nos agents suivent personnellement chaque projet, du premier échange jusqu'à la remise des clés, avec disponibilité, discrétion et engagement.": "Команда с дополняющими друг друга путями, объединённая одним общим требованием: обеспечить ясное, человеческое и безупречное сопровождение на каждом этапе. Французский, английский, иврит и русский — наши команды работают с международной клиентурой плавно и точно. Глубоко укоренившись в израильском рынке недвижимости, наши агенты лично сопровождают каждый проект — от первого контакта до передачи ключей — с доступностью, деликатностью и приверженностью.",
      'DIRECTEUR FONDATEUR · MMXIV': 'ДИРЕКТОР-ОСНОВАТЕЛЬ · MMXIV',
      'Fondateur de la maison à Tel Aviv en 2014, après dix années en finance entre Paris et Londres. Il pilote la stratégie globale, les négociations sensibles et les relations avec les familles propriétaires.': 'Основатель дома в Тель-Авиве в 2014 году, после десяти лет работы в финансах между Парижем и Лондоном. Он руководит общей стратегией, деликатными переговорами и отношениями с семьями-владельцами.',
      "DIRECTRICE D'AGENCE · MMXVIII": 'ДИРЕКТОР АГЕНТСТВА · MMXVIII',
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
      'Nos': 'Наши',
      'honoraires.': 'гонорары.',
      'Transparence et clarté.': 'Прозрачность и ясность.',
      'Acquisition (côté acheteur)': 'Приобретение (сторона покупателя)',
      'Cession (côté vendeur)': 'Продажа (сторона продавца)',
      'Mandat exclusif': 'Эксклюзивный мандат',
      'Conseil patrimonial': 'Консультация по имуществу',

      // Agence — section titles
      'Une agence': 'Агентство',
      'à taille humaine.': 'на человеческий уровень.',
      'Une conversation,': 'Беседа,',
      'jamais une démonstration.': 'никогда не демонстрация.',
      'Quatre familles,': 'Четыре семьи,',
      'quatre récits.': 'четыре истории.',
      'Un rendez-vous,': 'Встреча,',
      'en confidence.': 'наедине.',
      'Nos conseiller·ère·s.': 'Наши консультанты.',
      'Membre des principales institutions immobilières.': 'Член ведущих институтов недвижимости.',
      'Membre des principales': 'Член ведущих',
      'institutions immobilières.': 'институтов недвижимости.',
      'Chaque dossier est porté par un·e seul·e conseiller·ère, soutenu·e par la directrice. Pas de hand-off, pas de relais, pas de mauvaise surprise.': 'Каждое дело ведёт один консультант при поддержке директрисы. Без передач, без посредников, без неприятных сюрпризов.',
      'Nous rencontrer →': 'Встретиться с нами →',
      'I. Manifeste': 'I. Манифест',
      'III. L\'équipe': 'III. Команда',
      'VI. Reconnaissances et certifications': 'VI. Признание и сертификации',
      // Agence manifesto pillars
      'DISCRÉTION': 'ДИСКРЕТНОСТЬ',
      'FRANCOPHONIE': 'ФРАНКОЯЗЫЧНОСТЬ',
      'RESPONSABILITÉ': 'ОТВЕТСТВЕННОСТЬ',
      "Aucune pièce du portefeuille n'est publiée tant que les propriétaires ne l'autorisent pas. La majorité de nos cessions sont signées sans visite extérieure.": "Ни один объект из портфолио не публикуется, пока собственники не разрешат. Большинство наших сделок подписываются без внешнего визита.",
      "100% du parcours en français. Du premier rendez-vous à la signature notariale, en passant par la fiscalité, le compromis et le notaire bilingue.": "100% пути на французском. От первой встречи до нотариального подписания, через налогообложение, предварительный договор и двуязычного нотариуса.",
      "Nous restons joignables longtemps après la remise des clés — mise en location, gestion, fiscalité FR/IL annuelle. La transaction n'est jamais terminée.": "Мы остаёмся на связи долго после передачи ключей — сдача в аренду, управление, ежегодное налогообложение FR/IL. Сделка никогда не завершается.",
      'VII. Confidences clientes': 'VII. Отзывы клиентов',
      'Solliciter le cabinet': 'Запросить кабинет',
      'Envoyer la demande →': 'Отправить запрос →',

      // Section tabs + property kind filter
      'Tout': 'Всё',
      'À vendre': 'Продажа',
      'À louer': 'Аренда',
      'Type de bien': 'Тип объекта',
      'Neuf': 'Новостройка',
      'Occasion': 'Вторичка',
      'Projet': 'Проект',
      'Local commercial': 'Коммерческое',
      '⇡ Avec ascenseur': '⇡ С лифтом',
      '⇡ ASC': '⇡ ЛИФТ',
      'ASCENSEUR': 'ЛИФТ',
      'Ascenseur': 'Лифт',
      'Oui': 'Да',
      'Non': 'Нет',
      // Portefeuille
      'Dix-neuf pièces': 'Девятнадцать объектов',
      'à céder discrètement.': 'к передаче в дискретности.',
      '★ Pièces signature': '★ Подписные объекты',
      'À la une': 'В фокусе',
      'Trier par': 'Сортировать по',
      'Pertinence': 'Релевантность',
      'Prix décroissant': 'Цена (по убыванию)',
      'Prix croissant': 'Цена (по возрастанию)',
      'Surface ↓': 'Площадь ↓',
      'Pièces ↓': 'Комнат ↓',
      'Récent': 'Недавние',
      'Treize biens supplémentaires ne figurent pas ici.': 'Тринадцать дополнительных объектов не отображаются здесь.',
      'bien': 'объект',
      'biens': 'объекта',
      'supplémentaires': 'дополнительных',
      'Solliciter le carnet privé →': 'Запросить частный каталог →',
      'Villa front de mer.': 'Вилла на берегу моря.',
      'Bauhaus restauré.': 'Реставрированный Баухаус.',
      'restauré.': 'реставрированный.',
      'Le portefeuille · printemps MMXXVI': 'Портфолио · весна MMXXVI',
      "Chaque bien du portefeuille porte une référence, une provenance et l'accord explicite des propriétaires. La majorité ne sera jamais publiée publiquement — réservée à notre clientèle qualifiée.": 'Каждый объект в портфолио имеет референс, происхождение и явное согласие собственников. Большинство никогда не будет опубликовано публично — зарезервировано для нашей квалифицированной клиентуры.',
      // Portefeuille — listing cards & filters
      // Hero search (homepage)
      'TROUVER UN BIEN': 'НАЙТИ ОБЪЕКТ',
      'Ville': 'Город',
      'Type': 'Тип',
      'Pièces minimum': 'Минимум комнат',
      'Rechercher →': 'Искать →',
      // Portfolio search filters
      'Toutes les villes': 'Все города',
      'Tous les types': 'Все типы',
      'Pièces': 'Комнаты',
      'Appartement': 'Квартира',
      'Penthouse': 'Пентхаус',
      'Villa': 'Вилла',
      'Loft': 'Лофт',
      'Maison': 'Дом',
      '2+ pièces': '2+ комнаты',
      '3+ pièces': '3+ комнаты',
      '4+ pièces': '4+ комнаты',
      '5+ pièces': '5+ комнат',
      '6+ pièces': '6+ комнат',
      '7+ pièces': '7+ комнат',
      '8+ pièces': '8+ комнат',
      'Indifférent': 'Не важно',
      'Tous budgets': 'Все бюджеты',
      "Jusqu'à 11 M ₪": 'До 11 M ₪',
      'Au-delà de 65 M ₪': 'Свыше 65 M ₪',
      // Footer (homepage)
      'VOTRE EXPÉRIENCE, NOTRE RÉUSSITE': 'ВАШ ОПЫТ, НАШ УСПЕХ',
      'Maison indépendante de courtage immobilier, fondée à Tel Aviv en 2014. Acquisitions et cessions privées sur invitation. Mossi\'a #4218 · FNAIM partenaire · FIABCI.': 'Независимое агентство недвижимости, основано в Тель-Авиве в 2014 году. Частные приобретения и продажи по приглашению. Лицензия #4218 · партнёр FNAIM · FIABCI.',
      'PAGES': 'СТРАНИЦЫ',
      'VILLES': 'ГОРОДА',
      'CONTACT': 'КОНТАКТЫ',
      'Accueil': 'Главная',
      "L'Agence": 'Агентство',
      'MENTIONS': 'ПРАВОВОЕ',
      'RGPD': 'GDPR',
      'HONORAIRES': 'ГОНОРАРЫ',
      'NOUS SUIVRE': 'ПОДПИШИТЕСЬ',
      // CTA Contact section homepage
      'Cabinet privé': 'Частный кабинет',
      'À Tel Aviv, à Paris (sur rendez-vous), ou en visioconférence. Sans engagement, sans publication. Toujours en français.': 'В Тель-Авиве, в Париже (по записи) или по видеосвязи. Без обязательств, без публикации. Всегда на французском.',
      'Solliciter un rendez-vous →': 'Запросить встречу →',
      "« L'immobilier israélien, en confidence et en français. »": '« Недвижимость Израиля, в дискретности и на французском. »',
      'PIÈCES TOTAL': 'ВСЕГО ОБЪЕКТОВ',
      'PIÈCE SIGNATURE': 'ПОДПИСНОЙ ОБЪЕКТ',
      'À LA UNE': 'ИЗБРАННОЕ',
      'QUARTIER': 'РАЙОН',
      'PIÈCES': 'КОМНАТ',
      'SURFACE': 'ПЛОЩАДЬ',
      'PRIX': 'ЦЕНА',
      'RÉF': '№',
      'RÉF.': '№',
      'DÉTAILS': 'ДЕТАЛИ',
      'Voir l\'annonce': 'Открыть объект',
      'ÉTAGE': 'ЭТАЖ',
      'Visiter →': 'Посетить →',
      'Aucun bien ne correspond.': 'Нет подходящих объектов.',
      "Essayez d'élargir vos critères, ou": 'Попробуйте расширить критерии, или',
      "demandez l'accès au carnet privé": 'запросите доступ к частному каталогу',
      '(13 pièces off-market non listées ici).': '(13 off-market объектов не указаны здесь).',
      'Réinitialiser les filtres': 'Сбросить фильтры',
      'Chargement…': 'Загрузка…',
      'Adresse, référence, quartier…': 'Адрес, референс, район…',
      'Pièces': 'Комнат',
      'Budget': 'Бюджет',
      '+ Plus': '+ Больше',
      'BIENS OFF-MARKET': 'OFF-MARKET ОБЪЕКТЫ',
      '★ Signature': '★ Подпись',
      'pièces': 'комнат',
      'pièce': 'комната',
      'Retirer': 'Удалить',
      'bien': 'объект',
      'biens': 'объектов',
      'BIEN': 'ОБЪЕКТ',
      'BIENS': 'ОБЪЕКТОВ',

      // Journal — article cards & modal
      // Journal — page chrome
      'LE JOURNAL · ANALYSES, CONSEILS, REPORTAGES': 'ЖУРНАЛ · АНАЛИЗ, СОВЕТЫ, РЕПОРТАЖИ',
      'Le journal · MMXXVI': 'Журнал · MMXXVI',
      'Analyses, conseils,': 'Анализ, советы,',
      'reportages.': 'репортажи.',
      "Quarante-sept articles publiés depuis 2019 — sur l'immobilier israélien, l'aliyah, la fiscalité FR/IL, les quartiers, les notaires. Des analyses honnêtes, jamais commerciales.": 'Сорок семь статей опубликовано с 2019 года — об израильской недвижимости, алии, налогообложении FR/IL, районах, нотариусах. Честный анализ, никогда не коммерческий.',
      'THÈMES': 'ТЕМЫ',
      'Tous': 'Все',
      'Fiscalité': 'Налогообложение',
      'Notarial': 'Нотариат',
      'Quartiers': 'Районы',
      'Recevoir le journal': 'Получать журнал',
      'avant publication.': 'до публикации.',
      '★ À LA UNE · MARCHÉ': '★ В ФОКУСЕ · РЫНОК',
      '★ À LA UNE · ALIYAH': '★ В ФОКУСЕ · АЛИЯ',
      '★ À LA UNE · PATRIMOINE': '★ В ФОКУСЕ · ИМУЩЕСТВО',
      '★ À LA UNE · DÉCRYPTAGE': '★ В ФОКУСЕ · АНАЛИЗ',
      'MARCHÉ': 'РЫНОК',
      'PATRIMOINE': 'ИМУЩЕСТВО',
      'DÉCRYPTAGE': 'АНАЛИЗ',
      'MIN': 'МИН',
      'PUBLIÉ LE': 'ОПУБЛИКОВАНО',
      "Lire l'article →": 'Читать статью →',
      'LIRE →': 'ЧИТАТЬ →',
      'Aucun article publié pour le moment.': 'Нет опубликованных статей.',
      'Impossible de charger les articles.': 'Не удалось загрузить статьи.',
      'Fermer': 'Закрыть',
      'Impossible de charger le portefeuille.': 'Не удалось загрузить портфолио.',
      "Impossible de charger l'équipe.": 'Не удалось загрузить команду.',
      'visages': 'лиц',
      'langues': 'языков',

      // Aliyah
      'Acheter avant': 'Купить до',
      'de monter.': 'алии.',
      'Un parcours': 'Путь',
      'balisé en français.': 'на французском.',
      'Acheter en olé,': 'Купить как оле,',
      'économiser 6%.': 'сэкономить 6%.',
      '8% pour un étranger': '8% для иностранца',
      '0—5% pour un olé hadash': '0—5% для оле хадаш',
      'Demander une simulation →': 'Запросить симуляцию →',
      'Les questions qu\'on nous pose souvent.': 'Часто задаваемые вопросы.',
      'qu\'on nous pose souvent.': 'часто задаваемые.',
      'Voir le portefeuille': 'Смотреть портфолио',
      'Voir le portefeuille (19) →': 'Смотреть портфолио (19) →',

      // Aliyah — stats & 7 steps
      'ÉCONOMIE MOYENNE': 'СРЕДНЯЯ ЭКОНОМИЯ',
      'DÉLAI MOYEN': 'СРЕДНИЙ СРОК',
      'FAMILLES ACCOMPAGNÉES': 'СОПРОВОЖДЁННЫХ СЕМЕЙ',
      'sur un bien à 5M ₪ (vs taux étranger)': 'на объект 5 млн ₪ (vs ставка иностранца)',
      'de la première visite à la signature': 'от первого визита до подписания',
      "LES 7 ÉTAPES DE L'ALIYAH PATRIMONIALE": '7 ЭТАПОВ ИМУЩЕСТВЕННОЙ АЛИИ',
      'Visites présélectionnées': 'Предварительно отобранные визиты',
      '2—3 JOURS EN ISRAËL': '2—3 ДНЯ В ИЗРАИЛЕ',
      'COMPROMIS NOTARIÉ': 'НОТАРИАЛЬНОЕ СОГЛАШЕНИЕ',
      'Financement': 'Финансирование',
      'CRÉDIT IL OU APPORT FR': 'ИЗРАИЛЬСКИЙ КРЕДИТ ИЛИ ФРАНЦУЗСКИЙ ВЗНОС',
      'Transfert des fonds': 'Перевод средств',
      'DÉCLARATION TRÉSOR FR': 'ДЕКЛАРАЦИЯ ФР. КАЗНАЧЕЙСТВА',
      'ACTE DE VENTE + CADASTRE': 'АКТ ПРОДАЖИ + КАДАСТР',
      'Suivi annuel': 'Ежегодное сопровождение',
      'GESTION + FISCALITÉ FR/IL': 'УПРАВЛЕНИЕ + НАЛОГИ FR/IL',
      'Le levier fiscal · Mas Rechisha': 'Налоговый рычаг · Мас Рехиша',
      'EXEMPLE CHIFFRÉ · BIEN À 5 000 000 ₪': 'РАСЧЁТНЫЙ ПРИМЕР · ОБЪЕКТ ПО 5 000 000 ₪',
      'Étranger non-résident': 'Иностранец нерезидент',

      // Contact
      'Réponse sous 24h ouvrées.': 'Ответ в течение 24 рабочих часов.',
      'PRÉNOM *': 'ИМЯ *',
      'TÉLÉPHONE': 'ТЕЛЕФОН',
      'PAYS DE RÉSIDENCE ACTUEL': 'СТРАНА ТЕКУЩЕГО ПРОЖИВАНИЯ',
      'OBJET DU RENDEZ-VOUS *': 'ЦЕЛЬ ВСТРЕЧИ *',
      'ENVELOPPE BUDGÉTAIRE': 'БЮДЖЕТ',
      'ZONE GÉOGRAPHIQUE': 'ГЕОГРАФИЧЕСКАЯ ЗОНА',
      'FORMAT DU RENDEZ-VOUS PRÉFÉRÉ': 'ПРЕДПОЧТИТЕЛЬНЫЙ ФОРМАТ ВСТРЕЧИ',
      'Visioconférence': 'Видеоконференция',
      'J\'accepte que mes données soient traitées conformément à la politique GDPR de la maison. Aucun partage avec des tiers.': 'Я согласен(на), что мои данные будут обработаны в соответствии с политикой GDPR дома. Никакой передачи третьим лицам.',
      'Avant de nous contacter, peut-être ces réponses ?': 'Перед тем как связаться с нами, может быть, эти ответы?',
      'peut-être ces réponses ?': 'может быть, эти ответы?',
      // Contact — additional copy
      'RÉPONSE SOUS 24H OUVRÉES · LUN—JEU 9H—18H IST': 'ОТВЕТ В ТЕЧЕНИЕ 24 РАБОЧИХ ЧАСОВ · ПН—ЧТ 9:00—18:00 IST',
      'CABINET PRIVÉ': 'ЧАСТНЫЙ КАБИНЕТ',
      'Un rendez-vous,': 'Встреча,',
      'À Tel Aviv, Paris (sur rendez-vous), ou en visioconférence. Sans engagement, sans frais initiaux. Toujours en français.': 'В Тель-Авиве, Париже (по записи) или по видеосвязи. Без обязательств, без предварительных расходов. Всегда на французском.',
      'TEL AVIV (SIÈGE)': 'ТЕЛЬ-АВИВ (ГЛАВНЫЙ ОФИС)',
      'PARIS (SUR RENDEZ-VOUS)': 'ПАРИЖ (ПО ЗАПИСИ)',
      'DISPONIBILITÉ': 'ДОСТУПНОСТЬ',
      'UNE FOIS': 'ОДИН РАЗ',
      'PAR MOIS': 'В МЕСЯЦ',
      'Pour les sollicitations confidentielles. Réponse personnelle de Nathalie sous 24h ouvrées.': 'Для конфиденциальных запросов. Личный ответ от Натали в течение 24 рабочих часов.',
      'RÉSEAUX': 'СОЦСЕТИ',
      'YouTube · Le journal': 'YouTube · Журнал',
      'FORMULAIRE DE PRISE DE RENDEZ-VOUS': 'ФОРМА ЗАПИСИ НА ВСТРЕЧУ',
      'sous 24h ouvrées.': 'в течение 24 рабочих часов.',
      'France': 'Франция',
      'Belgique': 'Бельгия',
      'Suisse': 'Швейцария',
      'Israël': 'Израиль',
      'Autre': 'Другое',
      'Préfère ne pas dire': 'Предпочитаю не указывать',
      'Pas de préférence': 'Без предпочтения',
      'Plusieurs zones': 'Несколько зон',

      // Footer common
      'Bureau & contact': 'Офис и контакты',
      'Tel Aviv 6688314 · Israël': 'Тель-Авив 6688314 · Израиль',

      // Misc
      'En savoir +': 'Узнать больше',
      'Retour': 'Назад',
      'Suivant': 'Далее',
      'Précédent': 'Предыдущий',
      'Voir tout': 'Смотреть всё',
      'Page non trouvée': 'Страница не найдена',
      "La page que vous cherchez n'existe pas ou a été déplacée.": 'Страница, которую вы ищете, не существует или была перемещена.',
      "Retour à l'accueil": 'Вернуться на главную',
      // Legal & 404 page chrome
      "BARÈME D'HONORAIRES · TRANSPARENT": "ТАРИФНАЯ СЕТКА · ПРОЗРАЧНОСТЬ",
      'Barème transparent · MMXXVI': 'Прозрачная тарифная сетка · MMXXVI',
      "Notre grille d'honoraires est publique, dégressive selon le montant de la transaction. Aucun frais caché, aucune facturation supplémentaire — tout est inclus dans le mandat signé.": 'Наша тарифная сетка публична, регрессивна в зависимости от суммы сделки. Никаких скрытых платежей, никаких дополнительных счетов — всё включено в подписанный мандат.',
      // Mentions légales — titles only
      'CONFORMITÉ LÉGALE': 'ПРАВОВОЕ СООТВЕТСТВИЕ',
      'Mentions légales.': 'Правовые уведомления.',
      'Dernière mise à jour : 28 avril 2026': 'Последнее обновление: 28 апреля 2026',
      'Éditeur du site': 'Издатель сайта',
      'Hébergement': 'Хостинг',
      'Propriété intellectuelle': 'Интеллектуальная собственность',
      'Crédits': 'Авторы',
      'Activité réglementée': 'Регулируемая деятельность',
      'Limitation de responsabilité': 'Ограничение ответственности',
      'Loi applicable et juridiction': 'Применимое право и юрисдикция',
      // RGPD — titles only
      'CONFORMITÉ EUROPE': 'СООТВЕТСТВИЕ ЕС',
      'Politique RGPD.': 'Политика GDPR.',
      'Vos données.': 'Ваши данные.',
      // Footer short version
      'Maison indépendante de courtage immobilier. Tel Aviv depuis 2014. Mossi\'a #4218.': 'Независимое агентство недвижимости. Тель-Авив с 2014. Лицензия #4218.',
      'MENTIONS LÉGALES': 'ПРАВОВЫЕ УВЕДОМЛЕНИЯ',
      'POLITIQUE RGPD · CONFORMITÉ EUROPE': 'ПОЛИТИКА GDPR · СООТВЕТСТВИЕ ЕС',
      'ERREUR 404 · PAGE INTROUVABLE': 'ОШИБКА 404 · СТРАНИЦА НЕ НАЙДЕНА',
      'Cette pièce': 'Этот объект',
      "n'est plus": 'больше не',
      'au portefeuille.': 'в портфолио.',
      "Comme certains biens off-market, cette page a peut-être été retirée de la circulation. Reprenons la visite depuis le début.": 'Как и некоторые off-market объекты, эта страница, возможно, была изъята. Начнём осмотр сначала.',
      "Retour à l'accueil →": 'Вернуться на главную →',
      'Si le problème persiste, contactez-nous :': 'Если проблема не устранена, свяжитесь с нами :'
    }
  };

  // Phrase keys (for ordered/longest-first replacement)
  const KEYS_EN = Object.keys(DICT.en).sort((a, b) => b.length - a.length);
  const KEYS_HE = Object.keys(DICT.he).sort((a, b) => b.length - a.length);
  const KEYS_RU = Object.keys(DICT.ru).sort((a, b) => b.length - a.length);

  // ---- Snapshot original FR text -----------------------------------------
  // We need to translate from FR every time, not from previously translated text.
  let snapshot = null;

  // Convert HTML attribute name to a valid dataset key (camelCase, no dashes)
  // e.g. 'aria-label' -> 'AriaLabel', 'placeholder' -> 'Placeholder'
  function attrToDatasetSuffix(attr) {
    const camel = attr.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  }

  function takeSnapshot() {
    // Additive: do not overwrite existing snapshot entries. This lets
    // dynamically inserted content (e.g. listings.js, journal modals) be
    // captured on subsequent applyLang calls without losing the original
    // FR value of text already in the snapshot.
    if (!snapshot) snapshot = new Map();
    walkText((node) => {
      if (!snapshot.has(node)) snapshot.set(node, node.nodeValue);
    });
    // Snapshot translatable attributes too
    document.querySelectorAll('[placeholder], [title], [alt], [aria-label]').forEach((el) => {
      ['placeholder', 'title', 'alt', 'aria-label'].forEach((attr) => {
        if (el.hasAttribute(attr)) {
          const key = `i18nOrig${attrToDatasetSuffix(attr)}`;
          if (!el.dataset[key]) el.dataset[key] = el.getAttribute(attr);
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
  function applyLang(lang, opts) {
    if (!SUPPORTED.includes(lang)) lang = 'fr';
    // Always (re)take snapshot — additive, so it only picks up new nodes.
    // This makes applyLang safe to call again after dynamic DOM insertions.
    takeSnapshot();

    // Restore original FR
    snapshot.forEach((origValue, node) => {
      if (node.nodeValue !== origValue) node.nodeValue = origValue;
    });
    document.querySelectorAll('[data-i18n-orig-placeholder], [data-i18n-orig-title], [data-i18n-orig-alt], [data-i18n-orig-aria-label]').forEach((el) => {
      ['placeholder', 'title', 'alt', 'aria-label'].forEach((attr) => {
        const key = `i18nOrig${attrToDatasetSuffix(attr)}`;
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

    // RTL safety: phone numbers, emails and the Latin brand name are always
    // Left-To-Right. In Hebrew (dir=rtl) the Unicode bidi algorithm would
    // otherwise reverse digit groups (e.g. "+972 54 783 11 52" rendered as
    // "52 11 783 54 972+") and displace the brand ampersand. Tag them LTR.
    isolateLtrIslands();

    if (lang === 'fr') {
      updateSwitcher(lang);
      if (!(opts && opts.silent)) fireLangChanged(lang);
      return;
    }

    const dict = DICT[lang];
    const keys = lang === 'en' ? KEYS_EN : (lang === 'he' ? KEYS_HE : KEYS_RU);

    // Translate text nodes.
    //
    // Policy (May 2026): translate ONLY on exact match of the trimmed text
    // node value. We deliberately removed the substring/phrase-fallback
    // pass because it produced "franglais" artifacts inside untranslated
    // dynamic content — e.g. a listing description "Cinq pièces au 28ᵉ
    // étage..." became "Cinq rooms au 28ᵉ étage..." in EN mode because
    // 'pièces' had a dict entry but the surrounding sentence didn't.
    //
    // Trade-off: any string not present verbatim in the dict stays in
    // French rather than getting partially translated. That's the right
    // call for brand integrity — half-translated luxury copy reads worse
    // than honestly untranslated copy. To translate a new string, add it
    // as a full phrase to DICT.{en,he,ru}.
    snapshot.forEach((origValue, node) => {
      const trimmed = origValue.trim();
      if (!trimmed) return;
      if (dict[trimmed]) {
        node.nodeValue = origValue.replace(trimmed, dict[trimmed]);
      }
    });

    // Translate attributes
    document.querySelectorAll('[data-i18n-orig-placeholder], [data-i18n-orig-title], [data-i18n-orig-alt], [data-i18n-orig-aria-label]').forEach((el) => {
      ['placeholder', 'title', 'alt', 'aria-label'].forEach((attr) => {
        const key = `i18nOrig${attrToDatasetSuffix(attr)}`;
        const orig = el.dataset[key];
        if (!orig) return;
        const t = orig.trim();
        if (dict[t]) {
          el.setAttribute(attr, orig.replace(t, dict[t]));
        }
      });
    });

    updateSwitcher(lang);
    // Only notify external modules on a REAL language change. refresh() passes
    // {silent:true} because it merely re-translates freshly inserted DOM —
    // re-firing here would loop forever (listings/journal/agency listen to this
    // event and call refresh() again). See SLI18n.refresh().
    if (!(opts && opts.silent)) fireLangChanged(lang);
  }

  // ---- Notify external modules (e.g. site-cms.js) on language switch -----
  function fireLangChanged(lang) {
    try {
      document.dispatchEvent(new CustomEvent('sl-lang-changed', { detail: { lang: lang } }));
    } catch (_) {}
  }

  // ---- RTL safety ---------------------------------------------------------
  // Forces phone numbers, emails and the Latin brand name to render
  // Left-To-Right even when the document is RTL (Hebrew), so the bidi
  // algorithm never reverses digit groups or moves the brand ampersand.
  // Idempotent: safe to call on every language switch.
  const RTL_PHONE = /^[+]?\d[\d\s().+\-]{6,}$/;
  const RTL_EMAIL = /^[\w.+\-]+@[\w.\-]+\.[a-z]{2,}$/i;
  function isolateLtrIslands() {
    try {
      // 1. Explicit phone/email links, brand logos, and the © brand line.
      document.querySelectorAll(
        'a[href^="tel"], a[href^="mailto"], .brand-logo, .brand-logo .name, .brand-strip-logo, [data-text="footer.copyright"]'
      ).forEach((el) => { el.setAttribute('dir', 'ltr'); el.style.unicodeBidi = 'isolate'; });

      // 2. Leaf elements whose entire text is a phone number or an email
      //    (topbar phone <a>, CTA phone <a>, email <span>…).
      document.querySelectorAll('a, span, li, td, .menu-foot').forEach((el) => {
        if (el.children.length) return;
        const t = (el.textContent || '').trim();
        if (RTL_PHONE.test(t) || RTL_EMAIL.test(t)) {
          el.setAttribute('dir', 'ltr'); el.style.unicodeBidi = 'isolate';
        }
      });

      // 3. Bare phone-number text nodes mixed with <br> (footer/menu blocks)
      //    have no strong directional char, so plaintext can't save them —
      //    wrap each in a dir="ltr" span. Idempotent via the parent check.
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      const toWrap = [];
      let node;
      while ((node = walker.nextNode())) {
        const t = (node.nodeValue || '').trim();
        if (!RTL_PHONE.test(t)) continue;
        const p = node.parentElement;
        if (p && (p.getAttribute('dir') === 'ltr' || p.dataset.ltrWrapped === '1')) continue;
        toWrap.push(node);
      }
      toWrap.forEach((n) => {
        const span = document.createElement('span');
        span.setAttribute('dir', 'ltr');
        span.dataset.ltrWrapped = '1';
        span.style.unicodeBidi = 'isolate';
        n.parentNode.insertBefore(span, n);
        span.appendChild(n);
      });
    } catch (_) { /* never break rendering over a cosmetic RTL fix */ }
  }

  // ---- Switcher UI --------------------------------------------------------
  function updateSwitcher(lang) {
    document.querySelectorAll('[data-lang]').forEach((el) => {
      const isActive = el.dataset.lang === lang;
      const isFlag = el.classList.contains('lang-flag');
      el.classList.toggle('opacity-100', isActive);
      el.classList.toggle('opacity-50', !isActive);
      el.classList.toggle('hover:opacity-100', !isActive);
      if (isFlag) {
        // Active flag indicator = subtle gold underline + slight scale
        el.classList.toggle('is-active-lang', isActive);
      } else {
        el.classList.toggle('underline', isActive);
      }
    });
  }

  function wireSwitcher() {
    // Find elements either via data-lang attribute (preferred, supports flag emojis)
    // or by text content ('FR'/'EN'/'HE'/'RU') for back-compat.
    const candidates = document.querySelectorAll('a, button');
    candidates.forEach((el) => {
      let lang = (el.dataset.lang || '').toLowerCase();
      if (!lang) {
        const txt = (el.textContent || '').trim().toUpperCase();
        if (txt === 'FR' || txt === 'EN' || txt === 'HE' || txt === 'RU') {
          lang = txt.toLowerCase();
          el.dataset.lang = lang;
        }
      }
      if (!SUPPORTED.includes(lang)) return;
      if (el.dataset.langWired === '1') return;
      el.dataset.langWired = '1';
      el.style.cursor = 'pointer';
      if (!el.hasAttribute('href')) el.setAttribute('href', '#');
      el.addEventListener('click', (e) => {
        e.preventDefault();
        try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) {}
        applyLang(lang);
      });
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
    get: () => document.documentElement.lang || 'fr',
    // Re-apply current language. Use after inserting dynamic DOM (listings,
    // journal cards, modals…) so the new text nodes get translated.
    refresh: () => {
      let lang = 'fr';
      try { lang = localStorage.getItem(STORAGE_KEY) || 'fr'; } catch (_) {}
      if (!SUPPORTED.includes(lang)) lang = 'fr';
      applyLang(lang, { silent: true });
    },
    // Translate a single FR string to the current language. Returns the
    // original string when no translation exists. Useful for JS-rendered UI
    // labels in template strings.
    translate: (text) => {
      let lang = 'fr';
      try { lang = localStorage.getItem(STORAGE_KEY) || 'fr'; } catch (_) {}
      if (!SUPPORTED.includes(lang) || lang === 'fr') return text;
      const d = DICT[lang];
      return d && d[text] ? d[text] : text;
    }
  };
})();
