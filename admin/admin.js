/* ==========================================================================
   SHAHAR LEVI Real Estate — Admin SPA
   Supabase Auth + Postgres listings + Storage for images.
   ========================================================================== */

(function () {
  'use strict';

  if (!window.SL_SUPABASE) { alert('Configuration Supabase manquante.'); return; }
  if (!window.supabase || !window.supabase.createClient) { alert('SDK Supabase manquant — vérifiez votre connexion.'); return; }

  const sb = window.supabase.createClient(window.SL_SUPABASE.url, window.SL_SUPABASE.key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: window.localStorage,
      storageKey: 'sl-admin-session'
    }
  });

  const BUCKET = 'listing-images';

  // ---- STATE ---------------------------------------------------------------
  const STATE = {
    listings: [],
    currentEdit: null,    // row in STATE.listings or 'new'
    pendingFile: null,
    user: null
  };

  // ---- UTILS ---------------------------------------------------------------
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function showView(name) {
    $$('.view').forEach(v => { v.hidden = v.dataset.view !== name; });
  }

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function slugify(s) {
    return (s || '')
      .toString()
      .normalize('NFKD').replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || ('listing-' + Date.now().toString(36));
  }

  function toast(msg, kind, title) {
    const t = document.createElement('div');
    t.className = 'toast' + (kind ? ' ' + kind : '');
    t.innerHTML = (title ? '<strong>' + escapeHtml(title) + '</strong>' : '') + escapeHtml(msg);
    $('#toastHost').appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(20px)'; t.style.transition = 'all 0.4s'; }, 3500);
    setTimeout(() => t.remove(), 4000);
  }

  function confirmModal(title, body) {
    return new Promise(resolve => {
      $('#confirmTitle').textContent = title;
      $('#confirmBody').textContent = body;
      const m = $('#confirmModal');
      m.hidden = false;
      const ok = $('#confirmOk'), cancel = $('#confirmCancel');
      function close(v) { m.hidden = true; ok.removeEventListener('click', okH); cancel.removeEventListener('click', cancelH); resolve(v); }
      function okH() { close(true); }
      function cancelH() { close(false); }
      ok.addEventListener('click', okH);
      cancel.addEventListener('click', cancelH);
    });
  }

  function priceLabel(l) {
    if (l.price_display) return l.price_display;
    if (typeof l.price_usd === 'number' && l.price_usd > 0) {
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

  function imageUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    return window.SL_SUPABASE.url + '/storage/v1/object/public/' + BUCKET + '/' + path.replace(/^\/+/, '');
  }

  // ---- AUTH ----------------------------------------------------------------
  async function tryLogin(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function logout() {
    await sb.auth.signOut();
    STATE.user = null;
    showView('login');
    $('#loginPassword').value = '';
    $('#loginEmail').focus();
  }

  // ---- LOAD / SAVE ---------------------------------------------------------
  async function loadListings() {
    const { data, error } = await sb
      .from('listings')
      .select('*')
      .order('position', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) {
      console.error(error);
      toast('Impossible de charger les annonces : ' + error.message, 'error', 'Erreur');
      throw error;
    }
    STATE.listings = data || [];
    return STATE.listings;
  }

  // ---- RENDER --------------------------------------------------------------
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
          const blob = ((l.title_main || '') + ' ' + (l.title_accent || '') + ' ' + (l.ref || '') + ' ' + (l.neighborhood || '') + ' ' + (l.city || '')).toLowerCase();
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
        '  <div class="thumb" style="background-image: url(\'', escapeHtml(imageUrl(l.image)), '\')"></div>',
        '  <div class="info">',
        '    <div class="title">', escapeHtml(l.title_main || ''), ' <em>', escapeHtml(l.title_accent || ''), '</em></div>',
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
        if (act === 'duplicate') return duplicate(i);
        openEditor(i);
      });
    });
  }

  async function duplicate(i) {
    const src = STATE.listings[i];
    const copy = Object.assign({}, src);
    delete copy.id;
    delete copy.created_at;
    delete copy.updated_at;
    copy.slug = slugify((src.slug || src.title_main) + '-copie-' + Date.now().toString(36));
    copy.ref = (src.ref || 'SL') + '·';
    copy.featured = false;
    copy.signature = false;
    copy.visible = false;
    const { data, error } = await sb.from('listings').insert(copy).select().single();
    if (error) { toast(error.message, 'error', 'Erreur'); return; }
    STATE.listings.splice(i + 1, 0, data);
    renderTable();
    updateStats();
    toast('Annonce dupliquée — pensez à la modifier.', 'success', 'Dupliqué');
    openEditor(STATE.listings.indexOf(data));
  }

  // ---- EDITOR --------------------------------------------------------------
  function openEditor(idx) {
    STATE.currentEdit = idx;
    STATE.pendingFile = null;
    const isNew = idx === 'new';
    const l = isNew
      ? {
          slug: '', ref: '', city: 'tel-aviv', type: 'appartement', neighborhood: '',
          title_main: '', title_accent: '', description: '',
          surface: '', rooms: '', extra_label: '',
          price_usd: null, price_display: '', price_eur_eq: '', price_ils_eq: '',
          image: '', visible: true, featured: false, signature: false, off_market: false
        }
      : STATE.listings[idx];

    $('#editorTitle').textContent = isNew ? 'Nouvelle annonce' : 'Modifier · ' + (l.ref || '');
    $('#deleteBtn').style.display = isNew ? 'none' : '';

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
    $('#fPriceUsd').value = l.price_usd != null ? l.price_usd : '';
    $('#fPriceDisplay').value = l.price_display || '';
    $('#fPriceEur').value = l.price_eur_eq || '';
    $('#fPriceIls').value = l.price_ils_eq || '';
    $('#fImage').value = l.image || '';
    $('#fVisible').checked = l.visible !== false;
    $('#fFeatured').checked = l.featured === true;
    $('#fSignature').checked = l.signature === true;
    $('#fOffMarket').checked = l.off_market === true;

    setImagePreview(imageUrl(l.image));
    $('#uploadProgress').hidden = true;

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

  function readForm(base) {
    const titleSlug = ($('#fTitleMain').value + '-' + $('#fTitleAccent').value).trim();
    const slug = (base && base.slug) || slugify(titleSlug || $('#fRef').value || 'listing');
    const priceUsd = $('#fPriceUsd').value ? parseFloat($('#fPriceUsd').value) : null;
    return {
      slug,
      ref: $('#fRef').value.trim() || null,
      city: $('#fCity').value,
      type: $('#fType').value,
      neighborhood: $('#fNeighborhood').value.trim() || null,
      title_main: $('#fTitleMain').value.trim(),
      title_accent: $('#fTitleAccent').value.trim() || null,
      description: $('#fDescription').value.trim() || null,
      surface: $('#fSurface').value.trim() || null,
      rooms: $('#fRooms').value.trim() || null,
      extra_label: $('#fExtra').value.trim() || null,
      price_usd: priceUsd,
      price_display: $('#fPriceDisplay').value.trim() || null,
      price_eur_eq: $('#fPriceEur').value.trim() || null,
      price_ils_eq: $('#fPriceIls').value.trim() || null,
      image: $('#fImage').value.trim() || null,
      visible: $('#fVisible').checked,
      featured: $('#fFeatured').checked,
      signature: $('#fSignature').checked,
      off_market: $('#fOffMarket').checked
    };
  }

  async function uploadImage(slug, file) {
    $('#uploadProgress').hidden = false;
    $('#uploadProgress').textContent = 'Téléversement de la photo…';
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace('jpeg', 'jpg');
    const path = slug + '/' + Date.now().toString(36) + '.' + ext;
    const { error } = await sb.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg'
    });
    if (error) {
      $('#uploadProgress').textContent = 'Erreur : ' + error.message;
      throw error;
    }
    $('#uploadProgress').textContent = 'Photo téléversée ✓';
    setTimeout(() => { $('#uploadProgress').hidden = true; }, 1800);
    return path; // stored relative — listings.js builds the public URL
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
      let payload = readForm(base);

      // If a file is pending, upload then attach the path
      if (STATE.pendingFile) {
        const path = await uploadImage(payload.slug, STATE.pendingFile);
        payload.image = path;
      }

      // Featured uniqueness on home: clear other featured if this becomes featured
      if (payload.featured && !base?.featured) {
        await sb.from('listings').update({ featured: false }).neq('id', base?.id || '00000000-0000-0000-0000-000000000000').eq('featured', true);
      }
      // Signature uniqueness
      if (payload.signature && !base?.signature) {
        await sb.from('listings').update({ signature: false }).neq('id', base?.id || '00000000-0000-0000-0000-000000000000').eq('signature', true);
      }

      let saved;
      if (isNew) {
        const maxPos = STATE.listings.reduce((m, x) => Math.max(m, x.position || 0), 0);
        payload.position = maxPos + 1;
        const { data, error } = await sb.from('listings').insert(payload).select().single();
        if (error) throw error;
        saved = data;
      } else {
        const { data, error } = await sb.from('listings').update(payload).eq('id', base.id).select().single();
        if (error) throw error;
        saved = data;
      }

      // Refresh state and go back
      await loadListings();
      renderTable();
      updateStats();
      toast('Modifications enregistrées. Le site se met à jour immédiatement.', 'success', 'Enregistré');
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
    if (STATE.currentEdit === 'new') return backToDashboard();
    const idx = STATE.currentEdit;
    const l = STATE.listings[idx];
    const ok = await confirmModal('Supprimer cette annonce ?', '"' + (l.title_main + ' ' + (l.title_accent || '')).trim() + '" (' + (l.ref || '') + ') sera définitivement retirée du site.');
    if (!ok) return;
    const { error } = await sb.from('listings').delete().eq('id', l.id);
    if (error) { toast(error.message, 'error', 'Échec'); return; }
    STATE.listings.splice(idx, 1);
    toast('Annonce supprimée.', 'success', 'Supprimé');
    backToDashboard();
  }

  function backToDashboard() {
    STATE.currentEdit = null;
    STATE.pendingFile = null;
    showView('dashboard');
    renderTable();
    updateStats();
  }

  function handleFileSelect(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast('Image trop lourde (> 5 MB). Compressez-la d\'abord.', 'error');
      return;
    }
    STATE.pendingFile = file;
    const reader = new FileReader();
    reader.onload = e => {
      setImagePreview(e.target.result);
      $('#fImage').value = '(téléversement à l\'enregistrement)';
    };
    reader.readAsDataURL(file);
    toast('Photo prête. Cliquez Enregistrer pour publier.', null, 'Photo en attente');
  }

  // ---- BOOT ----------------------------------------------------------------
  function bindEvents() {
    // Login
    $('#loginForm').addEventListener('submit', async e => {
      e.preventDefault();
      $('#loginError').hidden = true;
      const email = $('#loginEmail').value.trim();
      const password = $('#loginPassword').value;
      const btn = $('#loginSubmit');
      btn.disabled = true;
      const oldText = btn.textContent;
      btn.textContent = '⏳ Connexion…';
      try {
        await tryLogin(email, password);
        await enterDashboard();
      } catch (err) {
        $('#loginError').textContent = err.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect.'
          : err.message;
        $('#loginError').hidden = false;
      } finally {
        btn.disabled = false;
        btn.textContent = oldText;
      }
    });

    // Dashboard
    $('#logoutBtn').addEventListener('click', logout);
    $('#reloadBtn').addEventListener('click', async () => {
      try { await loadListings(); renderTable(); updateStats(); toast('Données rechargées.', 'success'); }
      catch (_) {}
    });
    $('#newListingBtn').addEventListener('click', () => openEditor('new'));
    $('#searchInput').addEventListener('input', renderTable);
    $('#filterCity').addEventListener('change', renderTable);
    $('#filterType').addEventListener('change', renderTable);

    // Editor
    $('#editorBackBtn').addEventListener('click', backToDashboard);
    $('#saveBtn').addEventListener('click', saveEditor);
    $('#deleteBtn').addEventListener('click', deleteCurrent);
    $('#fileUpload').addEventListener('change', e => handleFileSelect(e.target.files[0]));
    $('#fImage').addEventListener('change', () => {
      if ($('#fImage').value && !STATE.pendingFile && !$('#fImage').value.startsWith('(')) setImagePreview($('#fImage').value);
    });
    $('#fPriceUsd').addEventListener('blur', () => {
      const v = parseFloat($('#fPriceUsd').value);
      if (!v || $('#fPriceDisplay').value) return;
      const m = v / 1_000_000;
      $('#fPriceDisplay').value = '$' + (m % 1 === 0 ? m.toFixed(1) : m.toFixed(2)) + 'M';
    });
  }

  async function enterDashboard() {
    STATE.user = (await sb.auth.getUser()).data.user;
    $('#userTag').textContent = STATE.user?.email || '—';
    showView('dashboard');
    try {
      await loadListings();
      renderTable();
      updateStats();
    } catch (_) { /* already toasted */ }
  }

  async function boot() {
    bindEvents();
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
      await enterDashboard();
    } else {
      showView('login');
      $('#loginEmail').focus();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
