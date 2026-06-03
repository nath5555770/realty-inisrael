#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
  REVENIR AU COMING SOON  —  remet le site en mode "ouverture prochaine"
=============================================================================
  Annule la reouverture : remet la page "coming soon" partout, re-bloque
  Google, et vide le sitemap. La page accessibilite.html et l'admin restent
  accessibles. Reversible : pour rouvrir -> reouvrir-le-site.py
=============================================================================
"""
import os, re, glob, shutil, datetime, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
def P(*x): return os.path.join(ROOT, *x)

def main():
    if not glob.glob(P('_coming-soon', '*.html')):
        print("ERREUR : dossier _coming-soon introuvable. Abandon."); sys.exit(1)

    today = datetime.date.today().isoformat()
    print("=== RETOUR AU MODE COMING SOON (" + today + ") ===\n")

    # 1) pages coming-soon -> racine
    n = 0
    for f in glob.glob(P('_coming-soon', '*.html')):
        shutil.copy2(f, P(os.path.basename(f))); n += 1
    print("  [1/4] " + str(n) + " pages remises en 'coming soon'")

    # 2) robots.txt : tout bloquer (sauf la declaration d'accessibilite)
    with open(P('robots.txt'), 'w', encoding='utf-8') as fh:
        fh.write("User-agent: *\nDisallow: /\nAllow: /accessibilite.html\n\n"
                 "# Site temporairement en construction.\n")
    print("  [2/4] robots.txt re-bloque (Google n'indexe plus)")

    # 3) sitemap.xml : vide
    open(P('sitemap.xml'), 'w', encoding='utf-8').write(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n')
    print("  [3/4] sitemap.xml vide")

    # 4) bump du cache
    sw = open(P('sw.js'), encoding='utf-8').read()
    sw = re.sub(r"const CACHE_VERSION = '[^']*'",
                "const CACHE_VERSION = 'sl-soon-" + today + "'", sw)
    open(P('sw.js'), 'w', encoding='utf-8').write(sw)
    print("  [4/4] cache mis a jour\n")

    print("=== TERMINE. Pousser sur GitHub : ===")
    print('    git add -A && git commit -m "site: retour coming soon" && git push origin main')

if __name__ == '__main__':
    main()
