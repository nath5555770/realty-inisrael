-- =====================================================================
--  Capture des leads : demandes de contact + inscriptions newsletter
--  Le formulaire public (clé anon/publishable) peut INSÉRER.
--  Seul l'admin (authentifié) peut LIRE. Personne d'autre ne lit les leads.
-- =====================================================================

-- ---------- Demandes de contact ----------
create table if not exists public.contact_requests (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  first_name  text,
  last_name   text,
  email       text,
  phone       text,
  country     text,
  subject     text,
  budget      text,
  zone        text,
  project     text,
  format      text,
  consent     boolean default false,
  lang        text,
  handled     boolean default false   -- l'admin coche "traité"
);

alter table public.contact_requests enable row level security;

drop policy if exists "contact_anon_insert" on public.contact_requests;
create policy "contact_anon_insert" on public.contact_requests
  for insert to anon, authenticated with check (true);

drop policy if exists "contact_auth_select" on public.contact_requests;
create policy "contact_auth_select" on public.contact_requests
  for select to authenticated using (true);

drop policy if exists "contact_auth_update" on public.contact_requests;
create policy "contact_auth_update" on public.contact_requests
  for update to authenticated using (true) with check (true);

drop policy if exists "contact_auth_delete" on public.contact_requests;
create policy "contact_auth_delete" on public.contact_requests
  for delete to authenticated using (true);

-- ---------- Inscriptions newsletter ----------
create table if not exists public.newsletter_subscribers (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  email       text unique,
  lang        text
);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "news_anon_insert" on public.newsletter_subscribers;
create policy "news_anon_insert" on public.newsletter_subscribers
  for insert to anon, authenticated with check (true);

drop policy if exists "news_auth_select" on public.newsletter_subscribers;
create policy "news_auth_select" on public.newsletter_subscribers
  for select to authenticated using (true);

drop policy if exists "news_auth_delete" on public.newsletter_subscribers;
create policy "news_auth_delete" on public.newsletter_subscribers
  for delete to authenticated using (true);
