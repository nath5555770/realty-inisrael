"""Inject SEO meta tags, animations CSS/JS, and page loader into all HTML pages."""
import os
import re

PAGES = {
    'index.html': {
        'title': 'SHAHAR LEVI REAL ESTATE — Maison de courtage immobilier en Israël',
        'desc': 'Maison de courtage immobilier indépendante à Tel Aviv depuis 2014. Acquisitions et cessions privées, accompagnement aliyah, investissement patrimonial — pour une clientèle francophone.',
        'page': 'home',
    },
    'portefeuille.html': {
        'title': 'Portefeuille — 19 pièces à céder · SHAHAR LEVI Real Estate',
        'desc': 'Découvrez notre portefeuille de 19 propriétés privées en Israël — Tel Aviv, Herzliya, Caesarea, Netanya, Jérusalem. Penthouses, villas, biens off-market. À partir de $3.95M.',
        'page': 'portefeuille',
    },
    'agence.html': {
        'title': "L'Agence — SHAHAR LEVI Real Estate · Maison fondée en 2014",
        'desc': "Maison de courtage immobilier indépendante à Tel Aviv depuis 2014. Shahar Levi & Nathalie Haik. 214 familles francophones accompagnées. Mossi'a #4218.",
        'page': 'agence',
    },
    'aliyah.html': {
        'title': 'Aliyah patrimoniale — Acheter avant de monter en Israël',
        'desc': "Acquérir avant l'aliyah officielle peut réduire votre Mas Rechisha jusqu'à 6%. Les 7 étapes patrimoniales en français — accompagnement complet depuis Paris.",
        'page': 'aliyah',
    },
    'journal.html': {
        'title': 'Journal — Analyses, conseils, reportages immobiliers',
        'desc': '47 articles publiés sur l\'immobilier israélien, l\'aliyah, la fiscalité FR/IL, les quartiers, les notaires. Analyses honnêtes, jamais commerciales.',
        'page': 'journal',
    },
    'contact.html': {
        'title': 'Contact — Cabinet privé · SHAHAR LEVI Real Estate',
        'desc': 'Solliciter un rendez-vous avec Nathalie Haik. À Tel Aviv, Paris, ou en visioconférence. Sans engagement, sans frais. Réponse sous 24h ouvrées.',
        'page': 'contact',
    },
}

BASE_URL = 'https://myzehut01-bot.github.io/shahar-levi-real-estate'

ORG_JSONLD = '''<script type="application/ld+json">{
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "SHAHAR LEVI Real Estate",
  "alternateName": "Maison Haik & Levi",
  "url": "''' + BASE_URL + '''",
  "logo": "''' + BASE_URL + '''/assets/logo.png",
  "image": "''' + BASE_URL + '''/assets/og-image.jpg",
  "description": "Maison de courtage immobilier indépendante à Tel Aviv depuis 2014. Acquisitions et cessions privées en Israël — clientèle francophone.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "14 Rothschild Boulevard",
    "addressLocality": "Tel Aviv",
    "postalCode": "6688314",
    "addressCountry": "IL"
  },
  "telephone": "+972500000000",
  "email": "nathalie@shaharlevi.co.il",
  "founder": [
    {"@type": "Person", "name": "Shahar Levi", "jobTitle": "Founder & Broker"},
    {"@type": "Person", "name": "Nathalie Haik", "jobTitle": "Direction · Francophone"}
  ],
  "foundingDate": "2014",
  "areaServed": ["Tel Aviv", "Herzliya", "Caesarea", "Netanya", "Jerusalem"],
  "knowsLanguage": ["fr", "he", "en"],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5.0",
    "reviewCount": "187"
  }
}</script>'''


def make_meta(page_data, file_name):
    canonical = f'{BASE_URL}/{file_name}' if file_name != 'index.html' else BASE_URL + '/'
    og_image = f'{BASE_URL}/assets/og-image.jpg'
    return f'''<meta name="description" content="{page_data['desc']}">
<meta name="author" content="SHAHAR LEVI Real Estate">
<link rel="canonical" href="{canonical}">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:url" content="{canonical}">
<meta property="og:title" content="{page_data['title']}">
<meta property="og:description" content="{page_data['desc']}">
<meta property="og:image" content="{og_image}">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="SHAHAR LEVI Real Estate">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="{canonical}">
<meta name="twitter:title" content="{page_data['title']}">
<meta name="twitter:description" content="{page_data['desc']}">
<meta name="twitter:image" content="{og_image}">

<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<meta name="theme-color" content="#0e2722">

<!-- Structured Data -->
{ORG_JSONLD}

<!-- Animations -->
<link rel="stylesheet" href="assets/animations.css">'''


PAGE_LOADER = '''<div class="page-loader" aria-hidden="true">
  <div class="page-loader-bar"></div>
  <div class="page-loader-logo">
    <div class="ll-name">SHAHAR LEVI</div>
    <div class="ll-desc">REAL ESTATE</div>
  </div>
</div>
<div class="scroll-progress" id="scrollProgress"></div>
'''

ANIMATIONS_SCRIPT = '<script src="assets/animations.js" defer></script>'

SCROLL_PROGRESS_JS = '''<script>
window.addEventListener('scroll', function() {
  var winScroll = document.documentElement.scrollTop;
  var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  var scrolled = (winScroll / height) * 100;
  document.getElementById('scrollProgress').style.width = scrolled + '%';
}, { passive: true });
</script>'''


def inject(filename):
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), filename)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    page_data = PAGES.get(filename, {'title': 'SHAHAR LEVI', 'desc': '', 'page': 'page'})

    # Replace title
    new_title = f'<title>{page_data["title"]}</title>'
    content = re.sub(r'<title>.*?</title>', new_title, content, count=1, flags=re.DOTALL)

    # Skip if already injected
    if 'animations.css' in content:
        return f'SKIP {filename} (already injected)'

    # Add meta tags after viewport
    meta = make_meta(page_data, filename)
    content = re.sub(
        r'(<meta name="viewport"[^>]*>)',
        r'\1\n' + meta,
        content, count=1
    )

    # Add page loader and animations script before </body>
    content = re.sub(
        r'<body([^>]*)>',
        r'<body\1 data-page="' + page_data['page'] + r'">\n' + PAGE_LOADER,
        content, count=1
    )

    content = content.replace('</body>', ANIMATIONS_SCRIPT + '\n' + SCROLL_PROGRESS_JS + '\n</body>')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    return f'OK   {filename}'


for fn in PAGES.keys():
    print(inject(fn))
