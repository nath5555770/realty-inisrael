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
      'PIÈCES': 'ROOMS',
      'SURFACE': 'AREA',
      'PRIX': 'PRICE',
      'RÉF': 'REF',
      'RÉF.': 'REF.',
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
      "Une équipe aux parcours complémentaires, réunie par une même exigence : offrir un accompagnement clair, humain et irréprochable à chaque étape. Français, anglais, hébreu et russe — nos équipes accompagnent une clientèle internationale avec fluidité et précision. Profondément ancrés dans le marché immobilier israélien, nos agents suivent personnellement chaque projet, du premier échange jusqu'à la remise des clés, avec disponibilité, discrétion et engagement.": "צוות עם מסלולים משלימים, מאוחד סביב תקן אחד משותף: להעניק ליווי ברור, אנושי וללא דופי בכל שלב. צרפתית, אנגלית, עברית ורוסית — הצוותים שלנו מלווים לקוחות בינלאומיים בשטף ובדייקנות. מושרשים עמוקות בשוק הנדל"ן הישראלי, סוכנינו מלווים אישית כל פרויקט, מההתכתבות הראשונה ועד מסירת המפתחות — בזמינות, בדיסקרטיות ובמחויבות.",
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
      'PIÈCES': 'חדרים',
      'SURFACE': 'שטח',
      'PRIX': 'מחיר',
      'RÉF': 'מס׳',
      'RÉF.': 'מס׳',
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
      'PIÈCES': 'КОМНАТ',
      'SURFACE': 'ПЛОЩАДЬ',
      'PRIX': 'ЦЕНА',
      'RÉF': '№',
      'RÉF.': '№',
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
  function applyLang(lang) {
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

    if (lang === 'fr') {
      updateSwitcher(lang);
      fireLangChanged(lang);
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
    fireLangChanged(lang);
  }

  // ---- Notify external modules (e.g. site-cms.js) on language switch -----
  function fireLangChanged(lang) {
    try {
      document.dispatchEvent(new CustomEvent('sl-lang-changed', { detail: { lang: lang } }));
    } catch (_) {}
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
    get: () => document.documentElement.lang || 'fr',
    // Re-apply current language. Use after inserting dynamic DOM (listings,
    // journal cards, modals…) so the new text nodes get translated.
    refresh: () => {
      let lang = 'fr';
      try { lang = localStorage.getItem(STORAGE_KEY) || 'fr'; } catch (_) {}
      if (!SUPPORTED.includes(lang)) lang = 'fr';
      applyLang(lang);
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
