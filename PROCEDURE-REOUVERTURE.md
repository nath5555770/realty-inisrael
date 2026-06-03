# 🚀 Procédure de réouverture du site

Tout est prêt. Le jour où tu décides d'ouvrir le site au public, voici comment faire.
**C'est réversible** : on peut revenir au « coming soon » à tout moment en 10 secondes.

---

## ✅ Le plus simple : demande à Claude

Dis simplement :

> **« ouvre le site »**

Claude lance le script, vérifie tout, et pousse en ligne. Le site public passe du
« ouverture prochaine » au **vrai site complet** en ~2 minutes (le temps que GitHub
déploie).

Pour annuler :

> **« remets le coming soon »**

---

## 🛠️ Ou à la main (si Claude n'est pas là)

Dans le dossier `deploy`, ouvre un terminal et tape :

```bash
python reouvrir-le-site.py          # bascule vers le vrai site
git add -A
git commit -m "site: reouverture publique"
git push origin main
```

Pour revenir en arrière :

```bash
python revenir-coming-soon.py       # remet la page "ouverture prochaine"
git add -A && git commit -m "site: retour coming soon" && git push origin main
```

---

## 🔎 Ce que fait le script d'ouverture (automatique)

1. **Met les 10 vraies pages en ligne** (accueil, portefeuille, agence, journal,
   contact, honoraires, mentions, RGPD, aliyah, 404) — déjà conformes accessibilité.
2. **Ouvre robots.txt** → Google a de nouveau le droit d'indexer.
3. **Restaure le sitemap.xml** (5 pages) avec la date du jour.
4. **Change la version du cache** → les visiteurs voient le vrai site (et non la page
   « coming soon » gardée en mémoire par leur navigateur).

La page **accessibilité** et l'**admin** (`/admin/`) restent inchangées et accessibles.

---

## 📋 Juste après l'ouverture (1 fois, dans Google Search Console)

1. Va sur **search.google.com/search-console** (compte de Nath).
2. Menu **Sitemaps** → soumets à nouveau `https://realty-inisrael.com/sitemap.xml`.
3. (Optionnel) Outil **Inspection d'URL** → « Demander une indexation » pour l'accueil.

Google ré-indexera les pages sur 1 à 2 semaines.

---

## ⚠️ Avant d'ouvrir — checklist conseillée

- [ ] **Audit accessibilité certifié** (מורשה נגישות, ~2 500–4 500 ₪) — conseillé comme
      assurance juridique (pas obligatoire pour publier, mais protège en cas de plainte).
- [ ] Vérifier que les **vraies annonces** sont bien dans l'admin (elles s'affichent
      depuis Supabase).
- [ ] Le **keep-alive Supabase** tourne déjà (le projet ne se met plus en pause). ✔
- [ ] La **clé OpenAI** : remplacer la clé de test par celle de Nathalie quand prêt.

---

## 🗂️ Fichiers du kit (ne pas supprimer)

| Fichier | Rôle |
|---|---|
| `reouvrir-le-site.py` | bascule → vrai site |
| `revenir-coming-soon.py` | bascule → coming soon |
| `_backup-live-site/` | les 10 vraies pages (source de l'ouverture) |
| `_coming-soon/` | les 10 pages « ouverture prochaine » (source du retour) |
| `_reopen-templates/sitemap.xml` | sitemap d'origine restauré à l'ouverture |

*Testé le 2026-06-03 : ouverture + retour arrière fonctionnent, sans rien casser.*
