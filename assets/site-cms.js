/* ==========================================================================
   SHAHAR LEVI · Site CMS loader
   --------------------------------------------------------------------------
   Loads editable text overrides + settings from Supabase and injects them
   into the live page. Designed to coexist with i18n.js:
     · i18n.js handles language switching for hard-coded copy.
     · site-cms.js overrides specific elements that the editor wants to
       control from the admin panel, in any of the 4 languages.

   Elements opt in via data-text="<key>" attributes. The loader looks up the
   key in the site_texts table and replaces the element's text content with
   the value for the currently selected language.

   Settings (key/JSONB) drive feature switches (e.g. journal.layout). The
   loader publishes them on window.SLCMS.settings and dispatches a 'sl-cms-ready'
   event so other scripts (journal.js, listings.js…) can react.

   Cache strategy: results are cached in sessionStorage for the duration of
   the tab so navigating across pages doesn't refetch. Cache busts whenever
   the language changes or when an admin saves (admin clears sessionStorage).
   ========================================================================== */
(function () {
  'use strict';
  if (!window.SL_SUPABASE) return;

  const SB_URL = window.SL_SUPABASE.url;
  const SB_KEY = window.SL_SUPABASE.key;
  const CACHE_TEXTS = 'sl-cms-texts-v1';
  const CACHE_SETTINGS = 'sl-cms-settings-v1';
  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  // ---- First-party page-view tracking (privacy-clean: no cookie, no IP stored,
  // no personal data). Captures path, an anonymous per-session id, the traffic
  // source (referrer), device / browser / OS, language and COUNTRY. Country is
  // geolocated anonymously — only the 2-letter code is sent; the IP is never
  // seen or stored by us. Fires once per page load → public.track_event. Admin
  // pages excluded. Never blocks the page; silently no-ops if the RPC is absent.
  (function trackPageView() {
    try {
      if (/\/admin(\/|$)/.test(location.pathname || '')) return;
      var ss = window.sessionStorage;
      var vid; try { vid = ss.getItem('sl-sid'); if (!vid) { vid = Date.now().toString(36) + Math.random().toString(36).slice(2, 10); ss.setItem('sl-sid', vid); } } catch (_) { vid = 'na'; }
      var path = (location.pathname || '/').replace(/index\.html$/, '') || '/';
      var ua = navigator.userAgent || '';

      var source = 'direct';
      try {
        var ref = document.referrer || '';
        if (ref) {
          var rh = new URL(ref).hostname.replace(/^www\./, '');
          if (rh === location.hostname) source = 'interne';
          else if (/(^|\.)google\./.test(rh)) source = 'google';
          else if (/(facebook|fb\.com|fb\.me)/.test(rh)) source = 'facebook';
          else if (/instagram/.test(rh)) source = 'instagram';
          else if (/(t\.co|twitter|x\.com)/.test(rh)) source = 'twitter/x';
          else if (/linkedin|lnkd\.in/.test(rh)) source = 'linkedin';
          else if (/youtu/.test(rh)) source = 'youtube';
          else if (/tiktok/.test(rh)) source = 'tiktok';
          else if (/(bing|yahoo|duckduckgo|ecosia|qwant)/.test(rh)) source = 'autre moteur';
          else source = rh;
        }
      } catch (_) {}

      var device = /(iPad|Tablet|PlayBook|Silk)/.test(ua) ? 'tablette' : (/(Mobi|Android|iPhone|iPod)/.test(ua) ? 'mobile' : 'ordinateur');
      var browser = /Edg/.test(ua) ? 'Edge' : /OPR|Opera/.test(ua) ? 'Opera' : /SamsungBrowser/.test(ua) ? 'Samsung' : /Chrome/.test(ua) ? 'Chrome' : /Firefox/.test(ua) ? 'Firefox' : /Safari/.test(ua) ? 'Safari' : 'autre';
      var os = /Android/.test(ua) ? 'Android' : /(iPhone|iPad|iPod)/.test(ua) ? 'iOS' : /Mac OS X/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : 'autre';
      var lang = (navigator.language || '').slice(0, 2).toLowerCase();

      function send(country) {
        fetch(SB_URL + '/rest/v1/rpc/track_event', {
          method: 'POST',
          headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ p_path: path.slice(0, 300), p_visitor: vid, p_source: source, p_device: device, p_browser: browser, p_os: os, p_lang: lang, p_country: country || null }),
          keepalive: true
        }).catch(function () {});
      }

      var cc; try { cc = ss.getItem('sl-cc'); } catch (_) {}
      if (cc) { send(cc === '-' ? null : cc); return; }
      // Country geolocation sends the IP to a third party, so it runs ONLY after
      // the visitor accepted the cookie banner. Without consent: no geo, no
      // country — but the anonymous (no-cookie, no-IP) page view is still logged.
      var consent; try { consent = localStorage.getItem('cookies-accepted'); } catch (_) {}
      if (consent !== 'true') { send(null); return; }
      var sent = false;
      var done = function (c) { if (sent) return; sent = true; try { ss.setItem('sl-cc', c || '-'); } catch (_) {} send(c); };
      var to = setTimeout(function () { done(null); }, 1500);
      fetch('https://ipwho.is/?fields=country_code', { referrerPolicy: 'no-referrer' })
        .then(function (r) { return r.json(); })
        .then(function (g) { clearTimeout(to); done(g && g.country_code ? String(g.country_code).toUpperCase().slice(0, 2) : null); })
        .catch(function () { clearTimeout(to); done(null); });
    } catch (_) {}
  })();

  function currentLang() {
    try { return localStorage.getItem('sl-lang') || 'fr'; } catch (_) { return 'fr'; }
  }

  function fetchJSON(path) {
    return fetch(SB_URL + '/rest/v1/' + path, {
      headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Accept': 'application/json' }
    }).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }

  function readCache(key) {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || (Date.now() - obj.t) > CACHE_TTL_MS) return null;
      return obj.d;
    } catch (_) { return null; }
  }
  function writeCache(key, data) {
    try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), d: data })); } catch (_) {}
  }

  function loadTexts() {
    const cached = readCache(CACHE_TEXTS);
    if (cached) return Promise.resolve(cached);
    return fetchJSON('site_texts?select=key,category,fr,en,he,ru')
      .then(rows => {
        const map = {};
        rows.forEach(r => { map[r.key] = r; });
        writeCache(CACHE_TEXTS, map);
        return map;
      })
      .catch(e => { console.warn('[cms] texts load failed:', e.message); return {}; });
  }

  function loadSettings() {
    const cached = readCache(CACHE_SETTINGS);
    if (cached) return Promise.resolve(cached);
    return fetchJSON('site_settings?select=key,value')
      .then(rows => {
        const map = {};
        rows.forEach(r => { map[r.key] = r.value; });
        writeCache(CACHE_SETTINGS, map);
        return map;
      })
      .catch(e => { console.warn('[cms] settings load failed:', e.message); return {}; });
  }

  function applyTexts(texts) {
    const lang = currentLang();
    document.querySelectorAll('[data-text]').forEach(el => {
      const key = el.getAttribute('data-text');
      const row = texts[key];
      if (!row) { el.classList.add('cms-applied'); return; }
      const value = row[lang] || row.fr;
      if (value == null) { el.classList.add('cms-applied'); return; }
      // Preserve children if the element only contains a single text node
      const hasOnlyText = el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE;
      if (hasOnlyText || el.children.length === 0) {
        el.textContent = value;
      } else {
        // Element has nested HTML — replace just direct text nodes
        Array.from(el.childNodes).forEach(n => {
          if (n.nodeType === Node.TEXT_NODE && n.nodeValue.trim()) {
            n.nodeValue = value;
          }
        });
      }
      el.classList.add('cms-applied');
    });
  }

  function applyImages(settings) {
    document.querySelectorAll('[data-image]').forEach(el => {
      const key = el.getAttribute('data-image');
      const url = settings[key];
      if (url && typeof url === 'string' && url.trim()) {
        const clean = url.trim();
        // <img> uses src; backgrounds use style.backgroundImage
        if (el.tagName === 'IMG') el.src = clean;
        else el.style.backgroundImage = 'url("' + clean.replace(/"/g, '\\"') + '")';
        // Auto-réparation hero : mémorise la photo d'accueil pour l'afficher
        // instantanément au prochain chargement (zéro flash, même si l'admin
        // change la photo). Lue par le script inline en haut de index.html.
        if (key === 'home.hero.image_url') { try { localStorage.setItem('sl-hero-url', clean); } catch (_) {} }
      }
    });
  }

  // ---- Villes actives (réglage admin : cities.inactive) ------------------
  // Masque les villes désactivées des menus publics (filtre portefeuille +
  // zone du formulaire de contact). Défaut si non réglé : Césarée + Jérusalem.
  const DEFAULT_INACTIVE_CITIES = ['caesarea', 'jerusalem'];
  const CITY_MATCH = {
    'netanya': ['netanya'],
    'herzliya': ['herzliya'],
    'tel-aviv': ['tel-aviv', 'tel aviv'],
    'caesarea': ['caesarea', 'césarée', 'cesaree', 'קיסריה', 'кесария'],
    'jerusalem': ['jerusalem', 'jérusalem', 'ירושלים', 'иерусалим']
  };
  function inactiveCities(settings) {
    const v = settings && settings['cities.inactive'];
    if (Array.isArray(v)) return v;
    if (typeof v === 'string') { try { const a = JSON.parse(v); if (Array.isArray(a)) return a; } catch (_) {} }
    return DEFAULT_INACTIVE_CITIES.slice();
  }
  function applyCities(settings) {
    const inactive = inactiveCities(settings);
    const kill = new Set();
    inactive.forEach(slug => (CITY_MATCH[slug] || [String(slug)]).forEach(s => kill.add(s.toLowerCase())));
    document.querySelectorAll('select').forEach(sel => {
      Array.from(sel.options).forEach(o => {
        const val = (o.value || o.textContent || '').trim().toLowerCase();
        if (kill.has(val)) o.remove();
      });
    });
    // Cartes/listes ville (vitrine accueil, pied de page) : masque/affiche selon le reglage
    const inactiveSet = new Set(inactive.map(function (x) { return String(x).toLowerCase(); }));
    document.querySelectorAll("[data-city]").forEach(function (el) {
      el.classList.toggle("sl-city-off", inactiveSet.has((el.getAttribute("data-city") || "").toLowerCase()));
    });
  }

  // Public API
  const api = {
    texts: {},
    settings: {},
    ready: false,
    setting(key, fallback) {
      const v = this.settings[key];
      return (v === undefined || v === null) ? fallback : v;
    },
    text(key, lang) {
      const row = this.texts[key];
      if (!row) return null;
      lang = lang || currentLang();
      return row[lang] || row.fr || null;
    },
    refresh() {
      try {
        sessionStorage.removeItem(CACHE_TEXTS);
        sessionStorage.removeItem(CACHE_SETTINGS);
      } catch (_) {}
      return init(true);
    },
    reapply() {
      applyTexts(this.texts);
      applyImages(this.settings);
      applyCities(this.settings);
    }
  };
  window.SLCMS = api;

  function init(isRefresh) {
    return Promise.all([loadTexts(), loadSettings()]).then(([texts, settings]) => {
      api.texts = texts;
      api.settings = settings;
      api.ready = true;
      applyTexts(texts);
      applyImages(settings);
      applyCities(settings);
      // Notify other modules
      document.dispatchEvent(new CustomEvent('sl-cms-ready', { detail: { isRefresh: !!isRefresh } }));
    });
  }

  // Re-apply texts whenever the language changes (i18n.js fires a custom event)
  document.addEventListener('sl-lang-changed', () => {
    if (api.ready) applyTexts(api.texts);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init(false));
  else init(false);
})();
