/* ==========================================================================
   SHAHAR LEVI · Journal renderer (Supabase backend)

   Reads journal_articles from Supabase and renders the public Journal page
   as a magazine-style layout. Articles open in an immersive overlay that
   plays nicely with the browser's Back button.

   ARCHITECTURE
     load()              → fetch published articles
     featuredHTML(a)     → hero "À la une" card (large editorial)
     duoHTML(a)          → tall card used in the 2-up row right after the hero
     cardHTML(a)         → regular grid card
     buildReader() / openReader() / closeReader()
                         → article overlay with history.pushState support
                           so the device Back button closes it correctly

   Layout (default):
     ┌──────────────────────────────────┐
     │            FEATURED              │
     ├──────────────┬───────────────────┤
     │   DUO L      │   DUO R           │
     ├────────┬─────┴─────┬─────────────┤
     │  CARD  │   CARD    │   CARD      │
     │  CARD  │   CARD    │   CARD      │
     └────────┴───────────┴─────────────┘
   ========================================================================== */
(function () {
  'use strict';
  if (!window.SL_SUPABASE) return;

  const SB_URL = window.SL_SUPABASE.url;
  const SB_KEY = window.SL_SUPABASE.key;
  const BUCKET = 'article-images';

  // ---------- Utils ----------
  function imageUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    return SB_URL + '/storage/v1/object/public/' + BUCKET + '/' + path.replace(/^\/+/, '');
  }
  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function fmtDate(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      let lang = 'fr';
      try { lang = localStorage.getItem('sl-lang') || 'fr'; } catch (_) {}
      const locale = { fr: 'fr-FR', en: 'en-US', he: 'he-IL', ru: 'ru-RU' }[lang] || 'fr-FR';
      return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase();
    } catch (_) { return ''; }
  }
  function categoryLabel(cat) {
    return ({ 'marche': 'MARCHÉ', 'aliyah': 'ALIYAH', 'patrimoine': 'PATRIMOINE', 'decryptage': 'DÉCRYPTAGE', 'notarial': 'NOTARIAL', 'quartiers': 'QUARTIERS', 'fiscalite': 'FISCALITÉ', 'reportage': 'REPORTAGE' })[cat] || (cat || '').toUpperCase();
  }

  // ---------- Data ----------
  function load() {
    const url = SB_URL + '/rest/v1/journal_articles?select=*&published=eq.true&order=publish_date.desc.nullslast,created_at.desc';
    return fetch(url, {
      headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Accept': 'application/json' }
    }).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }

  // ---------- Card renderers ----------
  function featuredHTML(a) {
    const img = imageUrl(a.cover_image);
    return (
      '<article class="article-card jc-featured" data-reveal>' +
      '  <div class="grid md:grid-cols-12 gap-0 items-stretch">' +
      '    <div class="md:col-span-7 img-wrap aspect-[16/10] md:aspect-auto relative">' +
      '      <img src="' + escapeHtml(img) + '" class="w-full h-full object-cover" alt="' + escapeHtml(a.title || '') + '" loading="eager">' +
      '      <div class="jc-featured-ribbon">★ À LA UNE</div>' +
      '    </div>' +
      '    <div class="md:col-span-5 p-8 md:p-14 flex flex-col justify-center bg-[var(--paper)]">' +
      '      <div class="topic-pill self-start">' + categoryLabel(a.category) + (a.read_minutes ? ' · ' + a.read_minutes + ' MIN' : '') + '</div>' +
      '      <h2 class="display mt-6 leading-[0.95]" style="font-size: clamp(2rem, 4vw, 3.5rem)">' + escapeHtml(a.title || '') + '</h2>' +
      (a.subtitle ? '      <p class="display-i text-[var(--gold-deep)] text-xl mt-3">' + escapeHtml(a.subtitle) + '</p>' : '') +
      (a.excerpt ? '      <p class="text-base text-[var(--ink-soft)] mt-5 leading-relaxed">' + escapeHtml(a.excerpt) + '</p>' : '') +
      '      <div class="flex items-center gap-3 mt-6 text-sm text-[var(--muted)]">' +
      '        <span class="cinzel text-[10px] tracking-[0.3em]">PUBLIÉ LE ' + fmtDate(a.publish_date) + '</span>' +
      '      </div>' +
      '      <a href="#article-' + escapeHtml(a.slug) + '" class="btn-teal mt-8 self-start" data-article="' + escapeHtml(a.slug) + '">Lire l\'article →</a>' +
      '    </div>' +
      '  </div>' +
      '</article>'
    );
  }

  function duoHTML(a) {
    const img = imageUrl(a.cover_image);
    return (
      '<article class="article-card jc-duo" data-reveal>' +
      '  <a href="#article-' + escapeHtml(a.slug) + '" data-article="' + escapeHtml(a.slug) + '" class="block">' +
      '    <div class="img-wrap aspect-[3/2] relative">' +
      '      <img src="' + escapeHtml(img) + '" class="w-full h-full object-cover" alt="' + escapeHtml(a.title || '') + '" loading="lazy">' +
      '      <div class="jc-duo-overlay"></div>' +
      '      <div class="jc-duo-meta">' +
      '        <span class="topic-pill" style="background: rgba(244,237,224,0.92); color: var(--gold-deep)">' + categoryLabel(a.category) + (a.read_minutes ? ' · ' + a.read_minutes + ' MIN' : '') + '</span>' +
      '      </div>' +
      '    </div>' +
      '    <div class="p-8 md:p-10">' +
      '      <h3 class="display leading-[1.05]" style="font-size: clamp(1.5rem, 2.4vw, 2.1rem)">' + escapeHtml(a.title || '') + '</h3>' +
      (a.excerpt ? '      <p class="text-sm md:text-base mt-4 leading-relaxed text-[var(--ink-soft)]">' + escapeHtml(a.excerpt) + '</p>' : '') +
      '      <div class="flex items-center justify-between mt-6 pt-5 border-t border-[var(--line)]">' +
      '        <span class="cinzel text-[10px] tracking-[0.3em] text-[var(--muted)]">' + fmtDate(a.publish_date) + '</span>' +
      '        <span class="cinzel text-[11px] tracking-[0.3em] text-[var(--gold-deep)]">LIRE →</span>' +
      '      </div>' +
      '    </div>' +
      '  </a>' +
      '</article>'
    );
  }

  function cardHTML(a) {
    const img = imageUrl(a.cover_image);
    return (
      '<article class="article-card jc-card" data-reveal>' +
      '  <a href="#article-' + escapeHtml(a.slug) + '" data-article="' + escapeHtml(a.slug) + '" class="block">' +
      '    <div class="img-wrap aspect-[16/10]"><img src="' + escapeHtml(img) + '" class="w-full h-full object-cover" alt="' + escapeHtml(a.title || '') + '" loading="lazy"></div>' +
      '    <div class="p-7">' +
      '      <div class="topic-pill">' + categoryLabel(a.category) + (a.read_minutes ? ' · ' + a.read_minutes + ' MIN' : '') + '</div>' +
      '      <h3 class="display text-2xl mt-4 leading-tight">' + escapeHtml(a.title || '') + '</h3>' +
      (a.excerpt ? '      <p class="text-sm mt-3 leading-relaxed text-[var(--ink-soft)]">' + escapeHtml(a.excerpt) + '</p>' : '') +
      '      <div class="flex items-center justify-between mt-5 pt-4 border-t border-[var(--line)]">' +
      '        <span class="cinzel text-[10px] tracking-[0.3em] text-[var(--muted)]">' + fmtDate(a.publish_date) + '</span>' +
      '        <span class="cinzel text-[11px] tracking-[0.3em] text-[var(--gold-deep)]">LIRE →</span>' +
      '      </div>' +
      '    </div>' +
      '  </a>' +
      '</article>'
    );
  }

  // ---------- Reader overlay (with proper history support) ----------
  let isReaderOpen = false;
  let lastReaderTrigger = null;
  let suppressNextPopstate = false;

  function buildReader() {
    if (document.getElementById('articleReader')) return;
    const m = document.createElement('div');
    m.id = 'articleReader';
    m.className = 'article-reader'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'Article du journal'); m.setAttribute('tabindex', '-1');
    m.hidden = true;
    m.innerHTML =
      '<div class="article-reader-overlay" data-close></div>' +
      '<article class="article-reader-box">' +
        '<div class="article-reader-progress"><div class="article-reader-progress-bar"></div></div>' +
        '<button class="article-reader-back" data-close type="button" aria-label="Retour">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>' +
          '<span>Retour</span>' +
        '</button>' +
        '<button class="article-reader-close" data-close type="button" aria-label="Fermer">×</button>' +
        '<div class="article-reader-cover"></div>' +
        '<div class="article-reader-body">' +
          '<div class="article-reader-meta"></div>' +
          '<h2 class="article-reader-title"></h2>' +
          '<div class="article-reader-subtitle"></div>' +
          '<div class="article-reader-rule"><span></span></div>' +
          '<div class="article-reader-content"></div>' +
          '<div class="article-reader-foot">' +
            '<span class="cinzel text-[10px] tracking-[0.4em] text-[var(--gold-deep)]">— FIN</span>' +
          '</div>' +
        '</div>' +
      '</article>';
    document.body.appendChild(m);

    // Scroll-driven progress bar
    const bar = m.querySelector('.article-reader-progress-bar');
    m.addEventListener('scroll', () => {
      const box = m.querySelector('.article-reader-box');
      if (!box || !bar) return;
      const total = box.scrollHeight - m.clientHeight;
      const pct = total > 0 ? Math.max(0, Math.min(100, (m.scrollTop / total) * 100)) : 0;
      bar.style.width = pct + '%';
    }, { passive: true });

    // Click anywhere with data-close attribute → close
    m.addEventListener('click', e => {
      const target = e.target.closest('[data-close]');
      if (target) {
        e.preventDefault();
        closeReader();
      }
    });

    // ESC closes
    m.addEventListener('keydown', e => {
      if (e.key !== 'Tab' || m.hidden) return;
      const f = [...m.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(el => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isReaderOpen) closeReader();
    });

    // Browser Back button closes reader instead of leaving the page
    window.addEventListener('popstate', () => {
      if (suppressNextPopstate) { suppressNextPopstate = false; return; }
      if (isReaderOpen) closeReader(true);
    });

    // Inject magazine reader styles
    if (!document.getElementById('articleReaderStyle')) {
      const s = document.createElement('style');
      s.id = 'articleReaderStyle';
      s.textContent = (
        '.article-reader { position: fixed; inset: 0; z-index: 200; display: flex; align-items: flex-start; justify-content: center; overflow-y: auto; padding: 0; opacity: 0; transition: opacity 0.35s ease-out; }' +
        '.article-reader.is-visible { opacity: 1; }' +
        '.article-reader[hidden] { display: none; }' +
        '.article-reader-overlay { position: fixed; inset: 0; background: rgba(14,39,34,0.92); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }' +
        '.article-reader-box { position: relative; background: var(--paper); max-width: 920px; width: 100%; margin: 0; min-height: 100vh; box-shadow: 0 0 80px rgba(0,0,0,0.55); transform: translateY(20px); transition: transform 0.5s cubic-bezier(0.2,0.85,0.2,1); }' +
        '.article-reader.is-visible .article-reader-box { transform: translateY(0); }' +
        '.article-reader-back { position: fixed; top: 18px; left: 18px; z-index: 4; display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px 10px 14px; border: 1px solid var(--gold); background: var(--paper); color: var(--teal); font-family: \'Cinzel\', serif; font-size: 11px; font-weight: 500; letter-spacing: 0.3em; text-transform: uppercase; cursor: pointer; transition: all 0.4s; border-radius: 999px; }' +
        '.article-reader-back:hover { background: var(--teal); color: var(--gold); border-color: var(--teal); letter-spacing: 0.4em; }' +
        '.article-reader-back svg { stroke: currentColor; flex-shrink: 0; }' +
        '.article-reader-close { position: fixed; top: 18px; right: 18px; z-index: 4; width: 42px; height: 42px; border: 1px solid var(--gold); background: var(--paper); border-radius: 50%; cursor: pointer; font-size: 24px; line-height: 1; color: var(--teal); transition: all 0.3s; }' +
        '.article-reader-close:hover { background: var(--teal); color: var(--gold); border-color: var(--teal); transform: rotate(90deg); }' +
        '.article-reader-cover { aspect-ratio: 16/9; background-size: cover; background-position: center; background-color: var(--paper-deep); position: relative; }' +
        '.article-reader-cover::after { content: \'\'; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(14,39,34,0) 60%, rgba(244,237,224,1) 100%); pointer-events: none; }' +
        '.article-reader-body { padding: 1.5rem 1.5rem 5rem; max-width: 720px; margin: 0 auto; position: relative; z-index: 1; }' +
        '@media (min-width: 768px) { .article-reader-body { padding: 2rem 3rem 6rem; } .article-reader-cover { aspect-ratio: 16/8.5; } }' +
        '.article-reader-meta { font-family: \'Cinzel\', serif; font-size: 10px; letter-spacing: 0.45em; text-transform: uppercase; color: var(--gold-deep); margin-bottom: 1.25rem; }' +
        '.article-reader-title { font-family: \'Playfair Display\', serif; font-weight: 400; line-height: 1.05; font-size: clamp(2rem, 5vw, 3.4rem); color: var(--teal); margin: 0 0 0.6rem; letter-spacing: -0.01em; }' +
        '.article-reader-subtitle { font-family: \'Playfair Display\', serif; font-style: italic; color: var(--gold-deep); font-size: clamp(1.05rem, 1.8vw, 1.4rem); margin-bottom: 0; line-height: 1.4; }' +
        '.article-reader-subtitle:empty { display: none; }' +
        '.article-reader-rule { display: flex; align-items: center; gap: 14px; margin: 2.4rem 0 2rem; }' +
        '.article-reader-rule::before, .article-reader-rule::after { content: \'\'; flex: 1; height: 1px; background: var(--line-gold); }' +
        '.article-reader-rule span { width: 5px; height: 5px; border-radius: 50%; background: var(--gold); display: inline-block; }' +
        '.article-reader-content { font-family: \'Plus Jakarta Sans\', sans-serif; font-size: 17px; line-height: 1.78; color: var(--ink-soft); }' +
        '.article-reader-content p { margin: 0 0 1.25em; }' +
        '.article-reader-content p:first-of-type::first-letter { font-family: \'Playfair Display\', serif; font-weight: 500; float: left; font-size: 4.2em; line-height: 0.85; margin: 0.08em 0.14em 0 0; color: var(--gold-deep); }' +
        '.article-reader-content h2, .article-reader-content h3 { font-family: \'Playfair Display\', serif; font-weight: 400; color: var(--teal); margin: 2em 0 0.5em; line-height: 1.2; letter-spacing: -0.005em; }' +
        '.article-reader-content h2 { font-size: 1.6em; }' +
        '.article-reader-content h3 { font-size: 1.25em; }' +
        '.article-reader-content em, .article-reader-content i { color: var(--gold-deep); font-style: italic; }' +
        '.article-reader-content strong { color: var(--ink); font-weight: 600; }' +
        '.article-reader-content blockquote { border-left: 3px solid var(--gold); padding: 0.4em 0 0.4em 1.4rem; margin: 2em 0; font-family: \'Playfair Display\', serif; font-style: italic; font-size: 1.25em; color: var(--teal); line-height: 1.5; }' +
        '.article-reader-content a { color: var(--gold-deep); text-decoration: underline; text-underline-offset: 4px; }' +
        '.article-reader-content a:hover { color: var(--teal); }' +
        '.article-reader-content img { max-width: 100%; height: auto; margin: 1.5em 0; display: block; }' +
        '.article-reader-content ul, .article-reader-content ol { margin: 1em 0 1.25em 1.4em; }' +
        '.article-reader-content li { margin: 0.4em 0; }' +
        '.article-reader-foot { margin-top: 3.5rem; padding-top: 1.5rem; border-top: 1px solid var(--line-gold); text-align: center; }' +
        /* Reading progress bar */
        '.article-reader-progress { position: fixed; top: 0; left: 0; right: 0; height: 3px; background: rgba(196,168,119,0.18); z-index: 5; }' +
        '.article-reader-progress-bar { height: 100%; width: 0; background: linear-gradient(90deg, var(--gold), var(--gold-deep)); transition: width 0.12s linear; }' +
        'body.modal-open { overflow: hidden; }' +
        /* Skeleton loading state */
        '.jc-skeleton { background: var(--surface); border: 1px solid var(--line); overflow: hidden; }' +
        '.jc-skeleton-img { aspect-ratio: 16/10; background: linear-gradient(110deg, var(--paper-deep) 25%, var(--paper-light) 50%, var(--paper-deep) 75%); background-size: 200% 100%; animation: skel-shimmer 1.6s infinite; }' +
        '.jc-skeleton-body { padding: 1.5rem; }' +
        '.jc-skeleton-bar { height: 14px; background: linear-gradient(110deg, var(--paper-deep) 25%, var(--paper-light) 50%, var(--paper-deep) 75%); background-size: 200% 100%; animation: skel-shimmer 1.6s infinite; margin-bottom: 12px; }' +
        '.jc-skeleton-bar.short { width: 30%; }' +
        '.jc-skeleton-bar.tall { height: 24px; }' +
        '@keyframes skel-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }' +
        /* Featured ribbon + duo overlay (used in layout) */
        '.jc-featured { position: relative; overflow: hidden; }' +
        '.jc-featured-ribbon { position: absolute; top: 18px; left: 18px; background: var(--gold); color: var(--teal); padding: 8px 14px; font-family: \'Cinzel\', serif; font-size: 10px; letter-spacing: 0.35em; font-weight: 500; z-index: 2; }' +
        '.jc-duo { background: var(--surface); }' +
        '.jc-duo .img-wrap { position: relative; }' +
        '.jc-duo-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 0%, rgba(14,39,34,0.2) 100%); pointer-events: none; }' +
        '.jc-duo-meta { position: absolute; left: 18px; bottom: 18px; z-index: 1; }' +
        /* Reveal animation */
        '[data-reveal] { opacity: 0; transform: translateY(20px); transition: opacity 0.7s ease-out, transform 0.7s cubic-bezier(0.2,0.85,0.2,1); }' +
        '[data-reveal].is-revealed { opacity: 1; transform: translateY(0); }'
      );
      document.head.appendChild(s);
    }
  }

  function openReader(a, fromHash) {
    lastReaderTrigger = document.activeElement;
    buildReader();
    const m = document.getElementById('articleReader');
    m.querySelector('.article-reader-cover').style.backgroundImage = a.cover_image ? "url('" + imageUrl(a.cover_image).replace(/'/g, "\\'") + "')" : '';
    m.querySelector('.article-reader-meta').textContent = (a.read_minutes ? a.read_minutes + ' min · ' : '') + categoryLabel(a.category) + ' · publié le ' + fmtDate(a.publish_date);
    m.querySelector('.article-reader-title').textContent = a.title || '';
    m.querySelector('.article-reader-subtitle').textContent = a.subtitle || '';

    // Content allows simple HTML; we strip <script> as defense in depth.
    let html = (a.content || '').replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '');
    if (!/<p|<h\d|<ul|<ol|<blockquote/i.test(html)) {
      html = html.split(/\n\n+/).map(p => '<p>' + escapeHtml(p).replace(/\n/g, '<br>') + '</p>').join('');
    }
    m.querySelector('.article-reader-content').innerHTML = html || '<p><em>Article en préparation.</em></p>';

    // Scroll the article body to top each time
    m.scrollTop = 0;
    m.hidden = false;
    document.body.classList.add('modal-open');
    requestAnimationFrame(() => { m.classList.add('is-visible'); try { m.focus(); } catch (_) {} });

    // Push a history entry so Back closes the reader
    if (!fromHash) {
      history.pushState({ articleReader: true, slug: a.slug }, '', '#article-' + (a.slug || ''));
    }
    isReaderOpen = true;
  }

  function closeReader(fromPopstate) {
    const m = document.getElementById('articleReader');
    if (!m) return;
    m.classList.remove('is-visible');
    setTimeout(() => { m.hidden = true; }, 350);
    document.body.classList.remove('modal-open');
    isReaderOpen = false;
    if (lastReaderTrigger && typeof lastReaderTrigger.focus === 'function') { try { lastReaderTrigger.focus(); } catch (_) {} }

    // If we were closed by the user (X, overlay, ESC), pop the history entry we pushed
    if (!fromPopstate && location.hash.startsWith('#article-')) {
      suppressNextPopstate = true;
      history.back();
    } else if (!fromPopstate) {
      // No article hash to clear, just strip the # if there is one
      if (location.hash) {
        history.replaceState(null, '', location.pathname + location.search);
      }
    }
  }

  // ---------- Reveal-on-scroll ----------
  function setupReveal() {
    const els = document.querySelectorAll('[data-reveal]:not(.is-revealed)');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('is-revealed'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('is-revealed');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.05 });
    els.forEach(el => io.observe(el));
  }

  // ---------- Layout selection from CMS settings ----------
  function currentLayout() {
    if (window.SLCMS && window.SLCMS.settings) {
      return window.SLCMS.settings['journal.layout'] || 'magazine';
    }
    return 'magazine';
  }
  function cardsPerRow() {
    if (window.SLCMS && window.SLCMS.settings) {
      return window.SLCMS.settings['journal.cards_per_row'] || 3;
    }
    return 3;
  }
  function showDuo() {
    if (window.SLCMS && window.SLCMS.settings) {
      return window.SLCMS.settings['journal.show_duo'] !== false;
    }
    return true;
  }

  function renderLayout(rows) {
    const featured = document.getElementById('journal-featured');
    const grid = document.getElementById('journal-grid');
    const duoMount = document.getElementById('journal-duo');
    if (!rows.length) return;

    const layout = currentLayout();
    const perRow = Math.max(2, Math.min(4, cardsPerRow()));

    // Tune grid class based on cards_per_row
    if (grid) {
      grid.className = 'grid gap-6 md:gap-8 ' + (
        perRow === 2 ? 'md:grid-cols-2' :
        perRow === 4 ? 'md:grid-cols-2 lg:grid-cols-4' :
        'md:grid-cols-3'
      );
    }

    // Apply placement-based partitioning. If a row has no `placement`
    // column (legacy data before the migration), treat it as 'grid'.
    function placementOf(a) { return a.placement || 'grid'; }

    const visibleRows = rows.filter(a => placementOf(a) !== 'hidden');

    // Sort within each bucket: higher display_order first, then newest first
    function bySortOrder(a, b) {
      const oa = a.display_order || 0, ob = b.display_order || 0;
      if (oa !== ob) return ob - oa;
      const da = new Date(a.publish_date || a.created_at || 0).getTime();
      const db = new Date(b.publish_date || b.created_at || 0).getTime();
      return db - da;
    }

    const explicitFeatured = visibleRows.filter(a => placementOf(a) === 'featured').sort(bySortOrder);
    const explicitDuo      = visibleRows.filter(a => placementOf(a) === 'duo').sort(bySortOrder).slice(0, 2);
    const explicitGrid     = visibleRows.filter(a => placementOf(a) === 'grid').sort(bySortOrder);
    const others           = visibleRows.filter(a => !['featured','duo'].includes(placementOf(a)) || a.placement === undefined).sort(bySortOrder);

    if (layout === 'minimal') {
      // No featured, no duo — straight grid of all visible (sorted)
      if (featured) featured.innerHTML = '';
      if (duoMount) duoMount.innerHTML = '';
      const all = visibleRows.slice().sort(bySortOrder);
      if (grid) grid.innerHTML = all.map(cardHTML).join('');
    } else if (layout === 'classic') {
      // Featured + grid (no duo). Pick explicit featured first, otherwise most recent.
      const top = explicitFeatured[0] || others[0];
      const rest = visibleRows.filter(a => a !== top).sort(bySortOrder);
      if (featured) featured.innerHTML = top ? featuredHTML(top) : '';
      if (duoMount) duoMount.innerHTML = '';
      if (grid) grid.innerHTML = rest.map(cardHTML).join('');
    } else {
      // 'magazine' default: featured + (duo if enabled) + grid
      const useDuo = showDuo();
      const top = explicitFeatured[0] || (others[0] && placementOf(others[0]) === 'grid' ? others[0] : null) || others[0];

      let duoList = useDuo ? explicitDuo.slice() : [];
      // Backfill duo with most recent grid items if explicit duo is short
      if (useDuo && duoList.length < 2) {
        const need = 2 - duoList.length;
        const fill = explicitGrid.filter(a => a !== top).slice(0, need);
        duoList = duoList.concat(fill);
      }

      const used = new Set([top].concat(duoList).filter(Boolean).map(a => a.id || a.slug));
      const gridList = visibleRows.filter(a => !used.has(a.id || a.slug)).sort(bySortOrder);

      if (featured) featured.innerHTML = top ? featuredHTML(top) : '';
      if (duoMount) duoMount.innerHTML = duoList.length ? duoList.map(duoHTML).join('') : '';
      if (grid) grid.innerHTML = gridList.map(cardHTML).join('');
    }
  }

  // ---------- Skeleton placeholders ----------
  function skeletonCard() {
    return '<div class="jc-skeleton"><div class="jc-skeleton-img"></div><div class="jc-skeleton-body"><div class="jc-skeleton-bar short"></div><div class="jc-skeleton-bar tall"></div><div class="jc-skeleton-bar"></div><div class="jc-skeleton-bar short"></div></div></div>';
  }
  function skeletonFeatured() {
    return (
      '<div class="jc-skeleton">' +
        '<div class="grid md:grid-cols-12 gap-0 items-stretch">' +
          '<div class="md:col-span-7 jc-skeleton-img"></div>' +
          '<div class="md:col-span-5 p-8 md:p-14">' +
            '<div class="jc-skeleton-bar short"></div>' +
            '<div class="jc-skeleton-bar tall" style="height: 36px"></div>' +
            '<div class="jc-skeleton-bar tall" style="height: 36px; width: 70%"></div>' +
            '<div class="jc-skeleton-bar" style="margin-top: 1.4rem"></div>' +
            '<div class="jc-skeleton-bar"></div>' +
            '<div class="jc-skeleton-bar short"></div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  // ---------- Init ----------
  function init() {
    const featured = document.getElementById('journal-featured');
    const grid = document.getElementById('journal-grid');
    const duoMount = document.getElementById('journal-duo');
    if (!featured && !grid) return;

    // Inject base reader styles immediately so the skeleton CSS rules exist
    buildReader();

    // Show skeleton placeholders while we fetch
    if (featured) featured.innerHTML = skeletonFeatured();
    if (duoMount) duoMount.innerHTML = skeletonCard() + skeletonCard();
    if (grid) grid.innerHTML = skeletonCard() + skeletonCard() + skeletonCard() + skeletonCard() + skeletonCard() + skeletonCard();

    // Wait for CMS settings to load before rendering (1s timeout fallback)
    function start() {
      load().then(rows => {
        if (!rows.length) {
          if (featured) featured.innerHTML = '<div class="text-center py-20 text-[var(--muted)] cinzel text-xs tracking-[0.3em]">Aucun article publié pour le moment.</div>';
          if (grid) grid.innerHTML = '';
          if (duoMount) duoMount.innerHTML = '';
          if (window.SLI18n && typeof window.SLI18n.refresh === 'function') window.SLI18n.refresh();
          return;
        }
        renderLayout(rows);
        wireAndReveal(rows);
      }).catch(e => {
        console.error('[journal]', e);
        if (featured) featured.innerHTML = '<div class="text-center py-20 text-[var(--muted)]">Impossible de charger les articles.</div>';
        if (window.SLI18n && typeof window.SLI18n.refresh === 'function') window.SLI18n.refresh();
      });
    }

    if (window.SLCMS && window.SLCMS.ready) start();
    else {
      let started = false;
      document.addEventListener('sl-cms-ready', () => { if (!started) { started = true; start(); } }, { once: true });
      setTimeout(() => { if (!started) { started = true; start(); } }, 1500);
    }
    return;
  }

  function wireAndReveal(rows) {
    const ctaWrap = document.getElementById('journal-cta-wrap');
    if (ctaWrap) ctaWrap.hidden = false;

    if (window.SLI18n && typeof window.SLI18n.refresh === 'function') window.SLI18n.refresh();
    if (window.SLCMS && typeof window.SLCMS.reapply === 'function') window.SLCMS.reapply();

    // Wire all "Lire" / card links
    const bySlug = Object.fromEntries(rows.map(a => [a.slug, a]));
    document.querySelectorAll('[data-article]').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        const a = bySlug[el.dataset.article];
        if (a) openReader(a);
      });
    });

    setupReveal();

    // Open from URL hash (deep-link)
    if (location.hash.startsWith('#article-')) {
      const slug = location.hash.slice('#article-'.length);
      if (bySlug[slug]) setTimeout(() => openReader(bySlug[slug], true), 100);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
