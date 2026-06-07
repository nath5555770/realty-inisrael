# Villes désactivées — procédure de réactivation

**Désactivées le 2026-06-04 :** Césarée (`caesarea`) et Jérusalem (`jerusalem`).

Ces 2 villes ont été retirées de tout ce que le site « propose » (menus de
recherche, formulaires, zones couvertes), mais **rien n'est supprimé** : tout
est mis en commentaire avec le marqueur `SL-CITY-OFF` ou facilement ré-ajoutable.

## Le plus simple : demander à Claude

> « Réactive Jérusalem » (ou Césarée) — c'est fait en 1 minute, proprement, dans
> les 4 langues.

## Réactivation manuelle (pour un développeur)

Pour réactiver une ville (ex. `jerusalem`) :

1. **Menus déroulants** — chercher `SL-CITY-OFF` et retirer le commentaire autour
   des options de la ville, dans :
   - `portefeuille.html` → `<select id="searchCity">` (filtre public)
   - `admin/index.html` → `<select id="filterCity">` **et** `<select id="fCity">`
   - `contact.html` → `<select name="zone">`
   - …et les copies dans `_backup-live-site/` (portefeuille, contact)

2. **Contenu / SEO** — ré-ajouter la ville dans :
   - `index.html` → JSON-LD `"areaServed"`
   - `llms.txt` → « Zones couvertes »
   - `portefeuille.html` → pied de page (liste de villes) + meta description
   - FAQ « Quelles zones couvrez-vous » : `faq.html` (texte + schéma),
     `assets/i18n.js` (DICT en/he/ru), `build-i18n-pages.js` (FAQ + HEAD)

3. **Régénérer les pages traduites** :
   ```
   node build-i18n-pages.js
   ```

4. **Publier** : `git add -A && git commit -m "réactive jerusalem" && git push`

## Note

Les **annonces** déjà enregistrées dans une ville désactivée ne sont **pas
masquées** automatiquement (elles restent visibles si elles existent). La
désactivation concerne ce que le site **propose** comme zones, pas le contenu
existant. En pratique, si vous n'avez pas de bien là-bas, il n'y a rien à masquer.
