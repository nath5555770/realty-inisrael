# Villes proposées au public — activer / désactiver soi-même

**Tu gères ça toi-même depuis l'admin, sans développeur :**

1. Connecte-toi à **realty-inisrael.com/admin/**
2. Onglet **« Réglages »**
3. Section **« Villes proposées au public »**
4. **Coche** une ville pour l'activer / **décoche**-la pour la désactiver
5. **« Enregistrer les réglages »**

Une ville **décochée** disparaît automatiquement :
- du **filtre de recherche** du portefeuille,
- du menu **« zone »** du formulaire de contact,
- …dans les **4 langues** (FR / EN / HE / RU).

**Recoche**-la pour la réactiver — par exemple si tu obtiens un bien dans cette ville.

**Par défaut : Césarée et Jérusalem sont désactivées.**

## Bon à savoir

- Le changement apparaît au **prochain chargement** des pages (cache ≈ 5 min).
- Les **annonces déjà publiées** dans une ville ne sont **pas masquées**
  automatiquement (la désactivation concerne ce que le site *propose*, pas le
  contenu existant). Si tu n'as pas de bien dans cette ville, il n'y a rien à cacher.
- Le **texte SEO « zones couvertes »** (page d'accueil, FAQ) reste sur Netanya,
  Herzliya, Tel Aviv. Si tu réactives durablement une ville et veux qu'elle
  apparaisse aussi dans ces textes, demande-le (petite modif de contenu).

## Côté technique (pour un développeur)

- Réglage stocké dans `site_settings` → clé `cities.inactive` (tableau de slugs,
  ex. `["caesarea","jerusalem"]`).
- Lu et appliqué par `assets/site-cms.js` (fonction `applyCities`).
- Défaut si la clé est absente : `['caesarea','jerusalem']` (dans site-cms.js).
- UI : `admin/index.html` (cases `name="cityActive"`) + `admin/admin.js`
  (`renderSettingsForm` / `saveSettings`).
