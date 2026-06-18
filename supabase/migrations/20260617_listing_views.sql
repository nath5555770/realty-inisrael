-- Per-listing view counter.
-- Additive only: a separate table (does NOT touch the `listings` table or its
-- data) plus a SECURITY DEFINER RPC that the public site calls to increment.
-- Anonymous visitors can only increment (through the RPC); only authenticated
-- admins can read the counts (shown in the admin dashboard).

create table if not exists public.listing_views (
  listing_id uuid primary key references public.listings(id) on delete cascade,
  views      integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.listing_views enable row level security;

-- Only logged-in admins can READ the counts.
drop policy if exists "listing_views_read_auth" on public.listing_views;
create policy "listing_views_read_auth"
  on public.listing_views for select
  to authenticated using (true);

-- Increment helper. SECURITY DEFINER so the anon client can bump the counter
-- without any direct INSERT/UPDATE rights on the table itself.
create or replace function public.increment_listing_view(p_listing uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.listing_views (listing_id, views)
  values (p_listing, 1)
  on conflict (listing_id)
  do update set views = listing_views.views + 1, updated_at = now();
end;
$$;

grant execute on function public.increment_listing_view(uuid) to anon, authenticated;
