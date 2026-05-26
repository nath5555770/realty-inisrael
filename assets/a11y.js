/* ==========================================================================
   SHAHAR LEVI · Widget d'accessibilité — conforme Loi israélienne 5568
   Standard d'accessibilité Israélien (basé sur WCAG 2.0 AA)
   Documentation : https://www.vee.co.il
   ========================================================================== */
(function () {
  'use strict';

  const STORAGE_KEY = 'sl-a11y-prefs';
  const LANG_KEY = 'sl-lang';

  // ---- Dictionnaire multilingue ----
  const I18N = {
    fr: {
      title: 'Accessibilité',
      open_label: "Ouvrir l'outil d'accessibilité",
      close_label: 'Fermer',
      font_size: 'TAILLE DU TEXTE',
      font_normal: 'Normal',
      font_large: 'Grand',
      font_xlarge: 'Très grand',
      contrast: 'CONTRASTE & COULEUR',
      contrast_high: 'Contraste élevé',
      contrast_inverse: 'Couleurs inversées',
      reading: 'CONFORT DE LECTURE',
      readable_font: 'Police lisible',
      underline_links: 'Souligner les liens',
      highlight_headings: 'Surligner les titres',
      navigation: 'NAVIGATION',
      pause_animations: 'Arrêter les animations',
      big_cursor: 'Grand curseur',
      focus_visible: 'Indicateur de focus renforcé',
      reset: 'Tout réinitialiser',
      statement: 'Déclaration d’accessibilité'
    },
    en: {
      title: 'Accessibility',
      open_label: 'Open accessibility tool',
      close_label: 'Close',
      font_size: 'TEXT SIZE',
      font_normal: 'Normal',
      font_large: 'Large',
      font_xlarge: 'Very large',
      contrast: 'CONTRAST & COLOR',
      contrast_high: 'High contrast',
      contrast_inverse: 'Inverted colors',
      reading: 'READING COMFORT',
      readable_font: 'Readable font',
      underline_links: 'Underline links',
      highlight_headings: 'Highlight headings',
      navigation: 'NAVIGATION',
      pause_animations: 'Pause animations',
      big_cursor: 'Big cursor',
      focus_visible: 'Stronger focus indicator',
      reset: 'Reset all',
      statement: 'Accessibility statement'
    },
    he: {
      title: 'נגישות',
      open_label: 'פתח כלי נגישות',
      close_label: 'סגור',
      font_size: 'גודל טקסט',
      font_normal: 'רגיל',
      font_large: 'גדול',
      font_xlarge: 'גדול מאוד',
      contrast: 'ניגודיות וצבע',
      contrast_high: 'ניגודיות גבוהה',
      contrast_inverse: 'צבעים הפוכים',
      reading: 'נוחות קריאה',
      readable_font: 'גופן קריא',
      underline_links: 'הדגש קישורים',
      highlight_headings: 'הדגש כותרות',
      navigation: 'ניווט',
      pause_animations: 'עצור אנימציות',
      big_cursor: 'סמן גדול',
      focus_visible: 'סימן פוקוס מודגש',
      reset: 'אפס הכל',
      statement: 'הצהרת נגישות'
    },
    ru: {
      title: 'Доступность',
      open_label: 'Открыть инструмент доступности',
      close_label: 'Закрыть',
      font_size: 'РАЗМЕР ТЕКСТА',
      font_normal: 'Нормальный',
      font_large: 'Большой',
      font_xlarge: 'Очень большой',
      contrast: 'КОНТРАСТ И ЦВЕТ',
      contrast_high: 'Высокий контраст',
      contrast_inverse: 'Инвертированные цвета',
      reading: 'УДОБСТВО ЧТЕНИЯ',
      readable_font: 'Читаемый шрифт',
      underline_links: 'Подчёркивать ссылки',
      highlight_headings: 'Выделить заголовки',
      navigation: 'НАВИГАЦИЯ',
      pause_animations: 'Остановить анимации',
      big_cursor: 'Большой курсор',
      focus_visible: 'Усиленный индикатор фокуса',
      reset: 'Сбросить всё',
      statement: 'Декларация о доступности'
    }
  };

  function getLang() {
    try { const s = localStorage.getItem(LANG_KEY); if (I18N[s]) return s; } catch (_) {}
    const b = (navigator.language || 'fr').slice(0, 2).toLowerCase();
    return I18N[b] ? b : 'fr';
  }
  function t(key) { return (I18N[getLang()] || I18N.fr)[key] || key; }

  // ---- État ----
  const DEFAULT_PREFS = {
    fontSize: 'normal',     // normal | large | xlarge
    contrast: 'normal',     // normal | high | inverse
    readable: false,
    underlineLinks: false,
    highlightHeadings: false,
    pauseAnim: false,
    bigCursor: false,
    focusVisible: false
  };
  function loadPrefs() {
    try { return Object.assign({}, DEFAULT_PREFS, JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')); }
    catch (_) { return Object.assign({}, DEFAULT_PREFS); }
  }
  function savePrefs(p) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch (_) {} }

  let PREFS = loadPrefs();

  // ---- Appliquer les préférences au <html> ----
  function applyPrefs() {
    const h = document.documentElement;
    h.classList.toggle('a11y-font-large',  PREFS.fontSize === 'large');
    h.classList.toggle('a11y-font-xlarge', PREFS.fontSize === 'xlarge');
    h.classList.toggle('a11y-high-contrast', PREFS.contrast === 'high');
    h.classList.toggle('a11y-inverse',       PREFS.contrast === 'inverse');
    h.classList.toggle('a11y-readable',           PREFS.readable);
    h.classList.toggle('a11y-underline-links',    PREFS.underlineLinks);
    h.classList.toggle('a11y-highlight-headings', PREFS.highlightHeadings);
    h.classList.toggle('a11y-pause-animations',   PREFS.pauseAnim);
    h.classList.toggle('a11y-big-cursor',         PREFS.bigCursor);
    h.classList.toggle('a11y-focus-visible',      PREFS.focusVisible);
  }

  // ---- Construire le bouton + panneau ----
  function build() {
    if (document.getElementById('a11y-btn')) return;

    // Bouton
    const btn = document.createElement('button');
    btn.id = 'a11y-btn';
    btn.className = 'a11y-btn';
    btn.setAttribute('aria-label', t('open_label'));
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'a11y-panel');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="4" r="2"/><path d="M19 9h-6v6l1 7h-2l-1.5-5h-1L8 22H6l1-7V9H1V7h22v2z"/></svg>';
    document.body.appendChild(btn);

    // Panneau
    const panel = document.createElement('div');
    panel.id = 'a11y-panel';
    panel.className = 'a11y-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', t('title'));
    panel.innerHTML = ''
      + '<div class="a11y-panel-head">'
      +   '<div class="a11y-panel-title">' + escape(t('title')) + '</div>'
      +   '<button class="a11y-panel-close" aria-label="' + escape(t('close_label')) + '">×</button>'
      + '</div>'

      // Taille du texte
      + '<div class="a11y-section">'
      +   '<div class="a11y-section-label">' + escape(t('font_size')) + '</div>'
      +   '<div class="a11y-row">'
      +     '<button class="a11y-btn-action" data-act="font" data-val="normal">' + escape(t('font_normal')) + '</button>'
      +     '<button class="a11y-btn-action" data-act="font" data-val="large">A+</button>'
      +     '<button class="a11y-btn-action" data-act="font" data-val="xlarge">A++</button>'
      +   '</div>'
      + '</div>'

      // Contraste
      + '<div class="a11y-section">'
      +   '<div class="a11y-section-label">' + escape(t('contrast')) + '</div>'
      +   '<div class="a11y-row">'
      +     '<button class="a11y-btn-action" data-act="contrast" data-val="high">' + escape(t('contrast_high')) + '</button>'
      +     '<button class="a11y-btn-action" data-act="contrast" data-val="inverse">' + escape(t('contrast_inverse')) + '</button>'
      +   '</div>'
      + '</div>'

      // Confort de lecture
      + '<div class="a11y-section">'
      +   '<div class="a11y-section-label">' + escape(t('reading')) + '</div>'
      +   toggleHtml('readable', t('readable_font'))
      +   toggleHtml('underlineLinks', t('underline_links'))
      +   toggleHtml('highlightHeadings', t('highlight_headings'))
      + '</div>'

      // Navigation
      + '<div class="a11y-section">'
      +   '<div class="a11y-section-label">' + escape(t('navigation')) + '</div>'
      +   toggleHtml('pauseAnim', t('pause_animations'))
      +   toggleHtml('bigCursor', t('big_cursor'))
      +   toggleHtml('focusVisible', t('focus_visible'))
      + '</div>'

      // Reset + statement link
      + '<div class="a11y-reset-row">'
      +   '<button class="a11y-reset-btn" data-act="reset">↻ ' + escape(t('reset')) + '</button>'
      + '</div>'
      + '<a class="a11y-statement-link" href="accessibilite.html">' + escape(t('statement')) + ' →</a>'
    ;
    document.body.appendChild(panel);

    wire(btn, panel);
    refreshUI();
  }

  function toggleHtml(key, label) {
    return '<label class="a11y-toggle">'
         +   '<span class="a11y-toggle-label">' + escape(label) + '</span>'
         +   '<input type="checkbox" data-act="toggle" data-key="' + escape(key) + '">'
         + '</label>';
  }

  function escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function wire(btn, panel) {
    btn.addEventListener('click', () => {
      const open = panel.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) panel.querySelector('.a11y-panel-close').focus();
    });
    panel.querySelector('.a11y-panel-close').addEventListener('click', () => {
      panel.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) {
        panel.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });

    panel.addEventListener('click', e => {
      const t = e.target;
      const act = t.dataset && t.dataset.act;
      if (!act) return;
      if (act === 'font') {
        PREFS.fontSize = t.dataset.val === PREFS.fontSize ? 'normal' : t.dataset.val;
      } else if (act === 'contrast') {
        PREFS.contrast = t.dataset.val === PREFS.contrast ? 'normal' : t.dataset.val;
      } else if (act === 'reset') {
        PREFS = Object.assign({}, DEFAULT_PREFS);
      } else { return; }
      savePrefs(PREFS); applyPrefs(); refreshUI();
    });

    panel.addEventListener('change', e => {
      const t = e.target;
      if (t.dataset && t.dataset.act === 'toggle') {
        PREFS[t.dataset.key] = !!t.checked;
        savePrefs(PREFS); applyPrefs();
      }
    });
  }

  function refreshUI() {
    document.querySelectorAll('#a11y-panel [data-act="font"]').forEach(b => {
      b.classList.toggle('is-active', b.dataset.val === PREFS.fontSize);
    });
    document.querySelectorAll('#a11y-panel [data-act="contrast"]').forEach(b => {
      b.classList.toggle('is-active', b.dataset.val === PREFS.contrast);
    });
    document.querySelectorAll('#a11y-panel [data-act="toggle"]').forEach(c => {
      c.checked = !!PREFS[c.dataset.key];
    });
  }

  // ---- Boot ----
  applyPrefs(); // apply early to avoid flash
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();

  // Re-render labels when language changes
  document.addEventListener('sl-lang-changed', () => {
    const panel = document.getElementById('a11y-panel');
    const btn = document.getElementById('a11y-btn');
    if (panel) panel.remove();
    if (btn) btn.remove();
    build();
  });
})();
