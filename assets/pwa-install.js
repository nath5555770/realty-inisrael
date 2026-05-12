/* ==========================================================================
   SHAHAR LEVI — PWA install prompt + service worker registration

   1) Enregistre le service worker (offline + perfs).
   2) Sur Android/desktop : intercepte beforeinstallprompt → bouton custom.
   3) Sur iOS (où Apple bloque beforeinstallprompt) : détecte Safari mobile
      et affiche un guide "Tap Share → Add to Home Screen".
   4) Banner discret, apparaît après 12s sur mobile uniquement, refermable.
      Mémorise le refus 30 jours dans localStorage.
   ========================================================================== */
(function () {
  'use strict';

  // ---------- Service worker ----------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(err => {
        console.warn('[PWA] SW registration failed:', err.message);
      });
    });
  }

  // ---------- State ----------
  const DISMISS_KEY = 'sl-pwa-dismissed-at';
  const DISMISS_DAYS = 30;
  let deferredPrompt = null;

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
  }
  function isMobile() {
    return window.innerWidth <= 900 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }
  function isIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.MSStream;
  }
  function recentlyDismissed() {
    const ts = localStorage.getItem(DISMISS_KEY);
    if (!ts) return false;
    const age = (Date.now() - parseInt(ts, 10)) / (1000 * 60 * 60 * 24);
    return age < DISMISS_DAYS;
  }

  // Capture l'event Chromium/Android pour pouvoir le déclencher plus tard
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  // ---------- Banner UI ----------
  function buildBanner(mode) {
    if (document.getElementById('pwa-install-banner')) return;
    const el = document.createElement('div');
    el.id = 'pwa-install-banner';
    el.setAttribute('data-i18n-skip', '');
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Installer l’application');

    const isIOSMode = mode === 'ios';
    el.innerHTML =
      '<div class="pwa-banner-inner">' +
        '<div class="pwa-banner-icon">' +
          '<img src="/assets/favicon-192.png" alt="" width="44" height="44">' +
        '</div>' +
        '<div class="pwa-banner-text">' +
          '<strong>Installer l’application</strong>' +
          '<span>' + (isIOSMode
            ? 'Touchez <b>Partager</b> ⬆ puis <b>Sur l’écran d’accueil</b>'
            : 'Accédez au portefeuille en un clic depuis votre écran d’accueil'
          ) + '</span>' +
        '</div>' +
        (isIOSMode ? '' : '<button class="pwa-banner-install" type="button">Installer</button>') +
        '<button class="pwa-banner-close" type="button" aria-label="Fermer">×</button>' +
      '</div>';
    document.body.appendChild(el);

    el.querySelector('.pwa-banner-close').addEventListener('click', () => {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
      el.classList.remove('is-visible');
      setTimeout(() => el.remove(), 500);
    });

    if (!isIOSMode) {
      el.querySelector('.pwa-banner-install').addEventListener('click', async () => {
        if (!deferredPrompt) {
          // Aucun prompt natif disponible — montrer un message d'aide
          el.querySelector('.pwa-banner-text span').textContent =
            'Ouvrez le menu du navigateur ⋮ puis « Installer l’application ».';
          return;
        }
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
        if (outcome === 'accepted') {
          el.classList.remove('is-visible');
          setTimeout(() => el.remove(), 500);
        } else {
          localStorage.setItem(DISMISS_KEY, String(Date.now()));
        }
      });
    }

    setTimeout(() => el.classList.add('is-visible'), 50);
  }

  // ---------- Trigger logic ----------
  function maybeShow() {
    if (isStandalone()) return;        // déjà installée
    if (!isMobile()) return;            // desktop : pas de prompt
    if (recentlyDismissed()) return;    // refusée il y a moins de 30 jours

    if (isIOS()) {
      // iOS Safari ne supporte pas beforeinstallprompt — banner d'instructions
      buildBanner('ios');
    } else if (deferredPrompt) {
      // Android/Chrome : event capturé, on peut déclencher
      buildBanner('chromium');
    }
    // Note : si pas iOS et pas de deferredPrompt, on attend qu'il arrive.
    // L'event peut arriver après le DOMContentLoaded, donc on re-check.
  }

  // Première tentative à 12s, puis re-check toutes les 5s pendant 60s
  // pour attraper le beforeinstallprompt qui peut arriver tardivement.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule);
  } else {
    schedule();
  }
  function schedule() {
    setTimeout(maybeShow, 12000);
    let tries = 0;
    const id = setInterval(() => {
      tries++;
      if (tries > 12 || document.getElementById('pwa-install-banner')) {
        clearInterval(id);
      } else {
        maybeShow();
      }
    }, 5000);
  }
})();
