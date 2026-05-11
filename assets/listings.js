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
    min_p: 0,              // min price in USD
    max_p: 0,              // max price in USD (0 = unlimited)
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
  function priceLabel(l) {
    if (l.price_display) return l.price_display;
    if (typeof l.price_usd === 'number' && l.price_usd > 0) {
      const m = l.price_usd / 1_000_000;
      return '$' + (m % 1 === 0 ? m.toFixed(1) : m.toFixed(2)) + 'M';
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
      'loft': 'Loft', 'maison': 'Maison'
    })[slug] || slug;
  }
  function parseFirstNumber(text) {
    if (!text) return 0;
    const m = String(text).match(/(\d+(?:[.,]\d+)?)/);
    return m ? parseFloat(m[1].replace(',', '.')) : 0;
  }
  function fmtUSD(n) {
    if (!n) return '';
    if (n >= 1_000_000) {
      const m = n / 1_000_000;
      return '$' + (m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)) + 'M';
    }
    return '$' + n.toLocaleString('en-US');
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
        '<article class="estate mb-16" data-city="', escapeHtml(l.city), '" data-type="', escapeHtml(l.type), '" data-kind="', escapeHtml(l.kind || ''), '" data-deal="', escapeHtml(l.deal || ''), '" data-ref="', escapeHtml(l.ref), '">',
        '  <div class="grid md:grid-cols-12 gap-10 items-center">',
        '    <div class="md:col-span-7 frame aspect-[16/10]">',
        '      <img src="', escapeHtml(img), '" class="w-full h-full object-cover" alt="', escapeHtml(l.title_main + ' ' + (l.title_accent || '')), '">',
        '      <div class="ref-tag">', escapeHtml(refTag), (l.signature ? ' · PIÈCE SIGNATURE' : ''), '</div>',
        dealTag, kindTag,
        heart,
        '    </div>',
        '    <div class="md:col-span-5">',
        '      <div class="label-teal">RÉF. ', escapeHtml(l.ref), ' · ', cityLabel(l.city), ' · ', escapeHtml(l.neighborhood || ''), '</div>',
        '      <h3 class="display mt-4" style="font-size: clamp(2.25rem, 4vw, 3.5rem); line-height: 0.95">',
        escapeHtml(l.title_main), ' <span class="display-i text-[var(--gold-deep)]">', escapeHtml(l.title_accent || ''), '</span>',
        '      </h3>',
        '      <p class="text-base text-[var(--ink-soft)] mt-5 leading-relaxed">', escapeHtml(l.description || ''), '</p>',
        '      <div class="grid grid-cols-3 gap-4 mt-6 border-t border-[var(--line)] pt-5">',
        '        <div><div class="label">SURFACE</div><div class="display text-xl mt-1.5">', escapeHtml(l.surface || ''), '</div></div>',
        '        <div><div class="label">PIÈCES</div><div class="display text-xl mt-1.5">', escapeHtml(l.rooms || ''), '</div></div>',
        '        <div><div class="label">RÉF</div><div class="display text-xl mt-1.5">', escapeHtml(l.ref), '</div></div>',
        '      </div>',
        '      <div class="mt-6 border-t border-[var(--line)] pt-5 flex items-end justify-between">',
        '        <div>',
        '          <div class="label">PRIX</div>',
        '          <div class="display text-3xl mt-1.5 text-[var(--teal)]">', escapeHtml(priceLabel(l)), '</div>',
        l.price_eur_eq || l.price_ils_eq ? '          <div class="mono text-xs text-[var(--muted)] mt-1">' + escapeHtml([l.price_eur_eq, l.price_ils_eq].filter(Boolean).join(' · ')) + '</div>' : '',
        '        </div>',
        '        <a href="contact.html" class="btn-line text-[var(--teal)]">Visiter →</a>',
        '      </div>',
        '    </div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    return [
      '<article class="estate" data-city="', escapeHtml(l.city), '" data-type="', escapeHtml(l.type), '" data-kind="', escapeHtml(l.kind || ''), '" data-deal="', escapeHtml(l.deal || ''), '" data-ref="', escapeHtml(l.ref), '">',
      '  <div class="frame aspect-[4/5] mb-5">',
      '    <img src="', escapeHtml(img), '" class="w-full h-full object-cover" alt="', escapeHtml(l.title_main + ' ' + (l.title_accent || '')), '">',
      '    <div class="ref-tag">', escapeHtml(refTag), '</div>',
      dealTag, kindTag,
      heart,
      '  </div>',
      '  <div>',
      '    <div class="label-teal">', cityLabel(l.city), ' · ', escapeHtml((l.neighborhood || '').toUpperCase()), '</div>',
      '    <h3 class="display text-2xl mt-3 leading-tight">', escapeHtml(l.title_main), ' <span class="display-i text-[var(--gold-deep)]">', escapeHtml(l.title_accent || ''), '</span></h3>',
      '    <p class="text-sm text-[var(--ink-soft)] mt-2">', escapeHtml(l.description || ''), '</p>',
      '    <div class="flex items-end justify-between mt-4 pt-3 border-t border-[var(--line)]">',
      '      <span class="label !tracking-[0.2em]">', escapeHtml(l.rooms || ''), l.extra_label ? ' · ' + escapeHtml(l.extra_label) : '', '</span>',
      '      <span class="display text-2xl text-[var(--teal)]">', escapeHtml(priceLabel(l)), '</span>',
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
    const pluralEl = document.getElementById('resultPlural');
    if (countEl) countEl.textContent = filtered.length;
    if (pluralEl) pluralEl.textContent = filtered.length > 1 ? 's' : '';

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
    if (big) html.push(cardHTML(big, { big: true }));
    if (others.length) {
      html.push('<div class="grid md:grid-cols-3 gap-x-6 gap-y-12">');
      others.forEach(l => html.push(cardHTML(l)));
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
  function renderFeatured(container, count) {
    return load().then(rows => {
      count = count || 3;
      let featured = rows.filter(l => l.featured === true);
      if (featured.length < count) {
        const extras = rows.filter(l => !l.featured).slice(0, count - featured.length);
        featured = featured.concat(extras);
      }
      featured = featured.slice(0, count);

      const html = featured.map(l => {
        const img = imageUrl(l.image);
        return [
          '<article class="estate">',
          '  <div class="frame aspect-[4/5] mb-5">',
          '    <img src="', escapeHtml(img), '" class="w-full h-full object-cover" alt="', escapeHtml(l.title_main + ' ' + (l.title_accent || '')), '">',
          '    <div class="ref-tag">', (l.signature ? '★ ' : ''), escapeHtml(l.ref || ''), '</div>',
          '  </div>',
          '  <div class="label-teal">', cityLabel(l.city), ' · ', escapeHtml((l.neighborhood || '').toUpperCase()), '</div>',
          '  <h3 class="display text-3xl mt-3 leading-tight">', escapeHtml(l.title_main), ' <span class="display-i text-[var(--gold-deep)]">', escapeHtml(l.title_accent || ''), '</span></h3>',
          '  <p class="text-sm text-[var(--ink-soft)] mt-2">', escapeHtml(l.description || ''), '</p>',
          '  <div class="flex items-end justify-between mt-4 pt-3 border-t border-[var(--line)]">',
          '    <span class="label !tracking-[0.2em]">', escapeHtml(l.rooms || ''), l.extra_label ? ' · ' + escapeHtml(l.extra_label) : '', '</span>',
          '    <span class="display text-2xl text-[var(--teal)]">', escapeHtml(priceLabel(l)), '</span>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('');

      container.innerHTML = html;
      if (window.SLI18n && typeof window.SLI18n.refresh === 'function') window.SLI18n.refresh();
    }).catch(e => console.error('[featured] failed:', e));
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
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.SLListings = { load, renderFeatured, applyFilter };
})();
