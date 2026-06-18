-- First-party site analytics (privacy-clean: NO cookies, NO IP, NO personal data).
-- A page-view event log + a write-only RPC the public site calls, plus aggregate
-- RPCs the admin reads. Visitor = an anonymous per-session id (sessionStorage),
-- used only to estimate unique visits — it identifies no one.

create table if not exists public.analytics_events (
  id      bigint generated always as identity primary key,
  ts      timestamptz not null default now(),
  path    text not null,
  visitor text not null
);
create index if not exists analytics_events_ts_idx   on public.analytics_events (ts);
create index if not exists analytics_events_path_idx on public.analytics_events (path);

alter table public.analytics_events enable row level security;
-- No direct SELECT for anyone: admins read only through the SECURITY DEFINER
-- stats_* functions below (which return aggregates, never raw rows).

-- Write-only ingest. SECURITY DEFINER so the anon client can append an event
-- without any direct table rights.
create or replace function public.track_event(p_path text, p_visitor text)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.analytics_events (path, visitor)
  values (coalesce(left(p_path, 300), '/'), coalesce(left(p_visitor, 64), 'na'));
end; $$;
grant execute on function public.track_event(text, text) to anon, authenticated;

-- KPI overview (visits = page views, visitors = distinct anonymous sessions).
create or replace function public.stats_overview()
returns json language sql security definer set search_path = public stable as $$
  select json_build_object(
    'views_today',    (select count(*) from analytics_events where ts >= date_trunc('day', now())),
    'views_7d',       (select count(*) from analytics_events where ts >= now() - interval '7 days'),
    'views_30d',      (select count(*) from analytics_events where ts >= now() - interval '30 days'),
    'views_total',    (select count(*) from analytics_events),
    'visitors_today', (select count(distinct visitor) from analytics_events where ts >= date_trunc('day', now())),
    'visitors_7d',    (select count(distinct visitor) from analytics_events where ts >= now() - interval '7 days'),
    'visitors_30d',   (select count(distinct visitor) from analytics_events where ts >= now() - interval '30 days')
  );
$$;
grant execute on function public.stats_overview() to authenticated;

-- Most-viewed pages over the window.
create or replace function public.stats_top_pages(p_days int default 30, p_limit int default 20)
returns table(path text, views bigint, visitors bigint)
language sql security definer set search_path = public stable as $$
  select path, count(*) as views, count(distinct visitor) as visitors
  from analytics_events
  where ts >= now() - (p_days || ' days')::interval
  group by path order by views desc limit greatest(p_limit, 1);
$$;
grant execute on function public.stats_top_pages(int, int) to authenticated;

-- Daily series for the chart.
create or replace function public.stats_daily(p_days int default 14)
returns table(day date, views bigint, visitors bigint)
language sql security definer set search_path = public stable as $$
  select (ts at time zone 'UTC')::date as day, count(*) as views, count(distinct visitor) as visitors
  from analytics_events
  where ts >= now() - (p_days || ' days')::interval
  group by 1 order by 1;
$$;
grant execute on function public.stats_daily(int) to authenticated;
