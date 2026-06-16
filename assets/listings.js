/* ==========================================================================
   SHAHAR LEVI REAL ESTATE — Listings + Search Engine (Supabase backend)
   Reads from Supabase Postgres in real time.
   Comprehensive search: free text · ville · type · prix · pièces · surface
   · signature/featured · tri · état d'URL persistant.
   ========================================================================== */
(function () {
  'use strict';

  if (!window.SL_SUPABASE) { console.error('[listings] Supabase config missing'); return; }
  const SB_URL = window.SL_SUPABASE.url;
  const SB_KEY = window.SL_SUPABASE.key;

  // ------------------------------------------------------------------
  // FILTER STATE
  // ------------------------------------------------------------------
  const FILTER_DEFAULTS = {
    q: '',                 // free-text search
    city: '',              // city slug
    type: '',              // type slug (appartement/penthouse/villa/loft/maison)
    kind: '',              // property kind (neuf/occasion/projet/commercial)
    deal: '',              // transaction type (sale/rent) — '' = both
    min_p: 0,              // min price in shekels
    max_p: 0,              // max price in shekels (0 = unlimited)
    min_r: 0,              // min number of rooms
    min_s: 0,              // min surface m²
    max_s: 0,              // max surface m² (0 = unlimited)
    sig_only: false,
    fea_only: false,
    sort: 'pertinence'     // pertinence | price-desc | price-asc | surface-desc | rooms-desc | newest
  };

  let CACHE = null;          // raw rows from Supabase
  let FILTER = Object.assign({}, FILTER_DEFAULTS);

  // ------------------------------------------------------------------
  // SUPABASE FETCH
  // ------------------------------------------------------------------
  function load(force) {
    if (CACHE && !force) return Promise.resolve(CACHE);
    const url = SB_URL + '/rest/v1/listings?select=*&visible=eq.true&off_market=eq.false&order=position.asc,created_at.asc';
    return fetch(url, {
      headers: {
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + SB_KEY,
        'Accept': 'application/json'
      }
    })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(rows => { CACHE = rows; return rows; });
  }

  // ------------------------------------------------------------------
  // HELPERS
  // ------------------------------------------------------------------
  function imageUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    return SB_URL + '/storage/v1/object/public/listing-images/' + path.replace(/^\/+/, '');
  }
  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  // Pick the user's current language and read translated fields when available.
  // FR is the source — fall back to FR if the chosen lang isn't translated yet.
  function currentLang() {
    try { const s = localStorage.getItem('sl-lang'); if (s && ['fr','en','he','ru'].includes(s)) return s; } catch (_) {}
    return 'fr';
  }
  function localizedListing(l) {
    const lang = currentLang();
    if (!l || lang === 'fr' || !l.translations || !l.translations[lang]) return l;
    const t = l.translations[lang];
    return Object.assign({}, l, {
      title_main:   t.title_main   || l.title_main,
      title_accent: t.title_accent || l.title_accent,
      description:  t.description  || l.description,
      neighborhood: t.neighborhood || l.neighborhood,
      extra_label:  t.extra_label  || l.extra_label,
    });
  }
  // Same as escapeHtml but keeps line breaks (\n → <br>). Use for any
  // user-edited multi-line text field (descriptions, long-form notes…).
  function escapeHtmlMultiline(s) {
    return escapeHtml(s).replace(/\r?\n/g, '<br>');
  }
  // Prices are stored and displayed in shekels everywhere. The DB column is
  // still named price_usd for legacy reasons (renaming requires a Postgres
  // migration with reference updates), but the value is treated as ILS.
  function priceLabel(l) {
    if (typeof l.price_usd === 'number' && l.price_usd > 0) {
      const m = l.price_usd / 1_000_000;
      return (m >= 100 ? m.toFixed(0) : m % 1 === 0 ? m.toFixed(1) : m.toFixed(1)) + ' M ₪';
    }
    return '';
  }
  function cityLabel(slug) {
    return ({
      'tel-aviv': 'TEL AVIV', 'herzliya': 'HERZLIYA', 'caesarea': 'CAESAREA',
      'netanya': 'NETANYA', 'jerusalem': 'JÉRUSALEM'
    })[slug] || (slug || '').toUpperCase();
  }
  function cityHuman(slug) {
    return ({
      'tel-aviv': 'Tel Aviv', 'herzliya': 'Herzliya', 'caesarea': 'Caesarea',
      'netanya': 'Netanya', 'jerusalem': 'Jérusalem'
    })[slug] || slug;
  }
  function typeHuman(slug) {
    return ({
      'appartement': 'Appartement', 'penthouse': 'Penthouse', 'villa': 'Villa',
      'loft': 'Loft', 'maison': 'Maison',
      'bureaux': 'Bureaux',
      'local-commercial': 'Local commercial', 'terrain': 'Terrain', 'immeuble': 'Immeuble'
    })[slug] || slug;
  }
  function parseFirstNumber(text) {
    if (!text) return 0;
    const m = String(text).match(/(\d+(?:[.,]\d+)?)/);
    return m ? parseFloat(m[1].replace(',', '.')) : 0;
  }
  // Filter values (min_p, max_p) are raw shekel numbers. Helper formats them
  // for chips and custom dropdown labels.
  function fmtUSD(n) {
    if (!n) return '';
    if (n >= 1_000_000) {
      const m = n / 1_000_000;
      return (m >= 100 ? m.toFixed(0) : m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)) + ' M ₪';
    }
    return Math.round(n).toLocaleString('fr-FR') + ' ₪';
  }

  // ------------------------------------------------------------------
  // URL STATE
  // ------------------------------------------------------------------
  function readFilterFromURL() {
    const p = new URLSearchParams(location.search);
    const f = Object.assign({}, FILTER_DEFAULTS);
    Object.keys(FILTER_DEFAULTS).forEach(k => {
      if (!p.has(k)) return;
      const v = p.get(k);
      const def = FILTER_DEFAULTS[k];
      if (typeof def === 'boolean') f[k] = v === '1' || v === 'true';
      else if (typeof def === 'number') f[k] = parseFloat(v) || 0;
      else f[k] = v;
    });
    return f;
  }
  function writeFilterToURL(f) {
    const p = new URLSearchParams();
    Object.keys(f).forEach(k => {
      const v = f[k]; const def = FILTER_DEFAULTS[k];
      if (v === def) return;
      if (typeof def === 'boolean') p.set(k, v ? '1' : '0');
      else p.set(k, v);
    });
    const qs = p.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
  }

  // ------------------------------------------------------------------
  // FILTER LOGIC
  // ------------------------------------------------------------------
  function applyFilter(rows, f) {
    let r = rows;
    if (f.q) {
      const q = f.q.toLowerCase().trim();
      r = r.filter(l => {
        const blob = [l.title_main, l.title_accent, l.ref, l.neighborhood,
                      l.city, l.type, l.description, l.extra_label]
          .filter(Boolean).join(' ').toLowerCase();
        return blob.includes(q);
      });
    }
    if (f.city) r = r.filter(l => l.city === f.city);
    if (f.type) r = r.filter(l => l.type === f.type);
    if (f.kind) r = r.filter(l => (l.kind || 'occasion') === f.kind);
    if (f.deal) r = r.filter(l => (l.deal || 'sale') === f.deal);
    if (f.min_p) r = r.filter(l => (l.price_usd || 0) >= f.min_p);
    if (f.max_p) r = r.filter(l => (l.price_usd || 0) <= f.max_p);
    if (f.min_r) r = r.filter(l => parseFirstNumber(l.rooms) >= f.min_r);
    if (f.min_s) r = r.filter(l => parseFirstNumber(l.surface) >= f.min_s);
    if (f.max_s) r = r.filter(l => parseFirstNumber(l.surface) <= f.max_s);
    if (f.sig_only) r = r.filter(l => l.signature === true);
    if (f.fea_only) r = r.filter(l => l.featured === true);

    switch (f.sort) {
      case 'price-desc':   r = [...r].sort((a, b) => (b.price_usd || 0) - (a.price_usd || 0)); break;
      case 'price-asc':    r = [...r].sort((a, b) => (a.price_usd || 0) - (b.price_usd || 0)); break;
      case 'surface-desc': r = [...r].sort((a, b) => parseFirstNumber(b.surface) - parseFirstNumber(a.surface)); break;
      case 'rooms-desc':   r = [...r].sort((a, b) => parseFirstNumber(b.rooms) - parseFirstNumber(a.rooms)); break;
      case 'newest':       r = [...r].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)); break;
      default:             r = [...r].sort((a, b) => (b.signature ? 1 : 0) - (a.signature ? 1 : 0) || (a.position || 0) - (b.position || 0));
    }
    return r;
  }

  // ------------------------------------------------------------------
  // CARDS HTML
  // ------------------------------------------------------------------
  function T(s) { return (window.SLI18n && window.SLI18n.translate) ? window.SLI18n.translate(s) : s; }

  function cardHTML(l, opts) {
    opts = opts || {};
    const big = opts.big;
    const refTag = (l.signature ? '★ ' : '') + (l.ref || '');
    const heart = '<button class="like-btn" aria-label="Favori"><svg width="' + (big ? 18 : 16) + '" height="' + (big ? 18 : 16) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>';
    const img = imageUrl(l.image);
    // Deal & kind tags (À louer / Neuf / Projet / Local commercial). Surfaced as
    // small chips because they materially change what the listing is about.
    const dealTag = (l.deal === 'rent')
      ? '<div class="deal-chip deal-chip-rent">À louer</div>'
      : '';
    const kindTag = (l.kind && l.kind !== 'occasion')
      ? '<div class="kind-chip">' + escapeHtml(({ neuf: 'Neuf', projet: 'Projet', commercial: 'Local commercial' })[l.kind] || l.kind) + '</div>'
      : '';

    if (big) {
      return [
        '<article class="estate mb-16" data-city="', escapeHtml(l.city), '" data-type="', escapeHtml(l.type), '" data-kind="', escapeHtml(l.kind || ''), '" data-deal="', escapeHtml(l.deal || ''), '" data-ref="', escapeHtml(l.ref || ''), '" data-slug="', escapeHtml(l.slug || ''), '" data-id="', escapeHtml(l.id || ''), '">',
        '  <div class="grid md:grid-cols-12 gap-10 items-center">',
        '    <div class="md:col-span-7 frame aspect-[16/10]">',
        '      <img loading="lazy" decoding="async" src="', escapeHtml(img), '" class="w-full h-full object-cover" alt="', escapeHtml(l.title_main + ' ' + (l.title_accent || '')), '">',
        '      <div class="ref-tag">', escapeHtml(refTag), (l.signature ? ' · ' + T('PIÈCE SIGNATURE') : ''), '</div>',
        dealTag, kindTag,
        heart,
        '    </div>',
        '    <div class="md:col-span-5">',
        '      <div class="label-teal">', T('RÉF.'), ' ', escapeHtml(l.ref), ' · ', cityLabel(l.city), ' · ', escapeHtml(l.neighborhood || ''), '</div>',
        '      <h3 class="display mt-4" style="font-size: clamp(2.25rem, 4vw, 3.5rem); line-height: 0.95">',
        escapeHtml(l.title_main), ' <span class="display-i text-[var(--gold-deep)]">', escapeHtml(l.title_accent || ''), '</span>',
        '      </h3>',
        '      <p class="text-base text-[var(--ink-soft)] mt-5 leading-relaxed">', escapeHtmlMultiline(l.description || ''), '</p>',
        '      <div class="grid grid-cols-2 gap-4 mt-6 border-t border-[var(--line)] pt-5">',
        '        <div><div class="label">SURFACE</div><div class="display text-xl mt-1.5">', escapeHtml(l.surface || ''), '</div></div>',
        '        <div><div class="label">PIÈCES</div><div class="display text-xl mt-1.5">', escapeHtml(l.rooms || ''), '</div></div>',
        '      </div>',
        '      <div class="mt-6 border-t border-[var(--line)] pt-5 flex items-end justify-end">',
        '        <a href="#listing-' + escapeHtml(l.slug || l.ref || l.id || '') + '" class="btn-line text-[var(--teal)]" data-listing-ref="' + escapeHtml(l.slug || l.ref || l.id || '') + '">' + T('Voir l\'annonce') + ' →</a>',
        '      </div>',
        '    </div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    return [
      '<article class="estate" data-city="', escapeHtml(l.city), '" data-type="', escapeHtml(l.type), '" data-kind="', escapeHtml(l.kind || ''), '" data-deal="', escapeHtml(l.deal || ''), '" data-ref="', escapeHtml(l.ref || ''), '" data-slug="', escapeHtml(l.slug || ''), '" data-id="', escapeHtml(l.id || ''), '">',
      '  <div class="frame aspect-[4/5] mb-5">',
      '    <img loading="lazy" decoding="async" src="', escapeHtml(img), '" class="w-full h-full object-cover" alt="', escapeHtml(l.title_main + ' ' + (l.title_accent || '')), '">',
      '    <div class="ref-tag">', escapeHtml(refTag), '</div>',
      dealTag, kindTag,
      heart,
      '  </div>',
      '  <div>',
      '    <div class="label-teal">', cityLabel(l.city), ' · ', escapeHtml((l.neighborhood || '').toUpperCase()), '</div>',
      '    <h3 class="display text-2xl mt-3 leading-tight">', escapeHtml(l.title_main), ' <span class="display-i text-[var(--gold-deep)]">', escapeHtml(l.title_accent || ''), '</span></h3>',
      '    <p class="text-sm text-[var(--ink-soft)] mt-2">', escapeHtmlMultiline(l.description || ''), '</p>',
      '    <div class="flex items-end justify-between mt-4 pt-3 border-t border-[var(--line)]">',
      '      <span class="label !tracking-[0.2em]">', escapeHtml(l.rooms || ''), l.extra_label ? ' · ' + escapeHtml(l.extra_label) : '', '</span>',
      '      <span class="cinzel text-[10px] tracking-[0.3em] text-[var(--gold-deep)]">' + T('DÉTAILS') + ' →</span>',
      '    </div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  // ------------------------------------------------------------------
  // ACTIVE CHIPS
  // ------------------------------------------------------------------
  function chipsHTML(f) {
    const chips = [];
    if (f.q) chips.push({ key: 'q', label: '« ' + f.q + ' »' });
    if (f.city) chips.push({ key: 'city', label: cityHuman(f.city) });
    if (f.kind) chips.push({ key: 'kind', label: ({ neuf: 'Neuf', occasion: 'Occasion', projet: 'Projet', commercial: 'Local commercial' })[f.kind] || f.kind });
    if (f.deal) chips.push({ key: 'deal', label: f.deal === 'rent' ? 'À louer' : 'À vendre' });
    if (f.type) chips.push({ key: 'type', label: typeHuman(f.type) });
    if (f.min_p && f.max_p) chips.push({ key: 'price', label: fmtUSD(f.min_p) + '—' + fmtUSD(f.max_p) });
    else if (f.min_p) chips.push({ key: 'price', label: '> ' + fmtUSD(f.min_p) });
    else if (f.max_p) chips.push({ key: 'price', label: '< ' + fmtUSD(f.max_p) });
    if (f.min_r) chips.push({ key: 'min_r', label: f.min_r + (f.min_r > 1 ? '+ pièces' : '+ pièce') });
    if (f.min_s && f.max_s) chips.push({ key: 'surface', label: f.min_s + '—' + f.max_s + ' m²' });
    else if (f.min_s) chips.push({ key: 'surface', label: '> ' + f.min_s + ' m²' });
    else if (f.max_s) chips.push({ key: 'surface', label: '< ' + f.max_s + ' m²' });
    if (f.sig_only) chips.push({ key: 'sig_only', label: '★ Signature' });
    if (f.fea_only) chips.push({ key: 'fea_only', label: 'À la une' });

    if (!chips.length) return '';
    return chips.map(c =>
      '<span class="chip">' + escapeHtml(c.label) +
      '<button class="chip-close" data-chip-remove="' + c.key + '" aria-label="Retirer">×</button></span>'
    ).join('');
  }

  function clearChip(key) {
    if (key === 'q') FILTER.q = '';
    else if (key === 'city') FILTER.city = '';
    else if (key === 'kind') FILTER.kind = '';
    else if (key === 'deal') FILTER.deal = '';
    else if (key === 'type') FILTER.type = '';
    else if (key === 'price') { FILTER.min_p = 0; FILTER.max_p = 0; }
    else if (key === 'surface') { FILTER.min_s = 0; FILTER.max_s = 0; }
    else if (key === 'min_r') FILTER.min_r = 0;
    else if (key === 'sig_only') FILTER.sig_only = false;
    else if (key === 'fea_only') FILTER.fea_only = false;
    syncFormFromFilter();
    rerender();
  }

  function resetFilter() {
    FILTER = Object.assign({}, FILTER_DEFAULTS);
    syncFormFromFilter();
    rerender();
  }

  // ------------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------------
  function renderPortfolio() {
    const root = document.getElementById('listings-portfolio');
    if (!root) return;
    if (!CACHE) {
      root.innerHTML = '<div class="text-center py-20 text-[var(--muted)] cinzel text-xs tracking-[0.3em]">Chargement…</div>';
      return;
    }
    const filtered = applyFilter(CACHE, FILTER);
    const countEl = document.getElementById('resultCount');
    const nounEl = document.getElementById('resultNoun');
    if (countEl) countEl.textContent = filtered.length;
    if (nounEl) nounEl.textContent = filtered.length > 1 ? 'biens' : 'bien';

    const chipsEl = document.getElementById('activeChips');
    if (chipsEl) {
      chipsEl.innerHTML = chipsHTML(FILTER);
      chipsEl.querySelectorAll('[data-chip-remove]').forEach(b =>
        b.addEventListener('click', () => clearChip(b.dataset.chipRemove))
      );
    }

    if (!filtered.length) {
      root.innerHTML = '<div class="empty-results"><div class="display text-3xl">Aucun bien ne correspond.</div><p class="mt-3">Essayez d\'élargir vos critères, ou <a href="contact.html" class="text-[var(--gold-deep)] underline">demandez l\'accès au carnet privé</a> (13 pièces off-market non listées ici).</p><button id="emptyResetBtn" class="btn-line text-[var(--teal)] mt-6">Réinitialiser les filtres</button></div>';
      const er = document.getElementById('emptyResetBtn');
      if (er) er.addEventListener('click', resetFilter);
      writeFilterToURL(FILTER);
      if (window.SLI18n && typeof window.SLI18n.refresh === 'function') window.SLI18n.refresh();
      return;
    }

    const big = filtered.find(l => l.signature) || filtered[0];
    const others = filtered.filter(l => l !== big);
    const html = [];
    if (big) html.push(cardHTML(localizedListing(big), { big: true }));
    if (others.length) {
      html.push('<div class="grid md:grid-cols-3 gap-x-6 gap-y-12">');
      others.forEach(l => html.push(cardHTML(localizedListing(l))));
      html.push('</div>');
    }
    root.innerHTML = html.join('');
    writeFilterToURL(FILTER);
    // Re-apply current language to translate freshly inserted static labels
    // (Visiter →, RÉF., SURFACE, PIÈCES, PRIX, PIÈCE SIGNATURE…).
    if (window.SLI18n && typeof window.SLI18n.refresh === 'function') {
      window.SLI18n.refresh();
    }
  }

  function rerender() {
    renderPortfolio();
  }

  // ------------------------------------------------------------------
  // FORM <-> FILTER SYNC
  // ------------------------------------------------------------------
  function syncFilterFromForm() {
    const get = id => document.getElementById(id);
    const q = get('searchQ'); if (q) FILTER.q = q.value || '';
    const city = get('searchCity'); if (city) FILTER.city = city.value || '';
    const kind = get('searchKind'); if (kind) FILTER.kind = kind.value || '';
    const type = get('searchType'); if (type) FILTER.type = type.value || '';
    const rooms = get('searchRooms'); if (rooms) FILTER.min_r = parseInt(rooms.value || '0', 10) || 0;
    const price = get('searchPrice');
    if (price) {
      const v = price.value;
      if (!v) { FILTER.min_p = 0; FILTER.max_p = 0; }
      else {
        const [a, b] = v.split('-').map(Number);
        FILTER.min_p = a || 0;
        FILTER.max_p = b || 0;
      }
    }
    const sMin = get('surfaceMin'); if (sMin) FILTER.min_s = parseInt(sMin.value || '0', 10) || 0;
    const sMax = get('surfaceMax'); if (sMax) FILTER.max_s = parseInt(sMax.value || '0', 10) || 0;
    const sig = get('sigOnly'); if (sig) FILTER.sig_only = !!sig.checked;
    const fea = get('feaOnly'); if (fea) FILTER.fea_only = !!fea.checked;
    const sort = get('sortBy'); if (sort) FILTER.sort = sort.value || 'pertinence';
  }

  function syncFormFromFilter() {
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = (v || v === 0) ? v : ''; };
    set('searchQ', FILTER.q);
    set('searchCity', FILTER.city);
    set('searchKind', FILTER.kind);
    set('searchType', FILTER.type);
    set('searchRooms', FILTER.min_r || '');
    // Deal tabs (segmented buttons)
    document.querySelectorAll('.deal-tab').forEach(tab => {
      const dealVal = tab.getAttribute('data-deal') || '';
      tab.classList.toggle('is-active', dealVal === (FILTER.deal || ''));
    });
    // Price uses a range key like "5000000-10000000"
    const priceEl = document.getElementById('searchPrice');
    if (priceEl) {
      let val = '';
      if (FILTER.min_p || FILTER.max_p) val = (FILTER.min_p || 0) + '-' + (FILTER.max_p || 0);
      // try to find an option that matches — otherwise show the closest one (top option keeps the range)
      let matched = false;
      Array.from(priceEl.options).forEach(o => { if (o.value === val) { matched = true; o.selected = true; } });
      if (!matched && val) {
        // add a custom option
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = (FILTER.min_p ? fmtUSD(FILTER.min_p) : '0') + '—' + (FILTER.max_p ? fmtUSD(FILTER.max_p) : '∞');
        priceEl.appendChild(opt);
        opt.selected = true;
      } else if (!val) {
        priceEl.value = '';
      }
    }
    set('surfaceMin', FILTER.min_s || '');
    set('surfaceMax', FILTER.max_s || '');
    const sig = document.getElementById('sigOnly'); if (sig) sig.checked = !!FILTER.sig_only;
    const fea = document.getElementById('feaOnly'); if (fea) fea.checked = !!FILTER.fea_only;
    set('sortBy', FILTER.sort);
  }

  // ------------------------------------------------------------------
  // WIRE FORM
  // ------------------------------------------------------------------
  function wireSearchForm() {
    const ids = ['searchQ', 'searchCity', 'searchKind', 'searchType', 'searchRooms', 'searchPrice',
                 'surfaceMin', 'surfaceMax', 'sigOnly', 'feaOnly', 'sortBy'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const evt = (el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'search' || el.type === 'number')) ? 'input' : 'change';
      el.addEventListener(evt, () => { syncFilterFromForm(); rerender(); });
    });

    // Deal-tabs: segmented "À vendre / À louer / Tout"
    document.querySelectorAll('.deal-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        FILTER.deal = tab.getAttribute('data-deal') || '';
        document.querySelectorAll('.deal-tab').forEach(t => t.classList.toggle('is-active', t === tab));
        rerender();
      });
    });

    const reset = document.getElementById('resetBtn');
    if (reset) reset.addEventListener('click', resetFilter);

    const more = document.getElementById('moreFiltersBtn');
    const morePanel = document.getElementById('moreFilters');
    if (more && morePanel) {
      more.addEventListener('click', () => {
        const open = !morePanel.hidden;
        morePanel.hidden = open;
        more.setAttribute('aria-expanded', String(!open));
        more.classList.toggle('is-open', !open);
      });
    }
  }

  // ------------------------------------------------------------------
  // FEATURED HOME RENDERER
  // ------------------------------------------------------------------
  function featuredCardHTML(rawL) {
    const l = localizedListing(rawL);
    const img = imageUrl(l.image);
    return [
      '<article class="estate featured-card" data-ref="', escapeHtml(l.ref || ''), '" data-slug="', escapeHtml(l.slug || ''), '" data-id="', escapeHtml(l.id || ''), '">',
      '  <div class="frame aspect-[4/5] mb-5">',
      '    <img loading="lazy" decoding="async" src="', escapeHtml(img), '" class="w-full h-full object-cover" alt="', escapeHtml(l.title_main + ' ' + (l.title_accent || '')), '">',
      '    <div class="ref-tag">', (l.signature ? '★ ' : ''), escapeHtml(l.ref || ''), '</div>',
      '  </div>',
      '  <div class="label-teal">', cityLabel(l.city), ' · ', escapeHtml((l.neighborhood || '').toUpperCase()), '</div>',
      '  <h3 class="display text-3xl mt-3 leading-tight">', escapeHtml(l.title_main), ' <span class="display-i text-[var(--gold-deep)]">', escapeHtml(l.title_accent || ''), '</span></h3>',
      '  <p class="text-sm text-[var(--ink-soft)] mt-2">', escapeHtmlMultiline(l.description || ''), '</p>',
      '  <div class="flex items-end justify-between mt-4 pt-3 border-t border-[var(--line)]">',
      '    <span class="label !tracking-[0.2em]">', escapeHtml(l.rooms || ''), l.extra_label ? ' · ' + escapeHtml(l.extra_label) : '', '</span>',
      '    <span class="cinzel text-[10px] tracking-[0.3em] text-[var(--gold-deep)]">DÉTAILS →</span>',
      '  </div>',
      '</article>'
    ].join('');
  }

  // Met à jour les VRAIS compteurs d'annonces par ville sur les cartes
  // d'accueil (remplace les chiffres codés en dur) + le compteur du CTA.
  // "SUR DEMANDE" si la ville n'a aucune annonce visible.
  function updateCityCounts(rows) {
    try {
      const counts = {};
      (rows || []).forEach(l => { const c = (l.city || '').toLowerCase().trim(); if (c) counts[c] = (counts[c] || 0) + 1; });
      document.querySelectorAll('[data-city] .city-count').forEach(el => {
        const card = el.closest('[data-city]');
        const slug = (card.getAttribute('data-city') || '').toLowerCase().trim();
        const n = counts[slug] || 0;
        el.textContent = n > 0 ? (n + (n > 1 ? ' BIENS' : ' BIEN')) : 'SUR DEMANDE';
      });
      const cta = document.getElementById('portfolioCount');
      if (cta) cta.textContent = String((rows || []).length);
    } catch (e) {}
  }

  function renderFeatured(container, count) {
    return load().then(rows => {
      count = count || 3;
      updateCityCounts(rows);
      // Anything flagged "Signature" (★) is auto-promoted to the home selection
      // and listed BEFORE the "À la une" picks. Deduped if a listing is both.
      const signatures = rows.filter(l => l.signature === true);
      const sigIds = new Set(signatures.map(l => l.id || l.ref));
      const others = rows.filter(l => l.featured === true && !sigIds.has(l.id || l.ref));
      const featured = signatures.concat(others);

      // No artificial padding: the section honestly reflects what's flagged À la une or ★ Signature.
      // 0 → hide the wrapping section so we don't ship empty chrome.
      // 1–3 → static grid (1, 2 or 3 cards naturally).
      // 4+ → luxury carousel kicks in.
      const wrapper = container.closest('section');
      if (!featured.length) {
        if (wrapper) wrapper.hidden = true;
        return;
      }
      if (wrapper) wrapper.hidden = false;

      if (featured.length > count) {
        renderFeaturedCarousel(container, featured, count);
      } else {
        container.classList.remove('featured-carousel');
        container.classList.add('grid', 'md:grid-cols-3', 'gap-6');
        container.innerHTML = featured.map(featuredCardHTML).join('');
      }
      if (window.SLI18n && typeof window.SLI18n.refresh === 'function') window.SLI18n.refresh();
    }).catch(e => console.error('[featured] failed:', e));
  }

  // ------------------------------------------------------------------
  // FEATURED CAROUSEL — luxury infinite auto-sliding carousel
  //
  // Uses the "cloned slides" technique so the loop is truly infinite:
  //   • The track is built as [tail clones] [real items] [head clones].
  //   • When the user scrolls past the last real item, the transition
  //     completes onto the head clones, then we snap (no animation)
  //     back to the equivalent real position. The user never sees a
  //     reverse jump.
  // ------------------------------------------------------------------
  function renderFeaturedCarousel(container, items, slotsPerView) {
    container.classList.remove('grid', 'md:grid-cols-3', 'gap-6');
    container.classList.add('featured-carousel');
    container.innerHTML =
      '<div class="featured-stage">' +
        '<button class="featured-arrow featured-prev" aria-label="Précédent"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><polyline points="15 18 9 12 15 6"/></svg></button>' +
        '<div class="featured-viewport">' +
          '<div class="featured-track"></div>' +
        '</div>' +
        '<button class="featured-arrow featured-next" aria-label="Suivant"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><polyline points="9 18 15 12 9 6"/></svg></button>' +
      '</div>' +
      '<div class="featured-controls"><div class="featured-dots"></div></div>';

    const track = container.querySelector('.featured-track');
    const dotsRoot = container.querySelector('.featured-dots');
    const prevBtn = container.querySelector('.featured-prev');
    const nextBtn = container.querySelector('.featured-next');
    const N = items.length;
    let perView = slotsPerView;
    // Pad count = how many clones to inject on each side. Always equal to
    // the largest possible perView we'll ever use, so when perView grows
    // (e.g. orientation change) the carousel still has enough buffer.
    const PAD = Math.max(slotsPerView, 3);

    // Build the cloned track: last PAD items + real items + first PAD items.
    // Logical index 0 maps to actual DOM index PAD (the first real card).
    function buildClonedHTML() {
      const tail = items.slice(-PAD);  // last PAD items, cloned at the start
      const head = items.slice(0, PAD); // first PAD items, cloned at the end
      const all = tail.concat(items).concat(head);
      return all.map(featuredCardHTML).join('');
    }
    track.innerHTML = buildClonedHTML();
    let cards = Array.from(track.children); // length = N + 2*PAD

    // logicalIdx ∈ [0, N) — the conceptual "current page" the user sees.
    // physicalIdx is logicalIdx + PAD — the actual position in the cloned track.
    let logicalIdx = 0;
    let timer = null;
    let isAnimating = false;
    const AUTOPLAY_MS = 6000;

    function setTransition(on) {
      track.style.transition = on ? '' : 'none';
    }
    // Cached at relayout time so applyTransform doesn't measure the DOM each tick.
    let slotPx = 0;
    function applyTransform() {
      const physical = logicalIdx + PAD;
      // Translate in pixels (card width + gap per slot). Using % was buggy:
      // translateX(-100%) is 100% of the TRACK's own width, not the viewport,
      // so multi-slot translations overshot wildly.
      const offsetPx = -(physical * slotPx);
      track.style.transform = 'translateX(' + offsetPx + 'px)';
    }
    function rebuildDots() {
      dotsRoot.innerHTML = '';
      for (let i = 0; i < N; i++) {
        const b = document.createElement('button');
        b.className = 'featured-dot' + (i === logicalIdx ? ' is-active' : '');
        b.setAttribute('aria-label', 'Aller à la diapo ' + (i + 1));
        b.addEventListener('click', () => { goTo(i, true); });
        dotsRoot.appendChild(b);
      }
    }
    function syncDots() {
      Array.from(dotsRoot.children).forEach((d, i) => d.classList.toggle('is-active', i === ((logicalIdx % N) + N) % N));
    }
    function settleAfterAnim() {
      // If we landed on a cloned region, snap back into the real range with
      // no transition so the loop is invisible.
      let normalized = logicalIdx;
      if (logicalIdx >= N) normalized = logicalIdx - N;
      else if (logicalIdx < 0) normalized = logicalIdx + N;
      if (normalized !== logicalIdx) {
        logicalIdx = normalized;
        setTransition(false);
        applyTransform();
        // Force reflow so the no-transition transform is committed before re-enabling
        void track.offsetWidth;
        setTransition(true);
      }
      isAnimating = false;
    }
    function goTo(target, fromUser) {
      if (isAnimating) return;
      // For dot clicks, target is a logical index 0..N-1. Choose the shortest
      // direction so dots don't always force a long forward sweep.
      const cur = ((logicalIdx % N) + N) % N;
      let delta = target - cur;
      if (delta > N / 2) delta -= N;
      if (delta < -N / 2) delta += N;
      logicalIdx = logicalIdx + delta;
      isAnimating = true;
      setTransition(true);
      applyTransform();
      syncDots();
      if (fromUser) restartTimer();
    }
    function step(direction, fromUser) {
      if (isAnimating) return;
      logicalIdx += direction;
      isAnimating = true;
      setTransition(true);
      applyTransform();
      syncDots();
      if (fromUser) restartTimer();
    }
    track.addEventListener('transitionend', (e) => {
      if (e.propertyName === 'transform') settleAfterAnim();
    });

    function startTimer() { stopTimer(); timer = setInterval(() => step(1, false), AUTOPLAY_MS); }
    function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
    function restartTimer() { stopTimer(); startTimer(); }

    function computePerView() {
      const w = container.clientWidth;
      if (w < 640) return 1;
      if (w < 960) return 2;
      return slotsPerView;
    }
    function relayout() {
      perView = computePerView();
      const gap = 24; // matches gap CSS
      const total = container.querySelector('.featured-viewport').clientWidth;
      const cardW = (total - gap * (perView - 1)) / perView;
      cards.forEach(c => { c.style.flex = '0 0 ' + cardW + 'px'; });
      // One "slot" advance = one card + one gap (in pixels).
      slotPx = cardW + gap;
      logicalIdx = ((logicalIdx % N) + N) % N;
      rebuildDots();
      setTransition(false);
      applyTransform();
      void track.offsetWidth;
      setTransition(true);
    }

    nextBtn.addEventListener('click', () => step(1, true));
    prevBtn.addEventListener('click', () => step(-1, true));
    container.addEventListener('mouseenter', stopTimer);
    container.addEventListener('mouseleave', startTimer);
    window.addEventListener('resize', () => { relayout(); });

    relayout();
    startTimer();
  }

  // ------------------------------------------------------------------
  // HERO SEARCH (homepage) — submits to portefeuille.html with params
  // ------------------------------------------------------------------
  function wireHeroSearch() {
    const form = document.getElementById('heroSearchForm');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(form);
      const params = new URLSearchParams();
      for (const [k, v] of fd.entries()) {
        if (v) {
          if (k === 'price') {
            const [a, b] = String(v).split('-').map(Number);
            if (a) params.set('min_p', a);
            if (b) params.set('max_p', b);
          } else {
            params.set(k, v);
          }
        }
      }
      const qs = params.toString();
      location.href = 'portefeuille.html' + (qs ? '?' + qs : '');
    });
  }

  // ------------------------------------------------------------------
  // LISTING DETAIL READER — click any card to open a full-detail modal
  // ------------------------------------------------------------------
  let isListingOpen = false;
  let suppressListingPop = false;
  let galleryImages = [];      // full list of image paths for the open listing
  let galleryIndex = 0;        // which photo is currently displayed
  let lastReaderTrigger = null; // element to refocus when the dialog closes
  let touchStartX = null;      // for swipe gesture on mobile

  function buildListingReader() {
    if (document.getElementById('listingReader')) return;
    const m = document.createElement('div');
    m.id = 'listingReader';
    m.className = 'listing-reader';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    m.setAttribute('aria-label', 'Détail du bien');
    m.setAttribute('tabindex', '-1');
    m.hidden = true;
    m.innerHTML =
      '<div class="listing-reader-overlay" data-close></div>' +
      '<article class="listing-reader-box">' +
        '<button class="listing-reader-back" data-close type="button" aria-label="Retour">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>' +
          '<span>Retour</span>' +
        '</button>' +
        '<button class="listing-reader-close" data-close type="button" aria-label="Fermer">×</button>' +
        '<div class="listing-reader-cover-wrap">' +
          '<div class="listing-reader-viewport">' +
            '<div class="listing-reader-track"></div>' +
          '</div>' +
          '<button class="listing-reader-arrow listing-reader-prev" type="button" aria-label="Photo précédente">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>' +
          '</button>' +
          '<button class="listing-reader-arrow listing-reader-next" type="button" aria-label="Photo suivante">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>' +
          '</button>' +
          '<div class="listing-reader-counter"><span class="cur">1</span> / <span class="tot">1</span></div>' +
        '</div>' +
        '<div class="listing-reader-body"></div>' +
      '</article>';
    document.body.appendChild(m);

    m.addEventListener('click', e => {
      if (e.target.closest('[data-close]')) { e.preventDefault(); closeListingReader(); }
    });
    m.addEventListener('keydown', e => {
      if (e.key !== 'Tab' || m.hidden) return;
      const f = [...m.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(el => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    document.addEventListener('keydown', e => {
      if (!isListingOpen) return;
      if (e.key === 'Escape') closeListingReader();
      else if (e.key === 'ArrowLeft')  { e.preventDefault(); showGalleryAt(galleryIndex - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); showGalleryAt(galleryIndex + 1); }
    });
    window.addEventListener('popstate', () => {
      if (suppressListingPop) { suppressListingPop = false; return; }
      if (isListingOpen) closeListingReader(true);
    });

    // Arrows
    m.querySelector('.listing-reader-prev').addEventListener('click', e => { e.stopPropagation(); showGalleryAt(galleryIndex - 1); });
    m.querySelector('.listing-reader-next').addEventListener('click', e => { e.stopPropagation(); showGalleryAt(galleryIndex + 1); });

    // Unified pointer drag (mouse + touch + pen) — track follows the cursor live,
    // then snaps on release. Mouse drag on desktop = touch swipe on mobile.
    const viewport = m.querySelector('.listing-reader-viewport');
    const track = m.querySelector('.listing-reader-track');
    let dragStartX = null;
    let dragStartY = null;
    let dragWidth = 0;
    let isHorizontalDrag = false;

    viewport.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;   // left button only
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragWidth = viewport.clientWidth || 1;
      isHorizontalDrag = false;
      track.style.transition = 'none';
      viewport.style.cursor = 'grabbing';
      try { viewport.setPointerCapture(e.pointerId); } catch (_) {}
    });

    viewport.addEventListener('pointermove', e => {
      if (dragStartX == null || !galleryImages.length) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      // Lock direction: if vertical motion clearly wins, abort the drag so the
      // page can scroll instead.
      if (!isHorizontalDrag) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          dragStartX = null;
          track.style.transition = '';
          viewport.style.cursor = '';
          return;
        }
        isHorizontalDrag = true;
      }
      const basePct = -galleryIndex * 100;
      track.style.transform = 'translate3d(calc(' + basePct + '% + ' + dx + 'px), 0, 0)';
    });

    function endDrag(e) {
      if (dragStartX == null) return;
      const dx = (e.clientX != null ? e.clientX : dragStartX) - dragStartX;
      dragStartX = null;
      track.style.transition = '';
      viewport.style.cursor = '';
      const ratio = Math.abs(dx) / Math.max(dragWidth, 1);
      if (isHorizontalDrag && ratio > 0.18) showGalleryAt(galleryIndex + (dx < 0 ? 1 : -1));
      else showGalleryAt(galleryIndex);   // snap back
    }
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);
    viewport.addEventListener('pointerleave', endDrag);
    // Block native image drag (would otherwise hijack the cursor)
    viewport.addEventListener('dragstart', e => e.preventDefault());

    if (!document.getElementById('listingReaderStyle')) {
      const s = document.createElement('style');
      s.id = 'listingReaderStyle';
      s.textContent = (
        '.listing-reader { position: fixed; inset: 0; z-index: 200; display: flex; align-items: flex-start; justify-content: center; overflow-y: auto; opacity: 0; transition: opacity 0.35s ease-out; }' +
        '.listing-reader.is-visible { opacity: 1; }' +
        '.listing-reader[hidden] { display: none; }' +
        '.listing-reader-overlay { position: fixed; inset: 0; background: rgba(14,39,34,0.92); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }' +
        '.listing-reader-box { position: relative; background: var(--paper); max-width: 1100px; width: 100%; min-height: 100vh; box-shadow: 0 0 80px rgba(0,0,0,0.55); transform: translateY(20px); transition: transform 0.5s cubic-bezier(0.2,0.85,0.2,1); }' +
        '.listing-reader.is-visible .listing-reader-box { transform: translateY(0); }' +
        '.listing-reader-back { position: fixed; top: 18px; left: 18px; z-index: 4; display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px 10px 14px; border: 1px solid var(--gold); background: var(--paper); color: var(--teal); font-family: \'Cinzel\', serif; font-size: 11px; font-weight: 500; letter-spacing: 0.3em; text-transform: uppercase; cursor: pointer; transition: all 0.4s; border-radius: 999px; }' +
        '.listing-reader-back:hover { background: var(--teal); color: var(--gold); border-color: var(--teal); letter-spacing: 0.4em; }' +
        '.listing-reader-close { position: fixed; top: 18px; right: 18px; z-index: 4; width: 42px; height: 42px; border: 1px solid var(--gold); background: var(--paper); border-radius: 50%; cursor: pointer; font-size: 24px; line-height: 1; color: var(--teal); transition: all 0.3s; }' +
        '.listing-reader-close:hover { background: var(--teal); color: var(--gold); border-color: var(--teal); transform: rotate(90deg); }' +
        /* Cover wrapper hosts the slider + nav arrows + counter */
        '.listing-reader-cover-wrap { position: relative; background: var(--paper-deep); }' +
        '.listing-reader-viewport { aspect-ratio: 16/9; overflow: hidden; touch-action: pan-y; cursor: grab; user-select: none; -webkit-user-select: none; }' +
        '.listing-reader-viewport:active { cursor: grabbing; }' +
        '.listing-reader-track { display: flex; height: 100%; width: 100%; transition: transform 0.55s cubic-bezier(0.22, 0.61, 0.36, 1); will-change: transform; }' +
        '.listing-reader-slide { flex: 0 0 100%; height: 100%; background-size: cover; background-position: center; background-color: var(--paper-deep); user-select: none; -webkit-user-drag: none; }' +
        '.listing-reader-cover-wrap::after { content: \'\'; position: absolute; left: 0; right: 0; bottom: 0; height: 35%; background: linear-gradient(180deg, rgba(14,39,34,0) 0%, rgba(244,237,224,1) 100%); pointer-events: none; z-index: 1; }' +
        /* Navigation arrows on the cover */
        '.listing-reader-arrow { position: absolute; top: 50%; transform: translateY(-50%); z-index: 3; width: 52px; height: 52px; border-radius: 50%; border: 0; background: rgba(244,237,224,0.85); color: var(--teal); cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 18px rgba(14,39,34,0.25); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); transition: all 0.3s cubic-bezier(0.2,0.85,0.2,1); opacity: 0.85; }' +
        '.listing-reader-arrow:hover { background: var(--teal); color: var(--gold); opacity: 1; transform: translateY(-50%) scale(1.08); box-shadow: 0 6px 24px rgba(14,39,34,0.45); }' +
        '.listing-reader-arrow:active { transform: translateY(-50%) scale(0.96); }' +
        '.listing-reader-arrow.is-hidden { opacity: 0; pointer-events: none; }' +
        '.listing-reader-prev { left: 16px; }' +
        '.listing-reader-next { right: 16px; }' +
        '@media (max-width: 560px) { .listing-reader-arrow { width: 44px; height: 44px; } .listing-reader-prev { left: 10px; } .listing-reader-next { right: 10px; } }' +
        /* Counter pill, top-right of cover */
        '.listing-reader-counter { position: absolute; top: 18px; left: 50%; transform: translateX(-50%); z-index: 3; padding: 6px 14px; background: rgba(14,39,34,0.78); color: var(--gold); font-family: \'Cinzel\', serif; font-size: 11px; letter-spacing: 0.25em; border-radius: 999px; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }' +
        '.listing-reader-counter.is-hidden { display: none; }' +
        '.listing-reader-body { padding: 2rem 1.5rem 5rem; max-width: 880px; margin: 0 auto; position: relative; z-index: 1; }' +
        '@media (min-width: 768px) { .listing-reader-body { padding: 2.5rem 3rem 6rem; } .listing-reader-cover { aspect-ratio: 16/8.5; } }' +
        '.listing-reader-meta { font-family: \'Cinzel\', serif; font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; color: var(--gold-deep); margin-bottom: 1rem; }' +
        '.listing-reader-title { font-family: \'Playfair Display\', serif; font-weight: 400; line-height: 1.05; font-size: clamp(2rem, 5vw, 3.4rem); color: var(--teal); margin: 0 0 0.6rem; letter-spacing: -0.01em; }' +
        '.listing-reader-title em { font-style: italic; color: var(--gold-deep); }' +
        '.listing-reader-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 1rem 0 2rem; }' +
        '.listing-reader-tag { display: inline-flex; align-items: center; padding: 0.4rem 0.9rem; background: var(--paper-deep); border-radius: 999px; font-family: \'Cinzel\', serif; font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold-deep); }' +
        '.listing-reader-tag.is-gold { background: var(--gold); color: var(--teal); }' +
        '.listing-reader-desc { font-family: \'Plus Jakarta Sans\', sans-serif; font-size: 16.5px; line-height: 1.75; color: var(--ink); margin-bottom: 2.5rem; }' +
        '.listing-reader-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1.4rem; padding: 1.5rem 0; border-top: 1px solid var(--line-gold); border-bottom: 1px solid var(--line-gold); margin-bottom: 2.5rem; }' +
        '.listing-reader-stat { text-align: center; }' +
        '.listing-reader-stat .lbl { font-family: \'Cinzel\', serif; font-size: 9px; letter-spacing: 0.35em; text-transform: uppercase; color: var(--gold-deep); display: block; margin-bottom: 0.4rem; }' +
        '.listing-reader-stat .val { font-family: \'Playfair Display\', serif; font-size: 1.4rem; color: var(--teal); }' +
        '.listing-reader-price-row { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 1.5rem; margin-bottom: 2.5rem; }' +
        '.listing-reader-price { font-family: \'Playfair Display\', serif; font-size: clamp(2rem, 4vw, 2.8rem); color: var(--teal); line-height: 1; }' +
        '.listing-reader-price-eq { font-family: \'JetBrains Mono\', monospace; font-size: 12px; color: var(--muted); margin-top: 0.4rem; }' +
        '.listing-reader-cta { display: inline-flex; align-items: center; gap: 0.7rem; padding: 1.1rem 2rem; background: var(--teal); color: var(--gold); font-family: \'Cinzel\', serif; font-size: 11px; font-weight: 500; letter-spacing: 0.3em; text-transform: uppercase; text-decoration: none; transition: all 0.4s; }' +
        '.listing-reader-cta:hover { background: var(--teal-deep); letter-spacing: 0.4em; }' +
        /* Gallery thumbnail strip */
        '.listing-reader-strip { display: flex; gap: 8px; padding: 14px 1.5rem 4px; overflow-x: auto; scrollbar-width: thin; }' +
        '@media (min-width: 768px) { .listing-reader-strip { padding: 16px 3rem 6px; } }' +
        '.listing-reader-thumb { flex: 0 0 auto; width: 90px; height: 64px; background-size: cover; background-position: center; background-color: var(--paper-deep); border: 2px solid transparent; cursor: pointer; transition: all 0.25s; padding: 0; }' +
        '.listing-reader-thumb:hover { transform: translateY(-2px); border-color: var(--gold); }' +
        '.listing-reader-thumb.is-active { border-color: var(--teal); box-shadow: 0 0 0 1px var(--teal); }' +
        'body.modal-open { overflow: hidden; }'
      );
      document.head.appendChild(s);
    }
  }

  function listingDealLabel(deal) {
    return ({ sale: 'À VENDRE', rent: 'À LOUER' })[deal] || '';
  }
  function listingKindLabel(kind) {
    return ({ neuf: 'NEUF', occasion: 'OCCASION', projet: 'PROJET', commercial: 'LOCAL COMMERCIAL' })[kind] || '';
  }

  function listingReaderBody(l) {
    const tags = [];
    if (l.signature) tags.push('<span class="listing-reader-tag is-gold">★ ' + T('PIÈCE SIGNATURE') + '</span>');
    if (l.featured)  tags.push('<span class="listing-reader-tag is-gold">À LA UNE</span>');
    const d = listingDealLabel(l.deal); if (d) tags.push('<span class="listing-reader-tag">' + d + '</span>');
    const k = listingKindLabel(l.kind); if (k) tags.push('<span class="listing-reader-tag">' + k + '</span>');

    const stats = [];
    if (l.surface) stats.push(['SURFACE', escapeHtml(l.surface)]);
    if (l.rooms) stats.push(['PIÈCES', escapeHtml(l.rooms)]);
    if (l.neighborhood) stats.push(['QUARTIER', escapeHtml(l.neighborhood)]);
    if (l.floor_label) stats.push(['ÉTAGE', escapeHtml(l.floor_label)]);
    if (l.extra_label) stats.push(['DÉTAILS', escapeHtml(l.extra_label)]);

    const eq = [l.price_eur_eq, l.price_ils_eq].filter(Boolean).join(' · ');

    return (
      '<div class="listing-reader-meta">' + T('RÉF.') + ' ' + escapeHtml(l.ref || '') + ' · ' + escapeHtml(cityLabel(l.city)) + (l.neighborhood ? ' · ' + escapeHtml(l.neighborhood) : '') + '</div>' +
      '<h1 class="listing-reader-title">' + escapeHtml(l.title_main || '') + (l.title_accent ? ' <em>' + escapeHtml(l.title_accent) + '</em>' : '') + '</h1>' +
      (tags.length ? '<div class="listing-reader-tags">' + tags.join('') + '</div>' : '') +
      (l.description ? '<p class="listing-reader-desc">' + escapeHtmlMultiline(l.description) + '</p>' : '') +
      (stats.length ? '<div class="listing-reader-stats">' + stats.map(s => '<div class="listing-reader-stat"><span class="lbl">' + s[0] + '</span><span class="val">' + s[1] + '</span></div>').join('') + '</div>' : '') +
      '<div class="listing-reader-price-row">' +
        '<div>' +
          '<div class="listing-reader-meta" style="margin:0 0 0.3rem">Prix</div>' +
          '<div class="listing-reader-price">' + escapeHtml(priceLabel(l)) + '</div>' +
          (eq ? '<div class="listing-reader-price-eq">' + escapeHtml(eq) + '</div>' : '') +
        '</div>' +
        '<a href="contact.html?ref=' + encodeURIComponent(l.ref || '') + '" class="listing-reader-cta">Demander une visite →</a>' +
      '</div>'
    );
  }

  // Display the photo at `i` in galleryImages (wraps around) — slides the GPU track
  function showGalleryAt(i) {
    const m = document.getElementById('listingReader');
    if (!m || !galleryImages.length) return;
    const total = galleryImages.length;
    galleryIndex = ((i % total) + total) % total;   // safe wrap-around

    const track = m.querySelector('.listing-reader-track');
    track.style.transform = 'translate3d(' + (-galleryIndex * 100) + '%, 0, 0)';

    // Counter
    const counter = m.querySelector('.listing-reader-counter');
    counter.querySelector('.cur').textContent = galleryIndex + 1;
    counter.querySelector('.tot').textContent = total;
    counter.classList.toggle('is-hidden', total < 2);

    // Hide arrows if only one photo
    m.querySelector('.listing-reader-prev').classList.toggle('is-hidden', total < 2);
    m.querySelector('.listing-reader-next').classList.toggle('is-hidden', total < 2);

    // Active thumb — toggle highlight + smooth-scroll the strip so it stays in view
    m.querySelectorAll('.listing-reader-thumb').forEach(t => {
      const active = parseInt(t.dataset.i, 10) === galleryIndex;
      t.classList.toggle('is-active', active);
      if (active && typeof t.scrollIntoView === 'function') {
        t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });
  }

  function openListingReader(rawL) {
    lastReaderTrigger = document.activeElement;
    const l = localizedListing(rawL);
    buildListingReader();
    const m = document.getElementById('listingReader');
    // Build the full gallery: cover first, then any extra `images` (deduped)
    galleryImages = [];
    if (l.image) galleryImages.push(l.image);
    if (Array.isArray(l.images)) {
      l.images.forEach(p => { if (p && !galleryImages.includes(p)) galleryImages.push(p); });
    }

    // Thumbnail strip (only when 2+ photos)
    let stripHTML = '';
    if (galleryImages.length > 1) {
      stripHTML = '<div class="listing-reader-strip">' + galleryImages.map((p, i) =>
        '<button type="button" class="listing-reader-thumb" data-i="' + i + '" style="background-image:url(\'' + imageUrl(p).replace(/'/g, "\\'") + '\')" aria-label="Photo ' + (i + 1) + '"></button>'
      ).join('') + '</div>';
    }
    const body = m.querySelector('.listing-reader-body');
    body.innerHTML = stripHTML + listingReaderBody(l);

    // Thumb click → swap the cover
    body.querySelectorAll('.listing-reader-thumb').forEach(t => {
      t.addEventListener('click', () => showGalleryAt(parseInt(t.dataset.i, 10)));
    });

    // Swipe / drag THROUGH the thumbnail strip → the main photo follows the
    // finger thumb-by-thumb (not just on click). Uses pointer-capture so the
    // event keeps firing even if the user drifts off the strip.
    const strip = body.querySelector('.listing-reader-strip');
    if (strip) {
      let stripDragging = false;
      function thumbAtPoint(clientX, clientY) {
        const el = document.elementFromPoint(clientX, clientY);
        return el && el.closest ? el.closest('.listing-reader-thumb') : null;
      }
      strip.addEventListener('pointerdown', e => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        stripDragging = true;
        try { strip.setPointerCapture(e.pointerId); } catch (_) {}
      });
      strip.addEventListener('pointermove', e => {
        if (!stripDragging) return;
        const t = thumbAtPoint(e.clientX, e.clientY);
        if (t) {
          const idx = parseInt(t.dataset.i, 10);
          if (!Number.isNaN(idx) && idx !== galleryIndex) showGalleryAt(idx);
        }
      });
      function endStripDrag() { stripDragging = false; }
      strip.addEventListener('pointerup', endStripDrag);
      strip.addEventListener('pointercancel', endStripDrag);
      strip.addEventListener('pointerleave', endStripDrag);
    }

    // Build the slide track — one full-bleed image per slide, side by side
    const track = m.querySelector('.listing-reader-track');
    track.style.transition = 'none';      // suppress animation on initial layout
    track.innerHTML = galleryImages.map(p =>
      '<div class="listing-reader-slide" style="background-image:url(\'' + imageUrl(p).replace(/'/g, "\\'") + '\')"></div>'
    ).join('');
    // Force layout flush, then restore the spring so subsequent slides animate
    void track.offsetWidth;
    track.style.transition = '';

    galleryIndex = 0;
    track.style.transform = 'translate3d(0%, 0, 0)';
    const counter = m.querySelector('.listing-reader-counter');
    counter.querySelector('.cur').textContent = galleryImages.length ? 1 : 0;
    counter.querySelector('.tot').textContent = galleryImages.length;
    counter.classList.toggle('is-hidden', galleryImages.length < 2);
    m.querySelector('.listing-reader-prev').classList.toggle('is-hidden', galleryImages.length < 2);
    m.querySelector('.listing-reader-next').classList.toggle('is-hidden', galleryImages.length < 2);
    const firstThumb = body.querySelector('.listing-reader-thumb[data-i="0"]');
    if (firstThumb) firstThumb.classList.add('is-active');

    m.scrollTop = 0;
    m.hidden = false;
    document.body.classList.add('modal-open');
    requestAnimationFrame(() => { m.classList.add('is-visible'); try { m.focus(); } catch (_) {} try { if (window.SLI18n && window.SLI18n.refresh) window.SLI18n.refresh(); } catch (_) {} });
    const hashKey = l.slug || l.ref || l.id || '';
    history.pushState({ listingReader: true, key: hashKey }, '', '#listing-' + hashKey);
    isListingOpen = true;
  }

  function closeListingReader(fromPopstate) {
    const m = document.getElementById('listingReader');
    if (!m) return;
    m.classList.remove('is-visible');
    setTimeout(() => { m.hidden = true; }, 350);
    document.body.classList.remove('modal-open');
    isListingOpen = false;
    if (lastReaderTrigger && typeof lastReaderTrigger.focus === 'function') { try { lastReaderTrigger.focus(); } catch (_) {} }
    if (!fromPopstate && location.hash.startsWith('#listing-')) {
      suppressListingPop = true;
      history.back();
    } else if (!fromPopstate && location.hash) {
      history.replaceState(null, '', location.pathname + location.search);
    }
  }

  function findListing(key) {
    if (!key) return null;
    const c = CACHE || [];
    return c.find(x => x.id === key) || c.find(x => x.slug === key) || c.find(x => x.ref === key) || null;
  }

  function wireListingClicks() {
    document.addEventListener('click', e => {
      const card = e.target.closest('.estate, .featured-card');
      if (!card) return;
      // Don't intercept clicks on real links/buttons inside the card (heart, "Visiter →")
      if (e.target.closest('a[href], button')) return;
      // Prefer id (UUID, always unique) → fall back to slug → ref
      const key = card.dataset.id || card.dataset.slug || card.dataset.ref;
      const l = findListing(key);
      if (l) {
        e.preventDefault();
        openListingReader(l);
      }
    });

    // Deep-link: open from URL hash on first load
    if (location.hash.startsWith('#listing-')) {
      const key = location.hash.slice('#listing-'.length);
      setTimeout(() => {
        const l = findListing(key);
        if (l) openListingReader(l);
      }, 600);
    }
    // Re-open if hash changes later (e.g. clicking "Voir l'annonce →" link)
    window.addEventListener('hashchange', () => {
      if (!location.hash.startsWith('#listing-')) return;
      const key = location.hash.slice('#listing-'.length);
      const l = findListing(key);
      if (l) openListingReader(l);
    });
  }

  // ------------------------------------------------------------------
  // INIT
  // ------------------------------------------------------------------
  function init() {
    const portfolio = document.getElementById('listings-portfolio');
    if (portfolio) {
      FILTER = readFilterFromURL();
      load(true).then(() => {
        syncFormFromFilter();
        wireSearchForm();
        renderPortfolio();
      }).catch(e => {
        console.error(e);
        portfolio.innerHTML = '<div class="text-center py-20 text-[var(--muted)]">Impossible de charger le portefeuille.</div>';
      });
    }

    const featured = document.getElementById('listings-featured');
    if (featured) {
      const count = parseInt(featured.dataset.listingsCount || featured.dataset.count || '3', 10);
      renderFeatured(featured, count);
    }

    wireHeroSearch();
    wireListingClicks();

    // Re-render listings when the user switches site language so the
    // translated title/description show up immediately.
    document.addEventListener('sl-lang-changed', () => {
      if (document.getElementById('listings-portfolio')) renderPortfolio();
      const f = document.getElementById('listings-featured');
      if (f) {
        const count = parseInt(f.dataset.listingsCount || f.dataset.count || '3', 10);
        renderFeatured(f, count);
      }
    });

    // Add cursor:pointer hint to all listing cards so they look clickable
    if (!document.getElementById('listing-clickable-style')) {
      const s = document.createElement('style');
      s.id = 'listing-clickable-style';
      s.textContent = '.estate, .featured-card { cursor: pointer; transition: transform 0.4s; } .estate:hover, .featured-card:hover { transform: translateY(-2px); }';
      document.head.appendChild(s);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.SLListings = { load, renderFeatured, applyFilter };
})();
