#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
  OUVRIR LE SITE  —  bascule du mode "coming soon" vers le VRAI site
=============================================================================
  Ce script :
    1. met les 10 vraies pages a la racine (le site complet, conforme)
    2. ouvre robots.txt (Google a le droit d'indexer a nouveau)
    3. restaure le sitemap.xml (avec la date du jour)
    4. change la version du cache (les visiteurs voient le vrai site, pas
       la page "coming soon" gardee en cache)

  Il NE pousse PAS en ligne tout seul : a la fin il affiche les 3 commandes
  git a lancer (ou demande a Claude de pousser).

  Reversible : pour revenir au coming soon -> lance revenir-coming-soon.py
=============================================================================
"""
import os, re, glob, shutil, datetime, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
def P(*x): return os.path.join(ROOT, *x)

def main():
    if not glob.glob(P('_backup-live-site', '*.html')):
        print("ERREUR : dossier _backup-live-site introuvable. Abandon."); sys.exit(1)

    today = datetime.date.today().isoformat()
    print("=== OUVERTURE DU SITE (" + today + ") ===\n")

    # 1) Vraies pages -> racine
    n = 0
    for f in glob.glob(P('_backup-live-site', '*.html')):
        shutil.copy2(f, P(os.path.basename(f))); n += 1
    print("  [1/4] " + str(n) + " vraies pages mises en ligne (racine)")

    # 2) robots.txt : autoriser l'indexation (+ accueil explicite des robots IA)
    rb = open(P('_reopen-templates', 'robots.txt'), encoding='utf-8').read()
    open(P('robots.txt'), 'w', encoding='utf-8').write(rb)
    print("  [2/4] robots.txt ouvert (indexation + assistants IA autorises)")

    # 3) sitemap.xml restaure + lastmod du jour
    sm = open(P('_reopen-templates', 'sitemap.xml'), encoding='utf-8').read()
    sm = re.sub(r"<lastmod>\d{4}-\d{2}-\d{2}</lastmod>", "<lastmod>" + today + "</lastmod>", sm)
    open(P('sitemap.xml'), 'w', encoding='utf-8').write(sm)
    print("  [3/4] sitemap.xml restaure (dates = " + today + ")")

    # 4) bump du cache (service worker)
    sw = open(P('sw.js'), encoding='utf-8').read()
    sw = re.sub(r"const CACHE_VERSION = '[^']*'",
                "const CACHE_VERSION = 'sl-open-" + today + "'", sw)
    open(P('sw.js'), 'w', encoding='utf-8').write(sw)
    print("  [4/4] cache mis a jour (sl-open-" + today + ")\n")

    print("=== TERMINE. Le site est pret a etre mis en ligne. ===")
    print("Derniere etape -> pousser sur GitHub :\n")
    print('    git add -A')
    print('    git commit -m "site: reouverture publique"')
    print('    git push origin main\n')
    print("(ou demande simplement a Claude : \"pousse l'ouverture\")")
    print("Puis dans Google Search Console : re-soumettre le sitemap.")
    print("\nPour annuler -> python revenir-coming-soon.py")

if __name__ == '__main__':
    main()
