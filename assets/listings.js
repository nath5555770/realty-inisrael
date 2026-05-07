/* ==========================================================================
   SHAHAR LEVI REAL ESTATE — Listings renderer (Supabase backend)
   Reads from Supabase Postgres in real time. Anonymous (publishable) key.
   ========================================================================== */
(function () {
  'use strict';

  if (!window.SL_SUPABASE) {
    console.error('[listings] Supabase config missing');
    return;
  }
  const SB_URL = window.SL_SUPABASE.url;
  const SB_KEY = window.SL_SUPABASE.key;

  let CACHE = null;

  function load(force) {
    if (CACHE && !force) return Promise.resolve(CACHE);
    // PostgREST: select all visible listings, ordered by position then created_at
    const url = SB_URL + '/rest/v1/listings?select=*&visible=eq.true&off_market=eq.false&order=position.asc,created_at.asc';
    return fetch(url, {
      headers: {
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + SB_KEY,
        'Accept': 'application/json'
      }
    })
      .then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(rows => { CACHE = rows; return rows; });
  }

  function imageUrl(path) {
    if (!path) return '';
    // External (https://...) → keep as-is
    if (/^https?:\/\//i.test(path)) return path;
    // Path within the listing-images bucket → Supabase Storage public URL
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
      'tel-aviv': 'TEL AVIV',
      'herzliya': 'HERZLIYA',
      'caesarea': 'CAESAREA',
      'netanya': 'NETANYA',
      'jerusalem': 'JÉRUSALEM'
    })[slug] || (slug || '').toUpperCase();
  }

  function cardHTML(l, opts) {
    opts = opts || {};
    const big = opts.big;
    const refTag = (l.signature ? '★ ' : '') + (l.ref || '');
    const heart = '<button class="like-btn"><svg width="' + (big ? 18 : 16) + '" height="' + (big ? 18 : 16) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>';
    const img = imageUrl(l.image);

    if (big) {
      return [
        '<article class="estate mb-16" data-city="', escapeHtml(l.city), '" data-type="', escapeHtml(l.type), '" data-ref="', escapeHtml(l.ref), '">',
        '  <div class="grid md:grid-cols-12 gap-10 items-center">',
        '    <div class="md:col-span-7 frame aspect-[16/10]">',
        '      <img src="', escapeHtml(img), '" class="w-full h-full object-cover" alt="', escapeHtml(l.title_main + ' ' + (l.title_accent || '')), '">',
        '      <div class="ref-tag">', escapeHtml(refTag), (l.signature ? ' · PIÈCE SIGNATURE' : ''), '</div>',
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
      '<article class="estate" data-city="', escapeHtml(l.city), '" data-type="', escapeHtml(l.type), '" data-ref="', escapeHtml(l.ref), '">',
      '  <div class="frame aspect-[4/5] mb-5">',
      '    <img src="', escapeHtml(img), '" class="w-full h-full object-cover" alt="', escapeHtml(l.title_main + ' ' + (l.title_accent || '')), '">',
      '    <div class="ref-tag">', escapeHtml(refTag), '</div>',
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

  // ---- PORTFOLIO PAGE ------------------------------------------------------
  function renderPortfolio(container) {
    return load(true).then(rows => {
      if (!rows.length) {
        container.innerHTML = '<div class="text-center py-20 text-[var(--muted)] cinzel text-xs tracking-[0.3em]">Aucune annonce pour le moment.</div>';
        return;
      }
      const big = rows.find(l => l.signature) || rows[0];
      const others = rows.filter(l => l !== big);

      const html = [];
      if (big) html.push(cardHTML(big, { big: true }));
      html.push('<div class="grid md:grid-cols-3 gap-x-6 gap-y-12">');
      others.forEach(l => html.push(cardHTML(l)));
      html.push('</div>');

      container.innerHTML = html.join('');

      // Update counters in the page header
      const totalEl = document.querySelector('[data-stat="total"]');
      if (totalEl) totalEl.textContent = rows.length;

      updateFilterCounts(rows);
      wireFilters(container);
    }).catch(e => {
      console.error('[portfolio] failed:', e);
      container.innerHTML = '<div class="text-center py-20 text-[var(--muted)]">Impossible de charger le portefeuille.</div>';
    });
  }

  function updateFilterCounts(items) {
    const counts = {};
    items.forEach(l => {
      counts[l.city] = (counts[l.city] || 0) + 1;
      counts[l.type] = (counts[l.type] || 0) + 1;
    });
    document.querySelectorAll('.filter-pill').forEach(btn => {
      const t = btn.textContent.trim().toLowerCase();
      let key = null;
      if (t.startsWith('tous')) {
        btn.textContent = 'Tous · ' + items.length;
        return;
      }
      if (t.startsWith('tel aviv')) key = 'tel-aviv';
      else if (t.startsWith('herzliya')) key = 'herzliya';
      else if (t.startsWith('caesarea')) key = 'caesarea';
      else if (t.startsWith('netanya')) key = 'netanya';
      else if (t.startsWith('jérusalem') || t.startsWith('jerusalem')) key = 'jerusalem';
      else if (t.startsWith('penthouse')) key = 'penthouse';
      else if (t.startsWith('villa')) key = 'villa';
      else if (t.startsWith('appartement')) key = 'appartement';
      if (key) {
        const labelMap = {
          'tel-aviv': 'Tel Aviv', 'herzliya': 'Herzliya', 'caesarea': 'Caesarea',
          'netanya': 'Netanya', 'jerusalem': 'Jérusalem',
          'penthouse': 'Penthouse', 'villa': 'Villa', 'appartement': 'Appartement'
        };
        btn.textContent = labelMap[key] + ' · ' + (counts[key] || 0);
      }
    });
  }

  function wireFilters(container) {
    const filterBtns = document.querySelectorAll('.filter-pill');
    if (!filterBtns.length) return;
    filterBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        const text = this.textContent.toLowerCase();
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        let filterCity = null, filterType = null;
        if (text.includes('tel aviv')) filterCity = 'tel-aviv';
        else if (text.includes('herzliya')) filterCity = 'herzliya';
        else if (text.includes('caesarea')) filterCity = 'caesarea';
        else if (text.includes('netanya')) filterCity = 'netanya';
        else if (text.includes('jerusalem') || text.includes('jérusalem')) filterCity = 'jerusalem';
        else if (text.startsWith('penthouse')) filterType = 'penthouse';
        else if (text.startsWith('villa')) filterType = 'villa';
        else if (text.startsWith('appartement')) filterType = 'appartement';

        const estates = container.querySelectorAll('article.estate');
        estates.forEach(el => {
          const matchCity = !filterCity || el.dataset.city === filterCity;
          const matchType = !filterType || el.dataset.type === filterType;
          el.style.transition = 'opacity 0.4s, transform 0.4s';
          if (matchCity && matchType) {
            el.style.display = '';
            requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'scale(1)'; });
          } else {
            el.style.opacity = '0';
            el.style.transform = 'scale(0.95)';
            setTimeout(() => { el.style.display = 'none'; }, 400);
          }
        });
      });
    });
  }

  // ---- HOMEPAGE FEATURED ---------------------------------------------------
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
    }).catch(e => console.error('[featured] failed:', e));
  }

  // ---- AUTO-INIT -----------------------------------------------------------
  function init() {
    const portfolio = document.getElementById('listings-portfolio');
    if (portfolio) renderPortfolio(portfolio);

    const featured = document.getElementById('listings-featured');
    if (featured) {
      const count = parseInt(featured.dataset.count || '3', 10);
      renderFeatured(featured, count);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.SLListings = { load, renderPortfolio, renderFeatured, imageUrl };
})();
