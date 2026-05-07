/* ==========================================================================
   SHAHAR LEVI Real Estate — Admin SPA
   - Local-only password gate (sha-256 hashed in localStorage)
   - GitHub API for reads, writes, image uploads
   - Single source of truth: data/listings.json in the repo
   ========================================================================== */

(function () {
  'use strict';

  // ---- CONFIG --------------------------------------------------------------
  const STORAGE_TOKEN = 'sl-admin-gh-token';
  const STORAGE_REPO = 'sl-admin-gh-repo';
  const STORAGE_BRANCH = 'sl-admin-gh-branch';
  const STORAGE_PWHASH = 'sl-admin-pwhash';
  const STORAGE_SESSION = 'sl-admin-session';
  const STORAGE_PWHASH_DEFAULT = ''; // first run prompts to create one
  const DATA_PATH = 'data/listings.json';
  const IMG_DIR = 'assets/listings';
  const SESSION_TTL_MS = 1000 * 60 * 60 * 4; // 4h

  // ---- STATE ---------------------------------------------------------------
  let STATE = {
    listings: [],
    currentEdit: null, // index in STATE.listings, or 'new'
    sha: null, // sha of the listings.json blob (needed to PUT)
    pendingImage: null, // { dataUrl, mimeType, ext, filename }
    repo: localStorage.getItem(STORAGE_REPO) || 'nath5555770/realty-inisrael',
    branch: localStorage.getItem(STORAGE_BRANCH) || 'main',
    token: localStorage.getItem(STORAGE_TOKEN) || ''
  };

  // ---- UTILS ---------------------------------------------------------------
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  async function sha256(text) {
    const buf = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function slugify(s) {
    return (s || '')
      .toString()
      .normalize('NFKD').replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || ('listing-' + Date.now());
  }

  function showView(name) {
    $$('.view').forEach(v => { v.hidden = v.dataset.view !== name; });
  }

  function toast(msg, kind, title) {
    const t = document.createElement('div');
    t.className = 'toast' + (kind ? ' ' + kind : '');
    t.innerHTML = (title ? '<strong>' + escapeHtml(title) + '</strong>' : '') + escapeHtml(msg);
    $('#toastHost').appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(20px)'; t.style.transition = 'all 0.4s'; }, 3500);
    setTimeout(() => t.remove(), 4000);
  }

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function confirmModal(title, body) {
    return new Promise(resolve => {
      $('#confirmTitle').textContent = title;
      $('#confirmBody').textContent = body;
      const m = $('#confirmModal');
      m.hidden = false;
      const ok = $('#confirmOk');
      const cancel = $('#confirmCancel');
      function close(v) {
        m.hidden = true;
        ok.removeEventListener('click', okH);
        cancel.removeEventListener('click', cancelH);
        resolve(v);
      }
      function okH() { close(true); }
      function cancelH() { close(false); }
      ok.addEventListener('click', okH);
      cancel.addEventListener('click', cancelH);
    });
  }

  // ---- GITHUB API ----------------------------------------------------------
  // Base64 encoding helpers that handle UTF-8 (and binary for images via File API).
  function utf8ToBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }
  function base64ToUtf8(b64) {
    return decodeURIComponent(escape(atob(b64.replace(/\s/g, ''))));
  }

  async function ghApi(method, path, body) {
    const url = 'https://api.github.com/repos/' + STATE.repo + path;
    const opts = {
      method,
      headers: {
        'Authorization': 'token ' + STATE.token,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    };
    if (body) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const r = await fetch(url, opts);
    if (!r.ok) {
      const txt = await r.text();
      throw new Error('GitHub API ' + r.status + ': ' + txt.slice(0, 200));
    }
    return r.json();
  }

  async function ghReadFile(path) {
    const r = await ghApi('GET', '/contents/' + encodeURI(path) + '?ref=' + encodeURIComponent(STATE.branch));
    return { sha: r.sha, content: base64ToUtf8(r.content) };
  }

  async function ghWriteFile(path, content, message, sha) {
    const body = {
      message,
      content: utf8ToBase64(content),
      branch: STATE.branch
    };
    if (sha) body.sha = sha;
    return ghApi('PUT', '/contents/' + encodeURI(path), body);
  }

  async function ghUploadBinary(path, base64Content, message) {
    // Check if file exists (need sha for PUT)
    let existingSha = null;
    try {
      const r = await ghApi('GET', '/contents/' + encodeURI(path) + '?ref=' + encodeURIComponent(STATE.branch));
      existingSha = r.sha;
    } catch (_) { /* not exists */ }
    const body = { message, content: base64Content, branch: STATE.branch };
    if (existingSha) body.sha = existingSha;
    return ghApi('PUT', '/contents/' + encodeURI(path), body);
  }

  async function ghVerifyAccess() {
    // Lightweight: get the repo metadata
    const r = await ghApi('GET', '');
    return r;
  }

  // ---- LOGIN ---------------------------------------------------------------
  async function tryLogin(password) {
    const stored = localStorage.getItem(STORAGE_PWHASH);
    const hash = await sha256(password);
    if (!stored) {
      // First-time setup: any password becomes THE password
      localStorage.setItem(STORAGE_PWHASH, hash);
      toast('Mot de passe défini. Conservez-le précieusement.', 'success', 'Première connexion');
      return true;
    }
    return hash === stored;
  }

  function isSessionValid() {
    const raw = sessionStorage.getItem(STORAGE_SESSION);
    if (!raw) return false;
    try {
      const s = JSON.parse(raw);
      return s.expires > Date.now();
    } catch (_) { return false; }
  }

  function setSession() {
    sessionStorage.setItem(STORAGE_SESSION, JSON.stringify({ expires: Date.now() + SESSION_TTL_MS }));
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_SESSION);
    showView('login');
    $('#loginPassword').value = '';
    $('#loginPassword').focus();
  }

  // ---- DATA LOAD/SAVE ------------------------------------------------------
  async function loadListings() {
    try {
      const file = await ghReadFile(DATA_PATH);
      const parsed = JSON.parse(file.content);
      STATE.listings = parsed.listings || [];
      STATE.sha = file.sha;
      STATE._raw = parsed;
      return STATE.listings;
    } catch (e) {
      console.error(e);
      toast('Impossible de charger les annonces depuis GitHub. Vérifiez le token et le dépôt.', 'error', 'Erreur');
      throw e;
    }
  }

  async function saveListings(message) {
    const out = Object.assign({}, STATE._raw || {}, { listings: STATE.listings });
    const content = JSON.stringify(out, null, 2);
    const result = await ghWriteFile(DATA_PATH, content, message || 'admin: update listings.json', STATE.sha);
    STATE.sha = result.content.sha;
    return result;
  }

  // ---- DASHBOARD RENDER ----------------------------------------------------
  function updateStats() {
    const total = STATE.listings.length;
    const visible = STATE.listings.filter(l => l.visible !== false).length;
    const featured = STATE.listings.filter(l => l.featured === true).length;
    const hidden = STATE.listings.filter(l => l.visible === false).length;
    const off = STATE.listings.filter(l => l.off_market === true).length;
    $('#statTotal').textContent = total;
    $('#statVisible').textContent = visible;
    $('#statFeatured').textContent = featured;
    $('#statHidden').textContent = hidden;
    $('#statOff').textContent = off;
  }

  function priceLabel(l) {
    if (l.price_display) return l.price_display;
    if (typeof l.price_usd === 'number') {
      const m = l.price_usd / 1_000_000;
      return '$' + (m % 1 === 0 ? m.toFixed(1) : m.toFixed(2)) + 'M';
    }
    return '—';
  }

  function cityLabel(slug) {
    return ({
      'tel-aviv': 'Tel Aviv', 'herzliya': 'Herzliya', 'caesarea': 'Caesarea',
      'netanya': 'Netanya', 'jerusalem': 'Jérusalem'
    })[slug] || slug;
  }

  function applyFilter() {
    const search = ($('#searchInput').value || '').trim().toLowerCase();
    const city = $('#filterCity').value;
    const type = $('#filterType').value;
    return STATE.listings
      .map((l, i) => ({ l, i }))
      .filter(({ l }) => {
        if (city && l.city !== city) return false;
        if (type && l.type !== type) return false;
        if (search) {
          const blob = (l.title_main + ' ' + l.title_accent + ' ' + l.ref + ' ' + l.neighborhood + ' ' + l.city).toLowerCase();
          if (!blob.includes(search)) return false;
        }
        return true;
      });
  }

  function renderTable() {
    const filtered = applyFilter();
    const root = $('#listingsTable');

    if (!filtered.length) {
      root.innerHTML = '<div class="empty-state"><div class="display">Aucun résultat</div><p>Essayez d\'élargir votre recherche, ou ajoutez une nouvelle annonce.</p></div>';
      return;
    }

    root.innerHTML = filtered.map(({ l, i }) => {
      const badges = [];
      if (l.signature) badges.push('<span class="badge badge-signature">★ Signature</span>');
      if (l.featured) badges.push('<span class="badge badge-featured">À la une</span>');
      if (l.visible === false) badges.push('<span class="badge badge-hidden">Masquée</span>');
      if (l.off_market) badges.push('<span class="badge badge-off">Off-market</span>');

      return [
        '<div class="listing-row" data-i="', i, '">',
        '  <div class="thumb" style="background-image: url(\'', escapeHtml(l.image || ''), '\')"></div>',
        '  <div class="info">',
        '    <div class="title">', escapeHtml(l.title_main), ' <em>', escapeHtml(l.title_accent || ''), '</em></div>',
        '    <div class="sub">', escapeHtml(l.ref || ''), ' · ', escapeHtml(l.neighborhood || ''), '</div>',
        '  </div>',
        '  <div class="city-tag">', cityLabel(l.city), '</div>',
        '  <div class="badges">', badges.join(''), '</div>',
        '  <div class="price">', priceLabel(l), '</div>',
        '  <div class="row-actions">',
        '    <button class="icon-btn" data-act="edit" title="Modifier">✎</button>',
        '    <button class="icon-btn" data-act="duplicate" title="Dupliquer">⎘</button>',
        '  </div>',
        '</div>'
      ].join('');
    }).join('');

    root.querySelectorAll('.listing-row').forEach(row => {
      row.addEventListener('click', e => {
        const i = parseInt(row.dataset.i, 10);
        const act = e.target.closest('[data-act]')?.dataset.act;
        if (act === 'duplicate') { duplicate(i); return; }
        openEditor(i);
      });
    });
  }

  function duplicate(i) {
    const src = STATE.listings[i];
    const copy = JSON.parse(JSON.stringify(src));
    copy.id = slugify(src.id || src.title_main) + '-copy-' + Date.now().toString(36);
    copy.ref = (src.ref || 'SL') + '·';
    copy.featured = false;
    copy.signature = false;
    copy.visible = false; // start hidden so client doesn't see un-edited copies
    STATE.listings.splice(i + 1, 0, copy);
    renderTable();
    updateStats();
    toast('Annonce dupliquée — pensez à enregistrer après modification.', 'success', 'Dupliqué');
    openEditor(i + 1);
  }

  // ---- EDITOR --------------------------------------------------------------
  function openEditor(idx) {
    STATE.currentEdit = idx;
    STATE.pendingImage = null;
    const isNew = idx === 'new';
    const l = isNew
      ? {
          id: '', ref: '', city: 'tel-aviv', type: 'appartement', neighborhood: '',
          title_main: '', title_accent: '', description: '',
          surface: '', rooms: '', extra_label: '',
          price_usd: '', price_display: '', price_eur_eq: '', price_ils_eq: '',
          image: '', images: [], visible: true, featured: false, signature: false, off_market: false
        }
      : STATE.listings[idx];

    $('#editorTitle').textContent = isNew ? 'Nouvelle annonce' : 'Modifier · ' + (l.ref || '');
    $('#deleteBtn').style.display = isNew ? 'none' : '';

    // Fill fields
    $('#fRef').value = l.ref || '';
    $('#fCity').value = l.city || 'tel-aviv';
    $('#fType').value = l.type || 'appartement';
    $('#fNeighborhood').value = l.neighborhood || '';
    $('#fTitleMain').value = l.title_main || '';
    $('#fTitleAccent').value = l.title_accent || '';
    $('#fDescription').value = l.description || '';
    $('#fSurface').value = l.surface || '';
    $('#fRooms').value = l.rooms || '';
    $('#fExtra').value = l.extra_label || '';
    $('#fPriceUsd').value = l.price_usd || '';
    $('#fPriceDisplay').value = l.price_display || '';
    $('#fPriceEur').value = l.price_eur_eq || '';
    $('#fPriceIls').value = l.price_ils_eq || '';
    $('#fImage').value = l.image || '';
    $('#fVisible').checked = l.visible !== false;
    $('#fFeatured').checked = l.featured === true;
    $('#fSignature').checked = l.signature === true;
    $('#fOffMarket').checked = l.off_market === true;

    setImagePreview(l.image || null);

    showView('editor');
    window.scrollTo(0, 0);
  }

  function setImagePreview(url) {
    const p = $('#imagePreview');
    if (url) {
      p.style.backgroundImage = "url('" + url.replace(/'/g, "\\'") + "')";
      p.innerHTML = '';
    } else {
      p.style.backgroundImage = '';
      p.innerHTML = '<div class="image-empty">Aucune photo</div>';
    }
  }

  // Read form back into a listing object
  function readForm(base) {
    const id = (base && base.id) || slugify(($('#fTitleMain').value + '-' + $('#fTitleAccent').value) || $('#fRef').value || 'listing');
    const obj = Object.assign({}, base || {}, {
      id: id,
      ref: $('#fRef').value.trim(),
      city: $('#fCity').value,
      type: $('#fType').value,
      neighborhood: $('#fNeighborhood').value.trim(),
      title_main: $('#fTitleMain').value.trim(),
      title_accent: $('#fTitleAccent').value.trim(),
      description: $('#fDescription').value.trim(),
      surface: $('#fSurface').value.trim(),
      rooms: $('#fRooms').value.trim(),
      extra_label: $('#fExtra').value.trim(),
      price_usd: $('#fPriceUsd').value ? parseFloat($('#fPriceUsd').value) : '',
      price_display: $('#fPriceDisplay').value.trim(),
      price_eur_eq: $('#fPriceEur').value.trim(),
      price_ils_eq: $('#fPriceIls').value.trim(),
      image: $('#fImage').value.trim(),
      visible: $('#fVisible').checked,
      featured: $('#fFeatured').checked,
      signature: $('#fSignature').checked,
      off_market: $('#fOffMarket').checked,
      updated_at: new Date().toISOString().slice(0, 10)
    });
    if (!obj.created_at) obj.created_at = obj.updated_at;
    return obj;
  }

  async function uploadPendingImage(listingId) {
    if (!STATE.pendingImage) return null;
    const { base64, ext } = STATE.pendingImage;
    const filename = slugify(listingId) + '-' + Date.now().toString(36) + '.' + ext;
    const path = IMG_DIR + '/' + filename;
    $('#uploadProgress').hidden = false;
    $('#uploadProgress').textContent = 'Téléversement de l\'image…';
    await ghUploadBinary(path, base64, 'admin: upload ' + filename);
    $('#uploadProgress').textContent = 'Image téléversée ✓';
    setTimeout(() => { $('#uploadProgress').hidden = true; }, 2000);
    // Return the relative path for the listing.image field
    return path;
  }

  async function saveEditor() {
    const isNew = STATE.currentEdit === 'new';
    const base = isNew ? null : STATE.listings[STATE.currentEdit];

    if (!$('#fTitleMain').value.trim()) {
      toast('Le titre principal est requis.', 'error');
      $('#fTitleMain').focus();
      return;
    }

    const saveBtn = $('#saveBtn');
    saveBtn.disabled = true;
    const oldText = saveBtn.textContent;
    saveBtn.textContent = '⏳ Enregistrement…';

    try {
      let listing = readForm(base);

      // Ensure unique featured-on-home (not strictly required, just helpful)
      if (listing.featured) {
        STATE.listings.forEach((other, i) => {
          if (i !== STATE.currentEdit && other.featured) other.featured = false;
        });
      }

      // Upload image if pending
      if (STATE.pendingImage) {
        try {
          const newPath = await uploadPendingImage(listing.id);
          listing.image = newPath;
        } catch (e) {
          throw new Error('Échec upload image : ' + e.message);
        }
      }

      // Insert / replace in state
      if (isNew) {
        STATE.listings.push(listing);
      } else {
        STATE.listings[STATE.currentEdit] = listing;
      }

      // Ensure unique signature
      if (listing.signature) {
        STATE.listings.forEach((other, i) => {
          if (i !== (isNew ? STATE.listings.length - 1 : STATE.currentEdit) && other.signature) other.signature = false;
        });
      }

      const message = isNew
        ? 'admin: add listing ' + (listing.ref || listing.id)
        : 'admin: update listing ' + (listing.ref || listing.id);
      await saveListings(message);

      toast('Modifications enregistrées. Le site se met à jour dans 1–2 min.', 'success', 'Enregistré');
      // Stay on the editor to allow further tweaks; or back to list:
      backToDashboard();
    } catch (e) {
      console.error(e);
      toast(e.message || 'Erreur inconnue', 'error', 'Échec');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = oldText;
    }
  }

  async function deleteCurrent() {
    if (STATE.currentEdit === 'new') { backToDashboard(); return; }
    const idx = STATE.currentEdit;
    const l = STATE.listings[idx];
    const ok = await confirmModal('Supprimer cette annonce ?', 'L\'annonce "' + (l.title_main + ' ' + (l.title_accent || '')).trim() + '" (' + (l.ref || '') + ') sera retirée du site. Cette action peut être annulée en restaurant le commit GitHub.');
    if (!ok) return;
    STATE.listings.splice(idx, 1);
    try {
      await saveListings('admin: delete listing ' + (l.ref || l.id));
      toast('Annonce supprimée.', 'success', 'Supprimé');
      backToDashboard();
    } catch (e) {
      // Roll back
      STATE.listings.splice(idx, 0, l);
      toast(e.message || 'Erreur de suppression', 'error', 'Échec');
    }
  }

  function backToDashboard() {
    STATE.currentEdit = null;
    STATE.pendingImage = null;
    showView('dashboard');
    renderTable();
    updateStats();
  }

  // ---- IMAGE UPLOAD HANDLER ------------------------------------------------
  function handleFileSelect(file) {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast('Image trop lourde (> 4 MB). Compressez-la d\'abord.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target.result;
      // Extract MIME and base64
      const m = dataUrl.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
      if (!m) { toast('Format d\'image non reconnu.', 'error'); return; }
      const mime = m[1];
      const base64 = m[2];
      const ext = mime.split('/').pop().replace('jpeg', 'jpg');
      STATE.pendingImage = { mime, base64, ext };
      setImagePreview(dataUrl);
      $('#fImage').value = '(image téléversée à l\'enregistrement)';
      toast('Photo prête. Cliquez sur Enregistrer pour publier.', null, 'Photo en attente');
    };
    reader.readAsDataURL(file);
  }

  // ---- SETTINGS ------------------------------------------------------------
  function refreshSettings() {
    $('#settingRepo').textContent = STATE.repo;
    $('#settingBranch').textContent = STATE.branch;
    const t = STATE.token;
    $('#settingTokenMasked').textContent = t ? (t.slice(0, 4) + '…' + t.slice(-4)) : '— non défini';
    $('#userTag').textContent = '@' + STATE.repo.split('/')[0];
  }

  async function changeToken() {
    const newTok = prompt('Nouveau token GitHub (commencer par ghp_…) :');
    if (!newTok) return;
    STATE.token = newTok.trim();
    localStorage.setItem(STORAGE_TOKEN, STATE.token);
    refreshSettings();
    try {
      await ghVerifyAccess();
      toast('Token mis à jour.', 'success');
      await loadListings();
      renderTable();
      updateStats();
    } catch (e) {
      toast('Token invalide ou sans accès au dépôt.', 'error');
    }
  }

  async function changePassword() {
    const cur = prompt('Mot de passe actuel :');
    if (!cur) return;
    const stored = localStorage.getItem(STORAGE_PWHASH);
    const curHash = await sha256(cur);
    if (stored !== curHash) { toast('Mot de passe incorrect.', 'error'); return; }
    const next = prompt('Nouveau mot de passe :');
    if (!next || next.length < 4) { toast('Mot de passe trop court (min. 4 caractères).', 'error'); return; }
    localStorage.setItem(STORAGE_PWHASH, await sha256(next));
    toast('Mot de passe modifié.', 'success');
  }

  // ---- WIRING --------------------------------------------------------------
  function bindLogin() {
    // Pre-fill saved values
    $('#loginRepo').value = STATE.repo;
    $('#loginBranch').value = STATE.branch;
    if (STATE.token) {
      $('#loginToken').placeholder = '••••••• (déjà mémorisé)';
    }

    $('#loginForm').addEventListener('submit', async e => {
      e.preventDefault();
      $('#loginError').hidden = true;

      const pw = $('#loginPassword').value;
      const tok = $('#loginToken').value.trim();
      const repo = $('#loginRepo').value.trim();
      const branch = $('#loginBranch').value.trim() || 'main';

      if (!pw) return;

      // Update repo/branch if changed
      if (repo) { STATE.repo = repo; localStorage.setItem(STORAGE_REPO, repo); }
      if (branch) { STATE.branch = branch; localStorage.setItem(STORAGE_BRANCH, branch); }
      if (tok) { STATE.token = tok; localStorage.setItem(STORAGE_TOKEN, tok); }

      // Check password
      const okPw = await tryLogin(pw);
      if (!okPw) {
        $('#loginError').textContent = 'Mot de passe incorrect.';
        $('#loginError').hidden = false;
        return;
      }

      // Check GitHub access
      if (!STATE.token) {
        $('#loginError').textContent = 'Aucun token GitHub configuré. Renseignez-le dans les réglages avancés.';
        $('#loginError').hidden = false;
        return;
      }

      try {
        await ghVerifyAccess();
      } catch (e) {
        $('#loginError').textContent = 'Token GitHub invalide ou dépôt inaccessible : ' + e.message;
        $('#loginError').hidden = false;
        return;
      }

      setSession();
      await enterDashboard();
    });
  }

  async function enterDashboard() {
    showView('dashboard');
    refreshSettings();
    try {
      await loadListings();
      renderTable();
      updateStats();
    } catch (e) { /* already toasted */ }
  }

  function bindDashboard() {
    $('#logoutBtn').addEventListener('click', logout);
    $('#reloadBtn').addEventListener('click', async () => {
      await loadListings();
      renderTable();
      updateStats();
      toast('Données rechargées.', 'success');
    });
    $('#newListingBtn').addEventListener('click', () => openEditor('new'));
    $('#searchInput').addEventListener('input', renderTable);
    $('#filterCity').addEventListener('change', renderTable);
    $('#filterType').addEventListener('change', renderTable);

    $$('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.nav-btn').forEach(b => b.classList.toggle('active', b === btn));
        const tab = btn.dataset.tab;
        $$('.tab-pane').forEach(p => { p.hidden = p.dataset.tabPane !== tab; });
      });
    });

    $('#changeTokenBtn').addEventListener('click', changeToken);
    $('#changePasswordBtn').addEventListener('click', changePassword);
  }

  function bindEditor() {
    $('#editorBackBtn').addEventListener('click', backToDashboard);
    $('#saveBtn').addEventListener('click', saveEditor);
    $('#deleteBtn').addEventListener('click', deleteCurrent);
    $('#fileUpload').addEventListener('change', e => handleFileSelect(e.target.files[0]));
    $('#fImage').addEventListener('change', () => {
      if ($('#fImage').value && !STATE.pendingImage) setImagePreview($('#fImage').value);
    });
    // Auto price_display from price_usd
    $('#fPriceUsd').addEventListener('blur', () => {
      const v = parseFloat($('#fPriceUsd').value);
      if (!v || $('#fPriceDisplay').value) return;
      const m = v / 1_000_000;
      $('#fPriceDisplay').value = '$' + (m % 1 === 0 ? m.toFixed(1) : m.toFixed(2)) + 'M';
    });
  }

  // ---- BOOT ----------------------------------------------------------------
  function boot() {
    bindLogin();
    bindDashboard();
    bindEditor();

    if (isSessionValid() && STATE.token) {
      enterDashboard();
    } else {
      showView('login');
      $('#loginPassword').focus();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
