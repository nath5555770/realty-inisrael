/* ==========================================================================
   SHAHAR LEVI · Admin SPA v2
   - Supabase Auth + RLS
   - Tabs: Listings, Journal, Team
   - Audit trail (created_by/updated_by) shown on every record
   - Team CRUD via Edge Function /functions/v1/admin-agent (admin only)
   ========================================================================== */
(function () {
  'use strict';

  if (!window.SL_SUPABASE) { alert('Configuration Supabase manquante.'); return; }
  if (!window.supabase || !window.supabase.createClient) { alert('SDK Supabase non chargé.'); return; }

  const sb = window.supabase.createClient(window.SL_SUPABASE.url, window.SL_SUPABASE.key, {
    auth: { persistSession: true, autoRefreshToken: true, storage: window.localStorage, storageKey: 'sl-admin-session' }
  });

  const BUCKET_LISTINGS = 'listing-images';
  const BUCKET_ARTICLES = 'article-images';
  const BUCKET_TEAM = 'team-photos';
  const FN_ADMIN_AGENT = window.SL_SUPABASE.url + '/functions/v1/admin-agent';

  // ------------------------------------------------------------------
  // STATE
  // ------------------------------------------------------------------
  const STATE = {
    user: null,
    profile: null,         // { id, email, full_name, role, is_active }
    profilesById: {},      // id => profile (for author display)
    profilesList: [],
    listings: [],
    currentListing: null,  // index | 'new'
    pendingListingFile: null,
    articles: [],
    currentArticle: null,  // index | 'new'
    pendingArticleFile: null,
    currentAgent: null     // index | 'new'
  };

  // ------------------------------------------------------------------
  // UTILS
  // ------------------------------------------------------------------
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function slugify(s) {
    return (s || '').toString()
      .normalize('NFKD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'item-' + Date.now().toString(36);
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: '2-digit' }); }
    catch (_) { return '—'; }
  }

  function authorLabel(id) {
    const p = STATE.profilesById[id];
    if (!p) return '—';
    return p.full_name || p.email || id.slice(0, 8);
  }

  function showView(name) {
    $$('.view').forEach(v => { v.hidden = v.dataset.view !== name; });
    const topbar = $('header.topbar');
    if (topbar) topbar.hidden = (name === 'login');
  }

  function showTab(name) {
    $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
    $$('.tab-pane').forEach(p => { p.hidden = p.dataset.tabPane !== name; });
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
    // price_usd is now a shekel amount (column name kept for legacy).
    // price_display (legacy "$14.8M" strings) is intentionally ignored.
    if (typeof l.price_usd === 'number' && l.price_usd > 0) {
      const m = l.price_usd / 1_000_000;
      return (m >= 100 ? m.toFixed(0) : m % 1 === 0 ? m.toFixed(1) : m.toFixed(1)) + ' M ₪';
    }
    return '—';
  }
  function cityLabel(slug) { return ({'tel-aviv':'Tel Aviv','herzliya':'Herzliya','caesarea':'Caesarea','netanya':'Netanya','jerusalem':'Jérusalem'})[slug] || slug; }
  function imageUrl(bucket, path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    return window.SL_SUPABASE.url + '/storage/v1/object/public/' + bucket + '/' + path.replace(/^\/+/, '');
  }

  // ------------------------------------------------------------------
  // AUTH
  // ------------------------------------------------------------------
  async function loadProfile() {
    const { data: { user } } = await sb.auth.getUser();
    STATE.user = user;
    if (!user) return null;
    const { data, error } = await sb.from('profiles').select('*').eq('id', user.id).single();
    if (error) { console.error(error); return null; }
    STATE.profile = data;
    return data;
  }

  async function loadAllProfiles() {
    const { data, error } = await sb.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) { console.error(error); return []; }
    STATE.profilesList = data;
    STATE.profilesById = {};
    data.forEach(p => { STATE.profilesById[p.id] = p; });
    return data;
  }

  async function logout() {
    await sb.auth.signOut();
    STATE.user = null;
    STATE.profile = null;
    showView('login');
    $('#loginPassword').value = '';
    $('#loginEmail').focus();
  }

  // ------------------------------------------------------------------
  // LISTINGS
  // ------------------------------------------------------------------
  async function loadListings() {
    const { data, error } = await sb.from('listings').select('*')
      .order('position', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) { toast(error.message, 'error', 'Erreur'); throw error; }
    STATE.listings = data || [];
    return data;
  }

  function listingsStats() {
    const s = STATE.listings;
    $('#statTotal').textContent = s.length;
    $('#statVisible').textContent = s.filter(x => x.visible !== false).length;
    $('#statFeatured').textContent = s.filter(x => x.featured).length;
    $('#statHidden').textContent = s.filter(x => x.visible === false).length;
    $('#statOff').textContent = s.filter(x => x.off_market).length;
  }

  function renderListingsAuthorFilter() {
    const sel = $('#filterAuthor');
    if (!sel) return;
    const cur = sel.value;
    const ids = new Set();
    STATE.listings.forEach(l => { if (l.created_by) ids.add(l.created_by); });
    sel.innerHTML = '<option value="">Tous les agents</option>' +
      Array.from(ids).map(id => '<option value="' + escapeHtml(id) + '">' + escapeHtml(authorLabel(id)) + '</option>').join('');
    sel.value = cur || '';
  }

  function renderListingsTable() {
    const search = ($('#searchInput').value || '').trim().toLowerCase();
    const city = $('#filterCity').value;
    const type = $('#filterType').value;
    const author = $('#filterAuthor').value;
    const filtered = STATE.listings.map((l, i) => ({ l, i })).filter(({ l }) => {
      if (city && l.city !== city) return false;
      if (type && l.type !== type) return false;
      if (author && l.created_by !== author) return false;
      if (search) {
        const blob = ((l.title_main||'') + ' ' + (l.title_accent||'') + ' ' + (l.ref||'') + ' ' + (l.neighborhood||'') + ' ' + (l.city||'')).toLowerCase();
        if (!blob.includes(search)) return false;
      }
      return true;
    });
    const root = $('#listingsTable');
    if (!filtered.length) {
      root.innerHTML = '<div class="empty-state"><div class="display">Aucun résultat</div><p>Essayez d\'élargir votre recherche.</p></div>';
      return;
    }
    root.innerHTML = filtered.map(({ l, i }) => {
      const badges = [];
      if (l.signature) badges.push('<span class="badge badge-signature">★ Signature</span>');
      if (l.featured) badges.push('<span class="badge badge-featured">À la une</span>');
      if (l.visible === false) badges.push('<span class="badge badge-hidden">Masquée</span>');
      if (l.off_market) badges.push('<span class="badge badge-off">Off-market</span>');
      return '<div class="listing-row" data-i="' + i + '">' +
        '<div class="thumb" style="background-image:url(\'' + escapeHtml(imageUrl(BUCKET_LISTINGS, l.image)) + '\')"></div>' +
        '<div class="info">' +
          '<div class="title">' + escapeHtml(l.title_main || '') + ' <em>' + escapeHtml(l.title_accent || '') + '</em></div>' +
          '<div class="sub">' + escapeHtml(l.ref || '') + ' · ' + escapeHtml(l.neighborhood || '') + ' · par <em>' + escapeHtml(authorLabel(l.created_by)) + '</em></div>' +
        '</div>' +
        '<div class="city-tag">' + cityLabel(l.city) + '</div>' +
        '<div class="badges">' + badges.join('') + '</div>' +
        '<div class="price">' + priceLabel(l) + '</div>' +
        '<div class="row-actions">' +
          '<button class="icon-btn" data-act="edit" title="Modifier">✎</button>' +
          '<button class="icon-btn" data-act="duplicate" title="Dupliquer">⎘</button>' +
        '</div>' +
      '</div>';
    }).join('');
    root.querySelectorAll('.listing-row').forEach(row => {
      row.addEventListener('click', e => {
        const i = parseInt(row.dataset.i, 10);
        const act = e.target.closest('[data-act]')?.dataset.act;
        if (act === 'duplicate') return duplicateListing(i);
        openListingEditor(i);
      });
    });
  }

  async function duplicateListing(i) {
    const src = STATE.listings[i];
    const copy = Object.assign({}, src);
    delete copy.id; delete copy.created_at; delete copy.updated_at; delete copy.created_by; delete copy.updated_by;
    copy.slug = slugify((src.slug || src.title_main) + '-copie-' + Date.now().toString(36));
    copy.ref = (src.ref || 'SL') + '·';
    copy.featured = false; copy.signature = false; copy.visible = false;
    const { data, error } = await sb.from('listings').insert(copy).select().single();
    if (error) { toast(error.message, 'error'); return; }
    await loadListings();
    listingsStats();
    renderListingsTable();
    toast('Annonce dupliquée — pensez à la modifier.', 'success');
    openListingEditor(STATE.listings.findIndex(x => x.id === data.id));
  }

  function openListingEditor(idx) {
    STATE.currentListing = idx;
    STATE.pendingListingFile = null;
    const isNew = idx === 'new';
    const l = isNew
      ? { city: 'tel-aviv', type: 'appartement', kind: 'occasion', deal: 'sale', visible: true, featured: false, signature: false, off_market: false }
      : STATE.listings[idx];
    $('#editorTitle').textContent = isNew ? 'Nouvelle annonce' : 'Modifier · ' + (l.ref || '');
    $('#deleteBtn').hidden = isNew;
    $('#fRef').value = l.ref || '';
    $('#fCity').value = l.city || 'tel-aviv';
    $('#fType').value = l.type || 'appartement';
    $('#fKind').value = l.kind || 'occasion';
    $('#fDeal').value = l.deal || 'sale';
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
    $('#fFeatured').checked = !!l.featured;
    $('#fSignature').checked = !!l.signature;
    $('#fOffMarket').checked = !!l.off_market;
    $('#fHasElevator').checked = !!l.has_elevator;
    setListingPreview(imageUrl(BUCKET_LISTINGS, l.image));
    $('#uploadProgress').hidden = true;

    if (!isNew) {
      $('#metaGroup').hidden = false;
      $('#metaCreatedBy').textContent = authorLabel(l.created_by) + ' · ' + fmtDate(l.created_at);
      $('#metaUpdatedBy').textContent = authorLabel(l.updated_by) + ' · ' + fmtDate(l.updated_at);
    } else {
      $('#metaGroup').hidden = true;
    }
    showView('editor');
    window.scrollTo(0, 0);
  }

  function setListingPreview(url) {
    const p = $('#imagePreview');
    if (url) { p.style.backgroundImage = "url('" + url.replace(/'/g, "\\'") + "')"; p.innerHTML = ''; }
    else { p.style.backgroundImage = ''; p.innerHTML = '<div class="image-empty">Aucune photo</div>'; }
  }

  function readListingForm(base) {
    const titleSlug = ($('#fTitleMain').value + '-' + $('#fTitleAccent').value).trim();
    const slug = (base && base.slug) || slugify(titleSlug || $('#fRef').value || 'listing');
    const priceUsd = $('#fPriceUsd').value ? parseFloat($('#fPriceUsd').value) : null;
    return {
      slug, ref: $('#fRef').value.trim() || null,
      city: $('#fCity').value, type: $('#fType').value,
      kind: $('#fKind').value || 'occasion',
      deal: $('#fDeal').value || 'sale',
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
      visible: $('#fVisible').checked, featured: $('#fFeatured').checked,
      signature: $('#fSignature').checked, off_market: $('#fOffMarket').checked,
      has_elevator: $('#fHasElevator').checked
    };
  }

  async function uploadImage(bucket, slug, file, progressEl) {
    progressEl.hidden = false;
    progressEl.textContent = 'Téléversement…';
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace('jpeg', 'jpg');
    const path = slug + '/' + Date.now().toString(36) + '.' + ext;
    const { error } = await sb.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type || 'image/jpeg' });
    if (error) { progressEl.textContent = 'Erreur : ' + error.message; throw error; }
    progressEl.textContent = 'Image téléversée ✓';
    setTimeout(() => { progressEl.hidden = true; }, 1800);
    return path;
  }

  async function saveListing() {
    const isNew = STATE.currentListing === 'new';
    const base = isNew ? null : STATE.listings[STATE.currentListing];
    if (!$('#fTitleMain').value.trim()) { toast('Le titre principal est requis.', 'error'); $('#fTitleMain').focus(); return; }
    const btn = $('#saveBtn'); btn.disabled = true; const old = btn.textContent; btn.textContent = '⏳ Enregistrement…';
    try {
      const payload = readListingForm(base);
      if (STATE.pendingListingFile) {
        payload.image = await uploadImage(BUCKET_LISTINGS, payload.slug, STATE.pendingListingFile, $('#uploadProgress'));
      }
      // 'featured' (À la une) is multi-select on purpose — the homepage
      // shows up to 3 featured listings, so users typically want 1–3 marked.
      // 'signature' stays exclusive (only one signature piece at a time).
      if (payload.signature && !base?.signature) {
        await sb.from('listings').update({ signature: false }).neq('id', base?.id || '00000000-0000-0000-0000-000000000000').eq('signature', true);
      }
      if (isNew) {
        const maxPos = STATE.listings.reduce((m, x) => Math.max(m, x.position || 0), 0);
        payload.position = maxPos + 1;
        const { error } = await sb.from('listings').insert(payload).select().single();
        if (error) throw error;
      } else {
        const { error } = await sb.from('listings').update(payload).eq('id', base.id).select().single();
        if (error) throw error;
      }
      await loadListings();
      listingsStats();
      renderListingsTable();
      renderListingsAuthorFilter();
      toast('Annonce enregistrée. Le site se met à jour immédiatement.', 'success', 'Enregistré');
      backToDashboard();
    } catch (e) {
      console.error(e);
      toast(e.message || 'Erreur', 'error', 'Échec');
    } finally {
      btn.disabled = false; btn.textContent = old;
    }
  }

  async function deleteListing() {
    if (STATE.currentListing === 'new') return backToDashboard();
    const l = STATE.listings[STATE.currentListing];
    const ok = await confirmModal('Supprimer cette annonce ?', '"' + (l.title_main + ' ' + (l.title_accent || '')).trim() + '" sera définitivement retirée.');
    if (!ok) return;
    const { error } = await sb.from('listings').delete().eq('id', l.id);
    if (error) { toast(error.message, 'error', 'Échec'); return; }
    toast('Annonce supprimée.', 'success');
    await loadListings();
    listingsStats();
    renderListingsTable();
    renderListingsAuthorFilter();
    backToDashboard();
  }

  // ------------------------------------------------------------------
  // ARTICLES (Journal)
  // ------------------------------------------------------------------
  async function loadArticles() {
    const { data, error } = await sb.from('journal_articles').select('*')
      .order('position', { ascending: true })
      .order('publish_date', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) { toast(error.message, 'error', 'Erreur'); throw error; }
    STATE.articles = data || [];
    return data;
  }

  function articlesStats() {
    const s = STATE.articles;
    $('#artStatTotal').textContent = s.length;
    $('#artStatPublished').textContent = s.filter(x => x.published).length;
    $('#artStatDraft').textContent = s.filter(x => !x.published).length;
  }

  function renderArticlesTable() {
    const search = ($('#artSearchInput').value || '').trim().toLowerCase();
    const cat = $('#artFilterCategory').value;
    const filtered = STATE.articles.map((a, i) => ({ a, i })).filter(({ a }) => {
      if (cat && a.category !== cat) return false;
      if (search) {
        const blob = ((a.title || '') + ' ' + (a.subtitle || '') + ' ' + (a.excerpt || '') + ' ' + (a.category || '')).toLowerCase();
        if (!blob.includes(search)) return false;
      }
      return true;
    });
    const root = $('#articlesTable');
    if (!filtered.length) {
      root.innerHTML = '<div class="empty-state"><div class="display">Aucun article</div><p>Cliquez sur "+ Nouvel article" pour démarrer.</p></div>';
      return;
    }
    root.innerHTML = filtered.map(({ a, i }) => {
      const badges = [];
      if (a.published) badges.push('<span class="badge badge-featured">Publié</span>');
      else badges.push('<span class="badge badge-hidden">Brouillon</span>');
      if (a.placement === 'featured') badges.push('<span class="badge badge-pinned">★ Article phare</span>');
      else if (a.placement === 'duo') badges.push('<span class="badge badge-duo">● Important</span>');
      else if (a.placement === 'hidden') badges.push('<span class="badge badge-off">⊘ Masqué</span>');
      if (a.category) badges.push('<span class="badge badge-off">' + escapeHtml(a.category) + '</span>');
      return '<div class="listing-row" data-i="' + i + '">' +
        '<div class="thumb" style="background-image:url(\'' + escapeHtml(imageUrl(BUCKET_ARTICLES, a.cover_image)) + '\')"></div>' +
        '<div class="info">' +
          '<div class="title">' + escapeHtml(a.title || '') + '</div>' +
          '<div class="sub">' + fmtDate(a.publish_date) + ' · par <em>' + escapeHtml(authorLabel(a.author_id)) + '</em>' + (a.read_minutes ? ' · ' + a.read_minutes + ' min' : '') + '</div>' +
        '</div>' +
        '<div class="city-tag"></div>' +
        '<div class="badges">' + badges.join('') + '</div>' +
        '<div class="price">—</div>' +
        '<div class="row-actions"><button class="icon-btn" data-act="edit">✎</button></div>' +
      '</div>';
    }).join('');
    root.querySelectorAll('.listing-row').forEach(row => {
      row.addEventListener('click', () => openArticleEditor(parseInt(row.dataset.i, 10)));
    });
  }

  function openArticleEditor(idx) {
    STATE.currentArticle = idx;
    STATE.pendingArticleFile = null;
    const isNew = idx === 'new';
    const a = isNew
      ? { category: 'marche', published: false, publish_date: new Date().toISOString().slice(0,10), placement: 'grid', display_order: 0 }
      : STATE.articles[idx];
    $('#artEditorTitle').textContent = isNew ? 'Nouvel article' : 'Modifier · ' + (a.title || '');
    $('#artDeleteBtn').hidden = isNew;
    $('#artCategory').value = a.category || 'marche';
    $('#artTitle').value = a.title || '';
    $('#artSubtitle').value = a.subtitle || '';
    $('#artExcerpt').value = a.excerpt || '';
    $('#artContent').value = a.content || '';
    $('#artReadMinutes').value = a.read_minutes || '';
    $('#artFImage').value = a.cover_image || '';
    $('#artPublished').checked = !!a.published;
    $('#artPublishDate').value = (a.publish_date || '').slice(0, 10) || new Date().toISOString().slice(0,10);
    // Placement
    const placement = a.placement || 'grid';
    document.querySelectorAll('input[name="artPlacement"]').forEach(r => r.checked = r.value === placement);
    $('#artDisplayOrder').value = a.display_order || 0;
    setArticlePreview(imageUrl(BUCKET_ARTICLES, a.cover_image));
    $('#artUploadProgress').hidden = true;
    if (!isNew) {
      $('#artMetaGroup').hidden = false;
      $('#artMetaAuthor').textContent = authorLabel(a.author_id) + ' · créé ' + fmtDate(a.created_at);
      $('#artMetaUpdatedBy').textContent = authorLabel(a.updated_by) + ' · ' + fmtDate(a.updated_at);
    } else { $('#artMetaGroup').hidden = true; }
    showView('article-editor');
    window.scrollTo(0, 0);
  }

  function setArticlePreview(url) {
    const p = $('#artImagePreview');
    if (url) { p.style.backgroundImage = "url('" + url.replace(/'/g, "\\'") + "')"; p.innerHTML = ''; }
    else { p.style.backgroundImage = ''; p.innerHTML = '<div class="image-empty">Aucune image</div>'; }
  }

  function readArticleForm(base) {
    const slug = (base && base.slug) || slugify($('#artTitle').value || 'article');
    const placementEl = document.querySelector('input[name="artPlacement"]:checked');
    return {
      slug,
      title: $('#artTitle').value.trim(),
      subtitle: $('#artSubtitle').value.trim() || null,
      excerpt: $('#artExcerpt').value.trim() || null,
      content: $('#artContent').value.trim() || null,
      category: $('#artCategory').value,
      read_minutes: $('#artReadMinutes').value ? parseInt($('#artReadMinutes').value, 10) : null,
      cover_image: $('#artFImage').value.trim() || null,
      published: $('#artPublished').checked,
      publish_date: $('#artPublishDate').value || null,
      placement: placementEl ? placementEl.value : 'grid',
      display_order: parseInt($('#artDisplayOrder').value || '0', 10) || 0
    };
  }

  async function saveArticle() {
    const isNew = STATE.currentArticle === 'new';
    const base = isNew ? null : STATE.articles[STATE.currentArticle];
    if (!$('#artTitle').value.trim()) { toast('Le titre est requis.', 'error'); return; }
    const btn = $('#artSaveBtn'); btn.disabled = true; const old = btn.textContent; btn.textContent = '⏳ Enregistrement…';
    try {
      const payload = readArticleForm(base);
      if (STATE.pendingArticleFile) {
        payload.cover_image = await uploadImage(BUCKET_ARTICLES, payload.slug, STATE.pendingArticleFile, $('#artUploadProgress'));
      }
      if (isNew) {
        const maxPos = STATE.articles.reduce((m, x) => Math.max(m, x.position || 0), 0);
        payload.position = maxPos + 1;
        const { error } = await sb.from('journal_articles').insert(payload).select().single();
        if (error) throw error;
      } else {
        const { error } = await sb.from('journal_articles').update(payload).eq('id', base.id).select().single();
        if (error) throw error;
      }
      await loadArticles();
      articlesStats();
      renderArticlesTable();
      toast('Article enregistré.', 'success', 'Enregistré');
      backToJournal();
    } catch (e) {
      console.error(e); toast(e.message || 'Erreur', 'error', 'Échec');
    } finally {
      btn.disabled = false; btn.textContent = old;
    }
  }

  async function deleteArticle() {
    if (STATE.currentArticle === 'new') return backToJournal();
    const a = STATE.articles[STATE.currentArticle];
    const ok = await confirmModal('Supprimer cet article ?', '"' + (a.title || '') + '" sera définitivement retiré.');
    if (!ok) return;
    const { error } = await sb.from('journal_articles').delete().eq('id', a.id);
    if (error) { toast(error.message, 'error'); return; }
    toast('Article supprimé.', 'success');
    await loadArticles();
    articlesStats();
    renderArticlesTable();
    backToJournal();
  }

  // ------------------------------------------------------------------
  // TEAM (admin only)
  // ------------------------------------------------------------------
  function renderTeamTable() {
    const root = $('#teamTable');
    const list = STATE.profilesList;
    if (!list.length) {
      root.innerHTML = '<div class="loading">Aucun agent.</div>';
      return;
    }
    root.innerHTML = list.map((p, i) => {
      const badges = [];
      if (p.role === 'admin') badges.push('<span class="badge badge-signature">Admin</span>');
      else badges.push('<span class="badge badge-off">Agent</span>');
      if (!p.is_active) badges.push('<span class="badge badge-hidden">Désactivé</span>');
      const initial = (p.full_name || p.email || '?').charAt(0).toUpperCase();
      return '<div class="listing-row team-row" data-i="' + i + '">' +
        '<div class="thumb avatar">' + escapeHtml(initial) + '</div>' +
        '<div class="info">' +
          '<div class="title">' + escapeHtml(p.full_name || p.email) + '</div>' +
          '<div class="sub">' + escapeHtml(p.email) + ' · créé ' + fmtDate(p.created_at) + '</div>' +
        '</div>' +
        '<div class="city-tag"></div>' +
        '<div class="badges">' + badges.join('') + '</div>' +
        '<div class="price">—</div>' +
        '<div class="row-actions"><button class="icon-btn" data-act="edit">✎</button></div>' +
      '</div>';
    }).join('');
    root.querySelectorAll('.listing-row').forEach(row => {
      row.addEventListener('click', () => openAgentEditor(parseInt(row.dataset.i, 10)));
    });
  }

  function genStrongPassword() {
    const alpha = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const sym = '!@-_+';
    let s = '';
    const arr = new Uint32Array(14);
    crypto.getRandomValues(arr);
    for (let i = 0; i < 12; i++) s += alpha.charAt(arr[i] % alpha.length);
    s += sym.charAt(arr[12] % sym.length);
    s += alpha.charAt(arr[13] % alpha.length);
    return s;
  }

  function openAgentEditor(idx) {
    STATE.currentAgent = idx;
    const isNew = idx === 'new';
    const p = isNew ? { role: 'agent', is_active: true } : STATE.profilesList[idx];
    $('#teamEditorTitle').textContent = isNew ? 'Nouvel agent' : 'Modifier · ' + (p.full_name || p.email);
    $('#teamDeleteBtn').hidden = isNew;
    $('#teamEmail').value = p.email || '';
    $('#teamEmail').disabled = !isNew; // can't change email of existing user via this UI
    $('#teamFullName').value = p.full_name || '';
    $('#teamPassword').value = '';
    $('#teamPassword').required = isNew;
    $('#teamPwdLbl').textContent = isNew ? 'Mot de passe (8 caractères minimum)' : 'Nouveau mot de passe (laisser vide pour ne pas changer)';
    $('#teamRole').value = p.role || 'agent';
    $('#teamActive').checked = p.is_active !== false;
    if (!isNew) {
      $('#teamMetaGroup').hidden = false;
      $('#teamMetaId').textContent = p.id;
      $('#teamMetaCreated').textContent = fmtDate(p.created_at);
    } else { $('#teamMetaGroup').hidden = true; }
    showView('team-editor');
    window.scrollTo(0, 0);
  }

  async function callAdminAgent(op, body) {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) throw new Error('Session expirée. Reconnectez-vous.');
    const r = await fetch(FN_ADMIN_AGENT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + session.access_token,
        'apikey': window.SL_SUPABASE.key
      },
      body: JSON.stringify(Object.assign({ op }, body))
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || ('HTTP ' + r.status));
    return data;
  }

  async function saveAgent() {
    const isNew = STATE.currentAgent === 'new';
    const base = isNew ? null : STATE.profilesList[STATE.currentAgent];
    const email = $('#teamEmail').value.trim();
    const password = $('#teamPassword').value;
    const full_name = $('#teamFullName').value.trim();
    const role = $('#teamRole').value;
    const is_active = $('#teamActive').checked;

    if (isNew && !email) { toast('Email requis.', 'error'); return; }
    if (isNew && (!password || password.length < 8)) { toast('Mot de passe : 8+ caractères.', 'error'); return; }

    const btn = $('#teamSaveBtn'); btn.disabled = true; const old = btn.textContent; btn.textContent = '⏳…';
    try {
      if (isNew) {
        await callAdminAgent('create', { email, password, full_name, role });
        toast('Agent créé. Communiquez-lui les identifiants.', 'success', 'Créé');
      } else {
        const body = { id: base.id, full_name, role, is_active };
        if (password && password.length >= 8) body.password = password;
        await callAdminAgent('update', body);
        toast('Agent mis à jour.', 'success');
      }
      await loadAllProfiles();
      renderTeamTable();
      renderListingsAuthorFilter();
      backToTeam();
    } catch (e) {
      console.error(e); toast(e.message || 'Erreur', 'error', 'Échec');
    } finally { btn.disabled = false; btn.textContent = old; }
  }

  async function deleteAgent() {
    if (STATE.currentAgent === 'new') return backToTeam();
    const p = STATE.profilesList[STATE.currentAgent];
    if (p.id === STATE.user.id) { toast('Vous ne pouvez pas supprimer votre propre compte.', 'error'); return; }
    const ok = await confirmModal('Supprimer cet agent ?',
      'Le compte de "' + (p.full_name || p.email) + '" sera supprimé. Les annonces qu\'il·elle a créées resteront, attribuées à "—".');
    if (!ok) return;
    try {
      await callAdminAgent('delete', { id: p.id });
      toast('Agent supprimé.', 'success');
      await loadAllProfiles();
      renderTeamTable();
      renderListingsAuthorFilter();
      backToTeam();
    } catch (e) { toast(e.message || 'Erreur', 'error', 'Échec'); }
  }

  // ------------------------------------------------------------------
  // AGENCY MEMBERS (admin only — public-facing team page CMS)
  // ------------------------------------------------------------------
  STATE.members = [];
  STATE.currentMember = null;
  STATE.pendingMemberFile = null;

  async function loadMembers() {
    const { data, error } = await sb.from('team_members').select('*').order('position', { ascending: true });
    if (error) { toast(error.message, 'error', 'Erreur'); throw error; }
    STATE.members = data || [];
    return data;
  }

  function membersStats() {
    const m = STATE.members;
    $('#memStatTotal').textContent = m.length;
    $('#memStatDirectors').textContent = m.filter(x => x.category === 'director').length;
    $('#memStatAgents').textContent = m.filter(x => x.category === 'agent').length;
    $('#memStatVisible').textContent = m.filter(x => x.visible !== false).length;
    $('#memStatHidden').textContent = m.filter(x => x.visible === false).length;
  }

  function renderAgencyTable() {
    const search = ($('#memSearchInput').value || '').trim().toLowerCase();
    const cat = $('#memFilterCategory').value;
    const filtered = STATE.members.map((m, i) => ({ m, i })).filter(({ m }) => {
      if (cat && m.category !== cat) return false;
      if (search) {
        const blob = ((m.full_name || '') + ' ' + (m.role_label || '') + ' ' + (m.city_focus || '')).toLowerCase();
        if (!blob.includes(search)) return false;
      }
      return true;
    });
    const root = $('#agencyTable');
    if (!filtered.length) {
      root.innerHTML = '<div class="empty-state"><div class="display">Aucun membre</div><p>Cliquez sur "+ Nouveau membre" pour commencer.</p></div>';
      return;
    }
    root.innerHTML = filtered.map(({ m, i }) => {
      const badges = [];
      if (m.category === 'director') badges.push('<span class="badge badge-signature">Direction</span>');
      else badges.push('<span class="badge badge-off">Conseiller·ère</span>');
      if (m.visible === false) badges.push('<span class="badge badge-hidden">Masqué</span>');
      const langs = (m.languages || []).map(l => ({ fr: '🇫🇷', he: '🇮🇱', en: '🇬🇧', ru: '🇷🇺', es: '🇪🇸', ar: '🇸🇦' })[l.code] || '').join(' ');
      const photo = imageUrlFor(BUCKET_TEAM, m.photo_url);
      return '<div class="listing-row team-row" data-i="' + i + '">' +
        '<div class="thumb" style="background-image:url(\'' + escapeHtml(photo) + '\')"></div>' +
        '<div class="info">' +
          '<div class="title">' + escapeHtml(m.full_name) + '</div>' +
          '<div class="sub">' + escapeHtml(m.role_label || '') + ' · ' + escapeHtml(m.city_focus || '') + ' · ' + langs + '</div>' +
        '</div>' +
        '<div class="city-tag">#' + (m.position || 0) + '</div>' +
        '<div class="badges">' + badges.join('') + '</div>' +
        '<div class="price">—</div>' +
        '<div class="row-actions"><button class="icon-btn" data-act="edit">✎</button></div>' +
      '</div>';
    }).join('');
    root.querySelectorAll('.listing-row').forEach(row => {
      row.addEventListener('click', () => openMemberEditor(parseInt(row.dataset.i, 10)));
    });
  }

  function openMemberEditor(idx) {
    STATE.currentMember = idx;
    STATE.pendingMemberFile = null;
    const isNew = idx === 'new';
    const m = isNew
      ? { category: 'agent', visible: true, position: STATE.members.length, languages: [] }
      : STATE.members[idx];

    $('#memberEditorTitle').textContent = isNew ? 'Nouveau membre' : 'Modifier · ' + (m.full_name || '');
    $('#memberDeleteBtn').hidden = isNew;
    $('#memberFullName').value = m.full_name || '';
    $('#memberRoleLabel').value = m.role_label || '';
    $('#memberCategory').value = m.category || 'agent';
    $('#memberCityFocus').value = m.city_focus || '';
    $('#memberBio').value = m.bio || '';
    $('#memberPhotoUrl').value = m.photo_url || '';
    $('#memberVisible').checked = m.visible !== false;
    $('#memberPosition').value = m.position != null ? m.position : '';
    $$('#memberLangsChecks input[data-lang]').forEach(cb => {
      const lang = cb.dataset.lang;
      cb.checked = (m.languages || []).some(l => l.code === lang);
    });
    setMemberPreview(imageUrlFor(BUCKET_TEAM, m.photo_url));
    $('#memberUploadProgress').hidden = true;

    if (!isNew) {
      $('#memberMetaGroup').hidden = false;
      const linkedUser = m.user_id ? authorLabel(m.user_id) : '— aucun';
      $('#memberMetaUser').textContent = linkedUser;
      $('#memberMetaUpdated').textContent = fmtDate(m.updated_at);
    } else {
      $('#memberMetaGroup').hidden = true;
    }
    showView('member-editor');
    window.scrollTo(0, 0);
  }

  function setMemberPreview(url) {
    const p = $('#memberImagePreview');
    if (url) { p.style.backgroundImage = "url('" + url.replace(/'/g, "\\'") + "')"; p.innerHTML = ''; }
    else { p.style.backgroundImage = ''; p.innerHTML = '<div class="image-empty">Aucune photo</div>'; }
  }

  function readMemberForm(base) {
    const langCodes = $$('#memberLangsChecks input[data-lang]:checked').map(cb => cb.dataset.lang);
    const langLabels = { fr: 'Français', he: 'Hébreu', en: 'Anglais', ru: 'Russe', es: 'Espagnol', ar: 'Arabe' };
    const langs = langCodes.map(c => ({ code: c, label: langLabels[c] || c }));
    return {
      full_name: $('#memberFullName').value.trim(),
      role_label: $('#memberRoleLabel').value.trim() || null,
      category: $('#memberCategory').value,
      city_focus: $('#memberCityFocus').value.trim() || null,
      bio: $('#memberBio').value.trim() || null,
      photo_url: $('#memberPhotoUrl').value.trim() || null,
      visible: $('#memberVisible').checked,
      position: $('#memberPosition').value ? parseInt($('#memberPosition').value, 10) : 0,
      languages: langs
    };
  }

  function imageUrlFor(bucket, path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    if (/^assets\//i.test(path)) return '../' + path; // local repo asset (admin is at /admin/)
    return window.SL_SUPABASE.url + '/storage/v1/object/public/' + bucket + '/' + path.replace(/^\/+/, '');
  }

  async function saveMember() {
    const isNew = STATE.currentMember === 'new';
    const base = isNew ? null : STATE.members[STATE.currentMember];
    if (!$('#memberFullName').value.trim()) { toast('Le nom complet est requis.', 'error'); return; }
    const btn = $('#memberSaveBtn'); btn.disabled = true; const old = btn.textContent; btn.textContent = '⏳…';
    try {
      const payload = readMemberForm(base);
      if (STATE.pendingMemberFile) {
        const slug = slugify(payload.full_name);
        payload.photo_url = await uploadImage(BUCKET_TEAM, slug, STATE.pendingMemberFile, $('#memberUploadProgress'));
      }
      if (isNew) {
        const { error } = await sb.from('team_members').insert(payload);
        if (error) throw error;
      } else {
        const { error } = await sb.from('team_members').update(payload).eq('id', base.id);
        if (error) throw error;
      }
      await loadMembers();
      membersStats();
      renderAgencyTable();
      toast('Membre enregistré. La page Agence est mise à jour.', 'success', 'Enregistré');
      backToAgency();
    } catch (e) {
      console.error(e); toast(e.message || 'Erreur', 'error', 'Échec');
    } finally { btn.disabled = false; btn.textContent = old; }
  }

  async function deleteMember() {
    if (STATE.currentMember === 'new') return backToAgency();
    const m = STATE.members[STATE.currentMember];
    const ok = await confirmModal('Retirer ce membre de l\'équipe ?',
      '"' + m.full_name + '" ne sera plus affiché·e sur la page Agence (le compte de connexion n\'est PAS supprimé).');
    if (!ok) return;
    const { error } = await sb.from('team_members').delete().eq('id', m.id);
    if (error) { toast(error.message, 'error'); return; }
    await loadMembers();
    membersStats();
    renderAgencyTable();
    toast('Membre retiré.', 'success');
    backToAgency();
  }

  function handleMemberFile(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast('Image > 5MB.', 'error'); return; }
    STATE.pendingMemberFile = file;
    const r = new FileReader();
    r.onload = e => { setMemberPreview(e.target.result); $('#memberPhotoUrl').value = '(téléversement à l\'enregistrement)'; };
    r.readAsDataURL(file);
    toast('Photo prête.', null, 'Photo en attente');
  }

  // ------------------------------------------------------------------
  // NAVIGATION
  // ------------------------------------------------------------------
  function backToDashboard() {
    STATE.currentListing = null; STATE.pendingListingFile = null;
    showView('dashboard');
    showTab('listings');
  }
  function backToJournal() {
    STATE.currentArticle = null; STATE.pendingArticleFile = null;
    showView('dashboard');
    showTab('journal');
  }
  function backToTeam() {
    STATE.currentAgent = null;
    showView('dashboard');
    showTab('team');
  }
  function backToAgency() {
    STATE.currentMember = null; STATE.pendingMemberFile = null;
    showView('dashboard');
    showTab('agency');
  }

  // ------------------------------------------------------------------
  // FILE HANDLERS
  // ------------------------------------------------------------------
  function handleListingFile(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast('Image > 5MB. Compressez-la.', 'error'); return; }
    STATE.pendingListingFile = file;
    const r = new FileReader();
    r.onload = e => { setListingPreview(e.target.result); $('#fImage').value = '(téléversement à l\'enregistrement)'; };
    r.readAsDataURL(file);
    toast('Photo prête.', null, 'Photo en attente');
  }
  function handleArticleFile(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast('Image > 5MB.', 'error'); return; }
    STATE.pendingArticleFile = file;
    const r = new FileReader();
    r.onload = e => { setArticlePreview(e.target.result); $('#artFImage').value = '(téléversement à l\'enregistrement)'; };
    r.readAsDataURL(file);
    toast('Image prête.', null, 'Image en attente');
  }

  // ------------------------------------------------------------------
  // BIND EVENTS
  // ------------------------------------------------------------------
  function bindEvents() {
    // Login
    $('#loginForm').addEventListener('submit', async e => {
      e.preventDefault();
      $('#loginError').hidden = true;
      const email = $('#loginEmail').value.trim();
      const password = $('#loginPassword').value;
      const btn = $('#loginSubmit'); btn.disabled = true;
      const old = btn.textContent; btn.textContent = '⏳ Connexion…';
      try {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await enterDashboard();
      } catch (err) {
        $('#loginError').textContent = err.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect.' : err.message;
        $('#loginError').hidden = false;
      } finally { btn.disabled = false; btn.textContent = old; }
    });

    $('#logoutBtn').addEventListener('click', logout);

    // Tab switching
    $$('.nav-btn').forEach(btn => btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      if ((tab === 'team' || tab === 'agency') && STATE.profile?.role !== 'admin') return;
      showView('dashboard');
      showTab(tab);
    }));

    // Listings tab
    $('#reloadBtn').addEventListener('click', async () => { try { await loadListings(); listingsStats(); renderListingsTable(); renderListingsAuthorFilter(); toast('Annonces rechargées.', 'success'); } catch (_) {} });
    $('#newListingBtn').addEventListener('click', () => openListingEditor('new'));
    $('#searchInput').addEventListener('input', renderListingsTable);
    $('#filterCity').addEventListener('change', renderListingsTable);
    $('#filterType').addEventListener('change', renderListingsTable);
    $('#filterAuthor').addEventListener('change', renderListingsTable);

    // Listing editor
    $('#editorBackBtn').addEventListener('click', backToDashboard);
    $('#saveBtn').addEventListener('click', saveListing);
    $('#deleteBtn').addEventListener('click', deleteListing);
    $('#fileUpload').addEventListener('change', e => handleListingFile(e.target.files[0]));
    $('#fImage').addEventListener('change', () => { if ($('#fImage').value && !STATE.pendingListingFile && !$('#fImage').value.startsWith('(')) setListingPreview($('#fImage').value); });
    $('#fPriceUsd').addEventListener('blur', () => {
      const v = parseFloat($('#fPriceUsd').value);
      if (!v || $('#fPriceDisplay').value) return;
      const m = v / 1_000_000;
      $('#fPriceDisplay').value = '$' + (m % 1 === 0 ? m.toFixed(1) : m.toFixed(2)) + 'M';
    });

    // Journal tab
    $('#reloadArticlesBtn').addEventListener('click', async () => { try { await loadArticles(); articlesStats(); renderArticlesTable(); toast('Articles rechargés.', 'success'); } catch (_) {} });
    $('#newArticleBtn').addEventListener('click', () => openArticleEditor('new'));
    $('#artSearchInput').addEventListener('input', renderArticlesTable);
    $('#artFilterCategory').addEventListener('change', renderArticlesTable);
    $('#artEditorBackBtn').addEventListener('click', backToJournal);
    $('#artSaveBtn').addEventListener('click', saveArticle);
    $('#artDeleteBtn').addEventListener('click', deleteArticle);
    $('#artFileUpload').addEventListener('change', e => handleArticleFile(e.target.files[0]));
    $('#artFImage').addEventListener('change', () => { if ($('#artFImage').value && !STATE.pendingArticleFile && !$('#artFImage').value.startsWith('(')) setArticlePreview($('#artFImage').value); });

    // Team tab
    $('#reloadTeamBtn').addEventListener('click', async () => { try { await loadAllProfiles(); renderTeamTable(); toast('Équipe rechargée.', 'success'); } catch (_) {} });
    $('#newAgentBtn').addEventListener('click', () => openAgentEditor('new'));
    $('#teamBackBtn').addEventListener('click', backToTeam);
    $('#teamSaveBtn').addEventListener('click', saveAgent);
    $('#teamDeleteBtn').addEventListener('click', deleteAgent);
    $('#teamGenPwd').addEventListener('click', () => { $('#teamPassword').value = genStrongPassword(); });

    // Agency tab
    $('#reloadAgencyBtn').addEventListener('click', async () => { try { await loadMembers(); membersStats(); renderAgencyTable(); toast('Équipe rechargée.', 'success'); } catch (_) {} });
    $('#newMemberBtn').addEventListener('click', () => openMemberEditor('new'));
    $('#memSearchInput').addEventListener('input', renderAgencyTable);
    $('#memFilterCategory').addEventListener('change', renderAgencyTable);
    $('#memberBackBtn').addEventListener('click', backToAgency);
    $('#memberSaveBtn').addEventListener('click', saveMember);
    $('#memberDeleteBtn').addEventListener('click', deleteMember);
    $('#memberFileUpload').addEventListener('change', e => handleMemberFile(e.target.files[0]));
    $('#memberPhotoUrl').addEventListener('change', () => {
      if ($('#memberPhotoUrl').value && !STATE.pendingMemberFile && !$('#memberPhotoUrl').value.startsWith('(')) {
        setMemberPreview(imageUrlFor(BUCKET_TEAM, $('#memberPhotoUrl').value));
      }
    });
  }

  async function enterDashboard() {
    await loadProfile();
    if (!STATE.profile) {
      toast('Profil introuvable. Contactez l\'administrateur.', 'error', 'Erreur');
      await logout();
      return;
    }
    if (STATE.profile.is_active === false) {
      toast('Votre compte a été désactivé.', 'error', 'Accès refusé');
      await logout();
      return;
    }
    $('#userTag').textContent = (STATE.profile.full_name || STATE.profile.email) + (STATE.profile.role === 'admin' ? ' · ADMIN' : '');
    // Hide admin-only tabs for non-admins
    $$('[data-admin-only]').forEach(el => { el.hidden = (STATE.profile.role !== 'admin'); });

    showView('dashboard');
    showTab('listings');

    try {
      const promises = [loadAllProfiles(), loadListings(), loadArticles()];
      if (STATE.profile.role === 'admin') promises.push(loadMembers());
      await Promise.all(promises);
      listingsStats();
      renderListingsAuthorFilter();
      renderListingsTable();
      articlesStats();
      renderArticlesTable();
      if (STATE.profile.role === 'admin') {
        renderTeamTable();
        membersStats();
        renderAgencyTable();
      }
    } catch (e) { console.error(e); }
  }

  // ==========================================================================
  // CMS: Site texts editor
  // ==========================================================================
  STATE.texts = [];           // raw rows from site_texts
  STATE.textsEditingLang = 'fr';
  STATE.textsLoaded = false;

  async function loadTexts() {
    const { data, error } = await sb.from('site_texts').select('*').order('category').order('key');
    if (error) throw error;
    STATE.texts = data || [];
    STATE.textsLoaded = true;
  }

  function bustCMSCache() {
    // Make sure the public site refetches on next nav
    try { sessionStorage.removeItem('sl-cms-texts-v1'); sessionStorage.removeItem('sl-cms-settings-v1'); } catch (_) {}
  }

  function renderTextsList() {
    const list = $('#textsList');
    if (!list) return;
    const q = ($('#textsSearchInput').value || '').toLowerCase().trim();
    const cat = $('#textsFilterCategory').value;
    const lang = $('#textsFilterLang').value || 'fr';
    STATE.textsEditingLang = lang;

    let rows = STATE.texts;
    if (cat) rows = rows.filter(r => r.category === cat);
    if (q) rows = rows.filter(r => {
      const blob = (r.key + ' ' + (r.fr || '') + ' ' + (r.en || '') + ' ' + (r.he || '') + ' ' + (r.ru || '') + ' ' + (r.notes || '')).toLowerCase();
      return blob.includes(q);
    });

    if (!rows.length) {
      list.innerHTML = '<div class="loading">Aucun texte ne correspond à votre recherche.</div>';
      return;
    }

    list.innerHTML = rows.map(r => textRowHTML(r)).join('');

    // Wire toggles
    list.querySelectorAll('.text-row-head').forEach(head => {
      head.addEventListener('click', () => head.closest('.text-row').classList.toggle('is-open'));
    });
    list.querySelectorAll('.text-save-btn').forEach(btn => {
      btn.addEventListener('click', () => saveOneText(btn.dataset.key, btn));
    });
  }

  function textRowHTML(r) {
    const preview = (r[STATE.textsEditingLang] || r.fr || '(vide)');
    const categories = { home: 'ACCUEIL', agence: 'AGENCE', journal: 'JOURNAL', contact: 'CONTACT', footer: 'FOOTER', misc: 'DIVERS' };
    return (
      '<div class="text-row" data-key="' + escapeHtml(r.key) + '">' +
        '<div class="text-row-head">' +
          '<div>' +
            '<div class="text-row-key">' + escapeHtml(r.key) + '</div>' +
            '<div class="text-row-preview">' + escapeHtml(preview) + '</div>' +
          '</div>' +
          '<span class="text-row-cat">' + (categories[r.category] || (r.category || 'DIVERS').toUpperCase()) + '</span>' +
          '<button class="text-row-toggle" type="button" aria-label="Développer">▾</button>' +
        '</div>' +
        '<div class="text-row-body">' +
          '<div class="text-row-langs">' +
            '<div class="text-lang-field"><label>FR — Français</label><textarea data-lang="fr">' + escapeHtml(r.fr || '') + '</textarea></div>' +
            '<div class="text-lang-field"><label>EN — Anglais</label><textarea data-lang="en">' + escapeHtml(r.en || '') + '</textarea></div>' +
            '<div class="text-lang-field"><label>HE — Hébreu</label><textarea data-lang="he" dir="rtl">' + escapeHtml(r.he || '') + '</textarea></div>' +
            '<div class="text-lang-field"><label>RU — Russe</label><textarea data-lang="ru">' + escapeHtml(r.ru || '') + '</textarea></div>' +
          '</div>' +
          (r.notes ? '<div class="text-row-notes">' + escapeHtml(r.notes) + '</div>' : '') +
          '<div class="text-row-foot">' +
            '<span class="save-status" data-status></span>' +
            '<button class="btn-primary text-save-btn" type="button" data-key="' + escapeHtml(r.key) + '">Enregistrer</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  async function saveOneText(key, btn) {
    const row = btn.closest('.text-row');
    const status = row.querySelector('[data-status]');
    const fields = ['fr', 'en', 'he', 'ru'];
    const update = { updated_at: new Date().toISOString(), updated_by: STATE.user?.id || null };
    fields.forEach(l => {
      const ta = row.querySelector('textarea[data-lang="' + l + '"]');
      if (ta) update[l] = ta.value;
    });
    const old = btn.textContent;
    btn.disabled = true; btn.textContent = '…';
    status.textContent = '';
    status.className = 'save-status';
    const { error } = await sb.from('site_texts').update(update).eq('key', key);
    btn.disabled = false; btn.textContent = old;
    if (error) {
      status.textContent = '✕ ' + error.message;
      status.className = 'save-status is-err';
      return;
    }
    // Update local cache
    const r = STATE.texts.find(t => t.key === key);
    if (r) Object.assign(r, update);
    status.textContent = '✓ Enregistré';
    status.className = 'save-status is-ok';
    bustCMSCache();
    toast('Texte enregistré.', 'success');
  }

  function openNewTextModal() {
    const m = $('#newTextModal');
    $('#newTextKey').value = '';
    $('#newTextCategory').value = 'misc';
    $('#newTextFr').value = '';
    $('#newTextNotes').value = '';
    m.hidden = false;
    setTimeout(() => $('#newTextKey').focus(), 50);
  }
  function closeNewTextModal() { $('#newTextModal').hidden = true; }

  async function submitNewText() {
    const key = ($('#newTextKey').value || '').trim();
    const category = $('#newTextCategory').value || 'misc';
    const fr = ($('#newTextFr').value || '').trim();
    const notes = ($('#newTextNotes').value || '').trim();
    if (!key) { toast('La clé est obligatoire.', 'error'); return; }
    if (!/^[a-z0-9._-]+$/.test(key)) { toast('Clé invalide : minuscules, chiffres, points/tirets uniquement.', 'error'); return; }
    if (STATE.texts.some(t => t.key === key)) { toast('Cette clé existe déjà.', 'error'); return; }
    const btn = $('#newTextOk');
    const old = btn.textContent;
    btn.disabled = true; btn.textContent = '…';
    const payload = { key, category, fr, updated_by: STATE.user?.id || null };
    if (notes) payload.notes = notes;
    const { error } = await sb.from('site_texts').insert(payload);
    btn.disabled = false; btn.textContent = old;
    if (error) { toast('Erreur : ' + error.message, 'error'); return; }
    closeNewTextModal();
    await loadTexts();
    renderTextsList();
    bustCMSCache();
    toast('Texte créé. Pensez à traduire en EN/HE/RU.', 'success');
  }

  function showCMSSetupModal() {
    $('#cmsSetupModal').hidden = false;
  }
  function closeCMSSetupModal() {
    $('#cmsSetupModal').hidden = true;
  }
  async function recheckCMSSetup() {
    closeCMSSetupModal();
    try {
      await loadTexts();
      await loadSettings();
      renderTextsList();
      renderSettingsForm();
      toast('CMS activé ! Tu peux maintenant éditer les textes et les réglages.', 'success');
    } catch (e) {
      // Still not set up
      showCMSSetupModal();
      toast('Les tables ne sont toujours pas créées. Vérifie que le script s\'est bien exécuté.', 'error');
    }
  }

  function isMissingTableError(err) {
    if (!err) return false;
    const m = (err.message || err.code || '') + '';
    return m.includes('relation') && m.includes('does not exist')
        || m.includes('404')
        || (err.code === 'PGRST205' || err.code === '42P01');
  }

  // ==========================================================================
  // CMS: Settings (journal layout etc.)
  // ==========================================================================
  STATE.settings = {};
  STATE.settingsLoaded = false;

  async function loadSettings() {
    const { data, error } = await sb.from('site_settings').select('*');
    if (error) throw error;
    const map = {};
    (data || []).forEach(r => { map[r.key] = r.value; });
    STATE.settings = map;
    STATE.settingsLoaded = true;
  }

  function renderSettingsForm() {
    const layout = STATE.settings['journal.layout'] || 'magazine';
    const perRow = STATE.settings['journal.cards_per_row'] || 3;
    const showDuo = STATE.settings['journal.show_duo'] !== false;

    document.querySelectorAll('input[name="journalLayout"]').forEach(r => r.checked = r.value === layout);
    document.querySelectorAll('input[name="journalCardsPerRow"]').forEach(r => r.checked = parseInt(r.value, 10) === parseInt(perRow, 10));
    document.querySelectorAll('input[name="journalShowDuo"]').forEach(r => r.checked = (r.value === String(showDuo)));
  }

  async function saveSettings() {
    const get = (name) => {
      const el = document.querySelector('input[name="' + name + '"]:checked');
      return el ? el.value : null;
    };
    const layout = get('journalLayout') || 'magazine';
    const perRow = parseInt(get('journalCardsPerRow') || '3', 10);
    const showDuo = get('journalShowDuo') !== 'false';

    const updates = [
      { key: 'journal.layout', value: layout },
      { key: 'journal.cards_per_row', value: perRow },
      { key: 'journal.show_duo', value: showDuo }
    ];

    const status = $('#settingsStatus');
    const btn = $('#saveSettingsBtn');
    const old = btn.textContent;
    btn.disabled = true; btn.textContent = '…';
    status.textContent = '';

    for (const u of updates) {
      const { error } = await sb.from('site_settings').upsert({
        key: u.key,
        value: u.value,
        updated_at: new Date().toISOString(),
        updated_by: STATE.user?.id || null
      });
      if (error) {
        btn.disabled = false; btn.textContent = old;
        status.textContent = '✕ ' + error.message;
        toast('Erreur : ' + error.message, 'error');
        return;
      }
      STATE.settings[u.key] = u.value;
    }

    btn.disabled = false; btn.textContent = old;
    status.textContent = '✓ Réglages enregistrés';
    bustCMSCache();
    toast('Réglages enregistrés. Le site sera à jour au prochain chargement.', 'success');
  }

  // Lazy-load on first activation; if the CMS tables don't exist yet, show the
  // guided setup modal instead of a raw error.
  async function ensureTextsLoaded() {
    if (STATE.textsLoaded) return;
    try {
      await loadTexts();
      renderTextsList();
    } catch (e) {
      if (isMissingTableError(e)) {
        showCMSSetupModal();
        $('#textsList').innerHTML = '<div class="loading">CMS pas encore activé. Exécutez la migration SQL puis cliquez sur ↻ Actualiser.</div>';
      } else {
        $('#textsList').innerHTML = '<div class="loading">Impossible de charger les textes : ' + escapeHtml(e.message || '') + '</div>';
      }
    }
  }
  async function ensureSettingsLoaded() {
    if (STATE.settingsLoaded) return;
    try {
      await loadSettings();
      renderSettingsForm();
    } catch (e) {
      if (isMissingTableError(e)) showCMSSetupModal();
      else toast('Impossible de charger les réglages: ' + (e.message || ''), 'error');
    }
  }

  // Wire tab activation + buttons (called after dashboard is shown)
  function wireCMSTabs() {
    // Texts
    const textsSearch = $('#textsSearchInput');
    if (textsSearch && !textsSearch.dataset.wired) {
      textsSearch.dataset.wired = '1';
      textsSearch.addEventListener('input', renderTextsList);
      $('#textsFilterCategory').addEventListener('change', renderTextsList);
      $('#textsFilterLang').addEventListener('change', renderTextsList);
      $('#reloadTextsBtn').addEventListener('click', async () => {
        try { await loadTexts(); renderTextsList(); bustCMSCache(); toast('Textes rechargés.', 'success'); }
        catch (e) { if (isMissingTableError(e)) showCMSSetupModal(); else toast(e.message, 'error'); }
      });
      $('#newTextBtn').addEventListener('click', openNewTextModal);
      // New-text modal wiring
      $('#newTextCancel').addEventListener('click', closeNewTextModal);
      $('#newTextOk').addEventListener('click', submitNewText);
      $('#newTextModal').addEventListener('click', e => { if (e.target.id === 'newTextModal') closeNewTextModal(); });
      // CMS setup modal wiring
      $('#cmsSetupSkip').addEventListener('click', closeCMSSetupModal);
      $('#cmsSetupDone').addEventListener('click', recheckCMSSetup);
    }
    // Settings
    const saveBtn = $('#saveSettingsBtn');
    if (saveBtn && !saveBtn.dataset.wired) {
      saveBtn.dataset.wired = '1';
      saveBtn.addEventListener('click', saveSettings);
      $('#reloadSettingsBtn').addEventListener('click', async () => {
        try { await loadSettings(); renderSettingsForm(); bustCMSCache(); toast('Réglages rechargés.', 'success'); } catch (e) { toast(e.message, 'error'); }
      });
    }
    // Hook into tab switching to lazy-load
    $$('.nav-btn').forEach(btn => {
      if (btn.dataset.cmsWired) return;
      btn.dataset.cmsWired = '1';
      btn.addEventListener('click', () => {
        if (btn.dataset.tab === 'texts') ensureTextsLoaded();
        if (btn.dataset.tab === 'settings') ensureSettingsLoaded();
      });
    });
  }

  async function boot() {
    bindEvents();
    wireCMSTabs();
    const { data: { session } } = await sb.auth.getSession();
    if (session) await enterDashboard();
    else { showView('login'); $('#loginEmail').focus(); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
