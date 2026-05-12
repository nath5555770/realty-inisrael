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
    }
  };
  window.SLCMS = api;

  function init(isRefresh) {
    return Promise.all([loadTexts(), loadSettings()]).then(([texts, settings]) => {
      api.texts = texts;
      api.settings = settings;
      api.ready = true;
      applyTexts(texts);
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
