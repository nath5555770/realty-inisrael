/* ==========================================================================
   SHAHAR LEVI · Agency Team Renderer (Supabase backend)
   Reads from public.team_members where visible=true and renders:
   - "Direction" leadership block (category = 'director')
   - "Le Cabinet" agents grid    (category = 'agent')
   ========================================================================== */
(function () {
  'use strict';
  if (!window.SL_SUPABASE) { console.error('[agency] Supabase config missing'); return; }

  const SB_URL = window.SL_SUPABASE.url;
  const SB_KEY = window.SL_SUPABASE.key;

  function imageUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    if (/^assets\//i.test(path)) return path; // local repo asset
    return SB_URL + '/storage/v1/object/public/team-photos/' + path.replace(/^\/+/, '');
  }

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function langPill(lang) {
    const flag = ({ fr: '🇫🇷', he: '🇮🇱', en: '🇬🇧', ru: '🇷🇺' })[lang.code] || '';
    return '<span class="lang-pill"><span class="flag">' + flag + '</span>' + escapeHtml(lang.label || lang.code) + '</span>';
  }

  function load() {
    const url = SB_URL + '/rest/v1/team_members?select=*&visible=eq.true&order=position.asc,created_at.asc';
    return fetch(url, {
      headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Accept': 'application/json' }
    }).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }

  function directorBlock(d, isFr) {
    const langs = Array.isArray(d.languages) ? d.languages : [];
    const langsHTML = langs.map(langPill).join('');
    return [
      '<div class="grid grid-cols-12 gap-6 items-start">',
      '  <div class="col-span-5">',
      '    <div class="director-frame', isFr ? ' director-frame-fr' : '', '">',
      '      <div class="frame aspect-[4/5] overflow-hidden">',
      '        <img src="', escapeHtml(imageUrl(d.photo_url)), '" alt="', escapeHtml(d.full_name), '" class="w-full h-full object-cover ken-burns">',
      '      </div>',
      '    </div>',
      '  </div>',
      '  <div class="col-span-7 pt-3">',
      '    <div class="cinzel text-[10px] tracking-[0.4em] text-[var(--gold-deep)]">— ', escapeHtml(d.role_label || ''), '</div>',
      '    <div class="display text-3xl md:text-4xl mt-4" style="color: var(--teal)">',
      formatNameSplit(d.full_name),
      '    </div>',
      '    <div class="hr-gold mt-4 mb-4" style="max-width: 60px"></div>',
      d.bio ? '    <p class="text-sm leading-relaxed text-[var(--ink-soft)]">' + escapeHtml(d.bio) + '</p>' : '',
      '    <div class="mt-5 flex flex-wrap gap-1.5">', langsHTML, '</div>',
      '  </div>',
      '</div>'
    ].join('');
  }

  function formatNameSplit(name) {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length < 2) return escapeHtml(name);
    const first = escapeHtml(parts[0]);
    const rest = escapeHtml(parts.slice(1).join(' ')) + '.';
    return first + ' <span class="display-i text-[var(--gold-deep)]">' + rest + '</span>';
  }

  function agentCard(a) {
    const langs = Array.isArray(a.languages) ? a.languages : [];
    const langsHTML = langs.map(langPill).join('');
    return [
      '<article class="team-card">',
      '  <div class="frame aspect-[4/5] mb-5">',
      '    <img src="', escapeHtml(imageUrl(a.photo_url)), '" alt="', escapeHtml(a.full_name), ' — ', escapeHtml(a.role_label || ''), '">',
      '  </div>',
      '  <div class="cinzel text-[9px] tracking-[0.3em] text-[var(--gold-deep)]">', escapeHtml(a.role_label || ''), '</div>',
      '  <div class="display text-xl mt-1.5" style="color: var(--teal)">', escapeHtml(a.full_name), '</div>',
      a.bio ? '  <p class="text-[13px] text-[var(--ink-soft)] leading-relaxed mt-2">' + escapeHtml(a.bio) + '</p>' : '',
      '  <div class="mt-3 flex flex-wrap gap-1">', langsHTML, '</div>',
      '</article>'
    ].join('');
  }

  function init() {
    const directorsRoot = document.getElementById('team-directors');
    const agentsRoot = document.getElementById('team-agents');
    const introRoot = document.getElementById('team-intro');
    if (!directorsRoot && !agentsRoot) return;

    load().then(rows => {
      const directors = rows.filter(r => r.category === 'director').sort((a, b) => (a.position || 0) - (b.position || 0));
      const agents = rows.filter(r => r.category === 'agent').sort((a, b) => (a.position || 0) - (b.position || 0));

      if (directorsRoot) {
        // First director uses default frame label, second uses fr variant
        directorsRoot.innerHTML = directors.map((d, i) => directorBlock(d, i > 0)).join('');
      }
      if (agentsRoot) {
        agentsRoot.innerHTML = agents.map(agentCard).join('');
      }
      if (introRoot) {
        const total = rows.length;
        const langSet = new Set();
        rows.forEach(r => (r.languages || []).forEach(l => langSet.add(l.code)));
        introRoot.innerHTML = '<span>' + total + ' visages, ' + langSet.size + ' langues</span>';
      }
      // Re-apply current language to translate dynamically inserted labels
      if (window.SLI18n && typeof window.SLI18n.refresh === 'function') window.SLI18n.refresh();
    }).catch(e => {
      console.error('[agency]', e);
      if (directorsRoot) directorsRoot.innerHTML = '<div class="text-center py-12 text-[var(--muted)]">Impossible de charger l\'équipe.</div>';
      if (window.SLI18n && typeof window.SLI18n.refresh === 'function') window.SLI18n.refresh();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
