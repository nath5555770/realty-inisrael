/* =========================================================================
   SHAHAR LEVI — Capture des leads (contact + newsletter) vers Supabase.
   Le formulaire public insère via la clé anon (RLS: insert autorisé, lecture
   réservée à l'admin). Confirmation visuelle + repli si erreur réseau.
   ========================================================================= */
(function () {
  'use strict';
  if (!window.SL_SUPABASE) { console.error('[forms] config Supabase manquante'); return; }
  var SB_URL = window.SL_SUPABASE.url;
  var SB_KEY = window.SL_SUPABASE.key;

  function lang() { try { return localStorage.getItem('sl-lang') || 'fr'; } catch (e) { return 'fr'; } }

  function insert(table, payload) {
    return fetch(SB_URL + '/rest/v1/' + table, {
      method: 'POST',
      headers: {
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + SB_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error('HTTP ' + r.status + ' ' + t.slice(0, 120)); });
      return true;
    });
  }

  // Notification email : prévient Nathalie par email à chaque nouveau lead,
  // EN PLUS de l'enregistrement Supabase. Via FormSubmit (aucune inscription ni
  // clé API : la 1re soumission déclenche un email d'activation à valider une fois).
  // Fire-and-forget : n'impacte jamais l'expérience du visiteur.
  var NOTIFY_TO = 'Nathhaik.realestate@gmail.com';
  function notifyEmail(fields, subject) {
    try {
      fetch('https://formsubmit.co/ajax/' + NOTIFY_TO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(Object.assign({ _subject: subject, _template: 'table', _captcha: 'false' }, fields))
      }).catch(function () {});
    } catch (e) {}
  }

  function banner(el, type, html) {
    var d = document.createElement('div');
    d.setAttribute('role', type === 'ok' ? 'status' : 'alert');
    d.style.cssText = 'margin-top:1rem;padding:14px 18px;border-radius:2px;font-size:14px;line-height:1.5;'
      + (type === 'ok'
        ? 'background:#0e2722;color:#f4ede0;border:1px solid #c4a877;'
        : 'background:#fbeaea;color:#7a1f1f;border:1px solid #d9a0a0;');
    d.innerHTML = html;
    el.appendChild(d);
    return d;
  }

  // ---------------- Formulaire de contact ----------------
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var btn = form.querySelector('button[type="submit"]');
      var oldLabel = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Envoi…'; }
      var fd = new FormData(form);
      var payload = {
        first_name: (fd.get('first_name') || '').trim(),
        last_name: (fd.get('last_name') || '').trim(),
        email: (fd.get('email') || '').trim(),
        phone: (fd.get('phone') || '').trim(),
        country: fd.get('country') || '',
        subject: fd.get('subject') || '',
        budget: fd.get('budget') || '',
        zone: fd.get('zone') || '',
        project: (fd.get('project') || '').trim(),
        format: fd.get('format') || '',
        consent: !!fd.get('consent'),
        lang: lang()
      };
      insert('contact_requests', payload).then(function () {
        notifyEmail({
          'Nom': (payload.first_name + ' ' + payload.last_name).trim(),
          'Email': payload.email,
          'Téléphone': payload.phone || '—',
          'Pays': payload.country || '—',
          'Sujet': payload.subject || '—',
          'Budget': payload.budget || '—',
          'Zone': payload.zone || '—',
          'Projet': payload.project || '—',
          'Langue': payload.lang
        }, 'Nouvelle demande de contact — realty-inisrael.com');
        form.querySelectorAll('input,select,textarea,button').forEach(function (el) { el.style.display = 'none'; });
        banner(form, 'ok', '<strong>Merci, votre demande a bien été transmise.</strong><br>Nathalie vous répond personnellement sous 24h ouvrées.');
      }).catch(function (err) {
        console.error('[contact]', err);
        if (btn) { btn.disabled = false; btn.textContent = oldLabel; }
        banner(form, 'err', 'Une erreur est survenue à l’envoi. Écrivez-nous directement : '
          + '<a href="mailto:Nathhaik.realestate@gmail.com" style="text-decoration:underline;color:inherit">Nathhaik.realestate@gmail.com</a>');
      });
    });
  }

  // ---------------- Inscription newsletter ----------------
  var nlBtn = document.getElementById('newsletterBtn');
  var nlInput = document.getElementById('newsletterEmail');
  if (nlBtn && nlInput) {
    nlBtn.addEventListener('click', function () {
      var email = (nlInput.value || '').trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { nlInput.focus(); nlInput.reportValidity && nlInput.reportValidity(); return; }
      nlBtn.disabled = true; var ol = nlBtn.textContent; nlBtn.textContent = '…';
      insert('newsletter_subscribers', { email: email, lang: lang() }).then(function () {
        notifyEmail({ 'Email': email, 'Type': 'Inscription carnet privé / newsletter', 'Langue': lang() }, 'Nouvelle inscription newsletter — realty-inisrael.com');
        var wrap = nlInput.parentElement;
        nlInput.style.display = 'none'; nlBtn.style.display = 'none';
        banner(wrap, 'ok', '<strong>Merci, vous êtes inscrit·e au carnet privé.</strong>');
      }).catch(function (err) {
        console.error('[newsletter]', err);
        nlBtn.disabled = false; nlBtn.textContent = ol;
        // 23505 = email déjà inscrit -> on remercie quand même
        if (/23505|duplicate/i.test(err.message)) {
          nlInput.style.display = 'none'; nlBtn.style.display = 'none';
          banner(nlInput.parentElement, 'ok', '<strong>Vous êtes déjà inscrit·e — merci !</strong>');
        } else {
          banner(nlInput.parentElement, 'err', 'Inscription momentanément indisponible, réessayez plus tard.');
        }
      });
    });
  }
})();
