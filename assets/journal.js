/* ==========================================================================
   SHAHAR LEVI · Journal renderer (Supabase backend)
   Reads journal_articles from Supabase and renders the public Journal page.
   ========================================================================== */
(function () {
  'use strict';
  if (!window.SL_SUPABASE) return;

  const SB_URL = window.SL_SUPABASE.url;
  const SB_KEY = window.SL_SUPABASE.key;
  const BUCKET = 'article-images';

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
      return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase();
    } catch (_) { return ''; }
  }
  function categoryLabel(cat) {
    return ({ 'marche': 'MARCHÉ', 'aliyah': 'ALIYAH', 'patrimoine': 'PATRIMOINE', 'decryptage': 'DÉCRYPTAGE' })[cat] || (cat || '').toUpperCase();
  }

  function load() {
    const url = SB_URL + '/rest/v1/journal_articles?select=*&published=eq.true&order=publish_date.desc.nullslast,created_at.desc';
    return fetch(url, {
      headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Accept': 'application/json' }
    }).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }

  function featuredHTML(a) {
    const img = imageUrl(a.cover_image);
    return [
      '<article class="article-card">',
      '  <div class="grid md:grid-cols-12 gap-0 items-stretch">',
      '    <div class="md:col-span-7 img-wrap aspect-[16/10] md:aspect-auto">',
      '      <img src="', escapeHtml(img), '" class="w-full h-full object-cover" alt="', escapeHtml(a.title || ''), '">',
      '    </div>',
      '    <div class="md:col-span-5 p-8 md:p-12 flex flex-col justify-center">',
      '      <div class="topic-pill self-start">★ À LA UNE · ', categoryLabel(a.category), '</div>',
      '      <h2 class="display mt-6 leading-[0.95]" style="font-size: clamp(2rem, 4vw, 3.5rem)">',
      escapeHtml(a.title || ''),
      '      </h2>',
      a.excerpt ? '      <p class="text-base text-[var(--ink-soft)] mt-5 leading-relaxed">' + escapeHtml(a.excerpt) + '</p>' : '',
      '      <div class="flex items-center gap-4 mt-6 text-sm text-[var(--muted)]">',
      a.read_minutes ? '        <span class="cinzel text-[10px] tracking-[0.3em]">— ' + a.read_minutes + ' MIN</span><span>·</span>' : '',
      '        <span class="cinzel text-[10px] tracking-[0.3em]">PUBLIÉ LE ', fmtDate(a.publish_date), '</span>',
      '      </div>',
      '      <a href="#article-' + escapeHtml(a.slug) + '" class="btn-teal mt-6 self-start" data-article="' + escapeHtml(a.slug) + '">Lire l\'article →</a>',
      '    </div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function cardHTML(a) {
    const img = imageUrl(a.cover_image);
    return [
      '<article class="article-card">',
      '  <div class="img-wrap aspect-[16/10]"><img src="', escapeHtml(img), '" class="w-full h-full object-cover" alt="', escapeHtml(a.title || ''), '"></div>',
      '  <div class="p-7">',
      '    <div class="topic-pill">', categoryLabel(a.category), a.read_minutes ? ' · ' + a.read_minutes + ' MIN' : '', '</div>',
      '    <h3 class="display text-2xl mt-4 leading-tight">', escapeHtml(a.title || ''), '</h3>',
      a.excerpt ? '    <p class="text-sm mt-3 leading-relaxed text-[var(--ink-soft)]">' + escapeHtml(a.excerpt) + '</p>' : '',
      '    <div class="flex items-center justify-between mt-5 pt-4 border-t border-[var(--line)]">',
      '      <span class="cinzel text-[10px] tracking-[0.3em] text-[var(--muted)]">', fmtDate(a.publish_date), '</span>',
      '      <a href="#article-' + escapeHtml(a.slug) + '" data-article="' + escapeHtml(a.slug) + '" class="cinzel text-[11px] tracking-[0.3em] text-[var(--gold-deep)]">LIRE →</a>',
      '    </div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function buildModal() {
    if (document.getElementById('articleModal')) return;
    const m = document.createElement('div');
    m.id = 'articleModal';
    m.className = 'article-modal';
    m.hidden = true;
    m.innerHTML =
      '<div class="article-modal-overlay" data-close></div>' +
      '<article class="article-modal-box">' +
        '<button class="article-modal-close" data-close aria-label="Fermer">×</button>' +
        '<div class="article-modal-cover"></div>' +
        '<div class="article-modal-body">' +
          '<div class="article-modal-meta"></div>' +
          '<h1 class="article-modal-title"></h1>' +
          '<div class="article-modal-subtitle"></div>' +
          '<div class="article-modal-content"></div>' +
        '</div>' +
      '</article>';
    document.body.appendChild(m);
    m.addEventListener('click', e => { if (e.target.dataset.close !== undefined) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    // Inject style if not already there
    if (!document.getElementById('articleModalStyle')) {
      const s = document.createElement('style');
      s.id = 'articleModalStyle';
      s.textContent = `
        .article-modal { position: fixed; inset: 0; z-index: 200; display: flex; align-items: center; justify-content: center; padding: 2rem 1rem; }
        .article-modal-overlay { position: absolute; inset: 0; background: rgba(14,39,34,0.85); backdrop-filter: blur(4px); }
        .article-modal-box { position: relative; background: var(--paper); max-width: 880px; width: 100%; max-height: 92vh; overflow-y: auto; border: 1px solid var(--line-gold); box-shadow: 0 24px 80px rgba(0,0,0,0.45); }
        .article-modal-close { position: absolute; top: 14px; right: 14px; z-index: 2; width: 36px; height: 36px; border: 1px solid var(--line); background: var(--paper); border-radius: 50%; cursor: pointer; font-size: 22px; line-height: 1; color: var(--ink-soft); transition: all 0.2s; }
        .article-modal-close:hover { background: var(--teal); color: var(--gold); border-color: var(--teal); }
        .article-modal-cover { aspect-ratio: 16/8; background-size: cover; background-position: center; background-color: var(--paper-deep); }
        .article-modal-body { padding: 2.5rem 2rem 3rem; max-width: 700px; margin: 0 auto; }
        .article-modal-meta { font-family: 'Cinzel', serif; font-size: 10px; letter-spacing: 0.4em; text-transform: uppercase; color: var(--gold-deep); margin-bottom: 1rem; }
        .article-modal-title { font-family: 'Playfair Display', serif; font-weight: 400; line-height: 1.05; font-size: clamp(1.75rem, 4vw, 3rem); color: var(--teal); margin-bottom: 0.5rem; }
        .article-modal-subtitle { font-family: 'Playfair Display', serif; font-style: italic; color: var(--gold-deep); font-size: 1.15rem; margin-bottom: 2rem; }
        .article-modal-content { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px; line-height: 1.75; color: var(--ink-soft); }
        .article-modal-content p { margin: 0 0 1.1em; }
        .article-modal-content h2, .article-modal-content h3 { font-family: 'Playfair Display', serif; font-weight: 400; color: var(--teal); margin: 1.6em 0 0.4em; line-height: 1.2; }
        .article-modal-content h2 { font-size: 1.5em; }
        .article-modal-content h3 { font-size: 1.2em; }
        .article-modal-content em { color: var(--gold-deep); }
        .article-modal-content blockquote { border-left: 2px solid var(--gold); padding-left: 1.2rem; margin: 1.5em 0; font-style: italic; color: var(--ink-soft); }
        .article-modal-content a { color: var(--gold-deep); text-decoration: underline; text-underline-offset: 4px; }
        body.modal-open { overflow: hidden; }
      `;
      document.head.appendChild(s);
    }
  }

  function openModal(a) {
    buildModal();
    const m = document.getElementById('articleModal');
    m.querySelector('.article-modal-cover').style.backgroundImage = a.cover_image ? "url('" + imageUrl(a.cover_image).replace(/'/g, "\\'") + "')" : '';
    m.querySelector('.article-modal-meta').textContent = (a.read_minutes ? a.read_minutes + ' min · ' : '') + categoryLabel(a.category) + ' · publié le ' + fmtDate(a.publish_date);
    m.querySelector('.article-modal-title').textContent = a.title || '';
    m.querySelector('.article-modal-subtitle').textContent = a.subtitle || '';
    // Content allows simple HTML (paragraphs, h2, h3, blockquote, a, em, strong) since admin authors are trusted.
    // We still apply a conservative cleanup of <script> tags as a defense in depth.
    let html = (a.content || '').replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '');
    if (!/<p|<h\d|<ul|<ol|<blockquote/i.test(html)) {
      // No HTML structure — auto-paragraph
      html = html.split(/\n\n+/).map(p => '<p>' + escapeHtml(p).replace(/\n/g, '<br>') + '</p>').join('');
    }
    m.querySelector('.article-modal-content').innerHTML = html;
    m.hidden = false;
    document.body.classList.add('modal-open');
    history.replaceState(null, '', '#article-' + (a.slug || ''));
  }

  function closeModal() {
    const m = document.getElementById('articleModal');
    if (m) m.hidden = true;
    document.body.classList.remove('modal-open');
    if (location.hash.startsWith('#article-')) history.replaceState(null, '', location.pathname + location.search);
  }

  function init() {
    const featured = document.getElementById('journal-featured');
    const grid = document.getElementById('journal-grid');
    if (!featured && !grid) return;

    load().then(rows => {
      if (!rows.length) {
        if (featured) featured.innerHTML = '<div class="text-center py-20 text-[var(--muted)] cinzel text-xs tracking-[0.3em]">Aucun article publié pour le moment.</div>';
        if (grid) grid.innerHTML = '';
        if (window.SLI18n && typeof window.SLI18n.refresh === 'function') window.SLI18n.refresh();
        return;
      }
      const top = rows[0];
      const others = rows.slice(1);
      if (featured) featured.innerHTML = featuredHTML(top);
      if (grid) grid.innerHTML = others.map(cardHTML).join('');
      const ctaWrap = document.getElementById('journal-cta-wrap');
      if (ctaWrap) ctaWrap.hidden = false;
      // Re-apply current language to translate dynamically inserted static labels
      if (window.SLI18n && typeof window.SLI18n.refresh === 'function') window.SLI18n.refresh();

      // Wire "Lire" links to open the modal
      const all = [top].concat(others);
      const bySlug = Object.fromEntries(all.map(a => [a.slug, a]));
      document.querySelectorAll('[data-article]').forEach(el => {
        el.addEventListener('click', e => {
          e.preventDefault();
          const a = bySlug[el.dataset.article];
          if (a) openModal(a);
        });
      });

      // Open from URL hash
      if (location.hash.startsWith('#article-')) {
        const slug = location.hash.slice('#article-'.length);
        if (bySlug[slug]) setTimeout(() => openModal(bySlug[slug]), 100);
      }
    }).catch(e => {
      console.error('[journal]', e);
      if (featured) featured.innerHTML = '<div class="text-center py-20 text-[var(--muted)]">Impossible de charger les articles.</div>';
      if (window.SLI18n && typeof window.SLI18n.refresh === 'function') window.SLI18n.refresh();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
