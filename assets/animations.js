/* ==========================================================================
   SHAHAR LEVI REAL ESTATE — Animation Engine (premium)
   ========================================================================== */

(function() {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* === PAGE LOADER === */
  function initLoader() {
    const loader = document.querySelector('.page-loader');
    if (!loader) return;
    // First visit only — subsequent navigations skip the loader
    const seen = sessionStorage.getItem('sl-visited');
    if (seen) {
      loader.style.display = 'none';
      return;
    }
    sessionStorage.setItem('sl-visited', '1');
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('is-hidden'), 200);
    });
    setTimeout(() => loader.classList.add('is-hidden'), 1200);
  }

  /* === CUSTOM CURSOR === */
  function initCursor() {
    if (prefersReducedMotion) return;
    if (window.matchMedia('(hover: none)').matches) return;
    if (window.innerWidth < 1024) return;

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.append(dot, ring);

    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    function tick() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    }
    tick();

    document.addEventListener('mouseover', e => {
      const t = e.target.closest('a, button, [role="button"], input, textarea, select, .cursor-link, label[for]');
      document.body.classList.toggle('cursor-link', !!t);
    });

    document.addEventListener('mouseleave', () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    });
  }

  /* === SCROLL REVEAL === */
  function initReveal() {
    if (prefersReducedMotion) {
      document.querySelectorAll('[data-reveal], .split-line, .stagger-list, [data-fade], section').forEach(el => el.classList.add('is-revealed'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
    document.querySelectorAll('.split-line').forEach(el => observer.observe(el));
    document.querySelectorAll('.stagger-list').forEach(el => observer.observe(el));
    document.querySelectorAll('section[data-fade]').forEach(el => observer.observe(el));
  }

  /* === COUNTERS === */
  function initCounters() {
    if (prefersReducedMotion) return;
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-count'));
        const decimals = (el.getAttribute('data-count-decimals') || '0') | 0;
        const duration = (el.getAttribute('data-count-duration') | 0) || 2000;
        const prefix = el.getAttribute('data-count-prefix') || '';
        const suffix = el.getAttribute('data-count-suffix') || '';
        const start = performance.now();

        function tick(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const value = target * easeOutCubic(progress);
          el.textContent = prefix + (decimals ? value.toFixed(decimals) : Math.floor(value).toLocaleString('fr-FR')) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  /* === MAGNETIC BUTTONS === */
  function initMagnetic() {
    if (prefersReducedMotion) return;
    if (window.innerWidth < 1024) return;

    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        const strength = parseFloat(el.dataset.magneticStrength || '0.3');
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* === IMAGE PARALLAX === */
  function initParallax() {
    if (prefersReducedMotion) return;
    if (window.innerWidth < 768) return;

    const items = document.querySelectorAll('[data-parallax]');
    if (!items.length) return;

    let ticking = false;
    function update() {
      const vh = window.innerHeight;
      items.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const speed = parseFloat(el.dataset.parallax) || 0.3;
        const center = r.top + r.height / 2;
        const offset = (vh / 2 - center) * speed;
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  /* === SPLIT TEXT === */
  function splitText() {
    document.querySelectorAll('[data-split]').forEach(el => {
      if (el.dataset.splitDone) return;
      el.dataset.splitDone = 'true';
      const lines = el.innerHTML.split('<br>').filter(l => l.trim());
      const fragment = document.createDocumentFragment();
      lines.forEach((line, i) => {
        const wrapper = document.createElement('span');
        wrapper.className = 'split-line';
        const inner = document.createElement('span');
        inner.className = 'split-inner';
        inner.style.setProperty('--split-delay', (i * 0.12) + 's');
        inner.innerHTML = line;
        wrapper.appendChild(inner);
        fragment.appendChild(wrapper);
        if (i < lines.length - 1) fragment.appendChild(document.createElement('br'));
      });
      el.innerHTML = '';
      el.appendChild(fragment);
    });
  }

  /* === PAGE TRANSITIONS === */
  function initPageTransitions() {
    if (prefersReducedMotion) return;
    const transition = document.createElement('div');
    transition.className = 'page-transition';
    document.body.appendChild(transition);

    document.querySelectorAll('a[href]').forEach(a => {
      const url = a.getAttribute('href');
      if (!url || url.startsWith('#') || url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:')) return;
      if (a.target === '_blank') return;

      a.addEventListener('click', function(e) {
        e.preventDefault();
        transition.classList.add('is-active');
        setTimeout(() => { window.location.href = url; }, 600);
      });
    });

    window.addEventListener('pageshow', e => {
      if (e.persisted) transition.classList.remove('is-active');
    });
  }

  /* === SMOOTH SCROLL FOR ANCHORS === */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', function(e) {
        const id = this.getAttribute('href');
        if (id === '#' || id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* === COOKIE BANNER === */
  function initCookieBanner() {
    if (localStorage.getItem('cookies-accepted') === 'true') return;

    // Pick language-specific strings (matches sl-lang from i18n.js)
    const COOKIE_I18N = {
      fr: { title: '🍪 Cookies & confidentialité', body: "Nous utilisons des cookies essentiels pour le fonctionnement du site et des cookies analytiques anonymes pour améliorer votre expérience. Aucune donnée personnelle n'est partagée.", reject: 'Refuser', accept: 'Accepter' },
      en: { title: '🍪 Cookies & privacy', body: 'We use essential cookies for the operation of the site and anonymous analytical cookies to improve your experience. No personal data is shared.', reject: 'Decline', accept: 'Accept' },
      he: { title: '🍪 עוגיות ופרטיות', body: 'אנו משתמשים בעוגיות חיוניות לתפעול האתר ובעוגיות אנליטיות אנונימיות לשיפור החוויה שלך. שום נתון אישי אינו משותף.', reject: 'סירוב', accept: 'אישור' },
      ru: { title: '🍪 Cookies и конфиденциальность', body: 'Мы используем необходимые cookies для работы сайта и анонимные аналитические cookies для улучшения вашего опыта. Никакие персональные данные не передаются.', reject: 'Отклонить', accept: 'Принять' }
    };
    let _lang = 'fr';
    try { _lang = localStorage.getItem('sl-lang') || 'fr'; } catch (_) {}
    const t = COOKIE_I18N[_lang] || COOKIE_I18N.fr;

    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('data-i18n-skip', '');
    banner.innerHTML = `
      <div class="cookie-banner-inner">
        <div class="cookie-banner-text">
          <strong>${t.title}</strong>
          <p>${t.body}</p>
        </div>
        <div class="cookie-banner-actions">
          <button class="cookie-btn cookie-btn-secondary" data-cookie-action="reject">${t.reject}</button>
          <button class="cookie-btn cookie-btn-primary" data-cookie-action="accept">${t.accept}</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);

    setTimeout(() => banner.classList.add('is-visible'), 800);

    banner.querySelectorAll('[data-cookie-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.cookieAction === 'accept') {
          localStorage.setItem('cookies-accepted', 'true');
        }
        banner.classList.remove('is-visible');
        setTimeout(() => banner.remove(), 600);
      });
    });
  }

  /* === MOBILE MENU TOGGLE === */
  function initMobileMenu() {
    document.querySelectorAll('.burger').forEach(burger => {
      burger.addEventListener('click', () => document.body.classList.toggle('menu-open'));
    });
    document.querySelectorAll('.mobile-menu a').forEach(a => {
      a.addEventListener('click', () => document.body.classList.remove('menu-open'));
    });
  }

  /* === INIT === */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startup);
  } else {
    startup();
  }

  function startup() {
    initLoader();
    // initCursor();           // disabled — user feedback: not preferred
    splitText();
    initReveal();
    initCounters();
    initMagnetic();
    initParallax();
    initSmoothAnchors();
    initCookieBanner();
    initMobileMenu();
    // initPageTransitions();  // disabled — user feedback: hurts fluidity
  }

})();
