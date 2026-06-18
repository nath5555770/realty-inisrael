-- Enrich site analytics with privacy-safe dimensions: traffic source (referrer),
-- device / browser / OS, language, and COUNTRY.
-- IMPORTANT: the IP is NEVER stored. Country is derived client-side via an
-- anonymous geolocation lookup and only the 2-letter code reaches the server.

alter table public.analytics_events add column if not exists source  text;
alter table public.analytics_events add column if not exists device  text;
alter table public.analytics_events add column if not exists browser text;
alter table public.analytics_events add column if not exists os      text;
alter table public.analytics_events add column if not exists lang    text;
alter table public.analytics_events add column if not exists country text;

-- Replace the ingest RPC with the richer signature (defaults keep it tolerant).
drop function if exists public.track_event(text, text);
create or replace function public.track_event(
  p_path text, p_visitor text,
  p_source text default null, p_device text default null,
  p_browser text default null, p_os text default null,
  p_lang text default null, p_country text default null
) returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.analytics_events (path, visitor, source, device, browser, os, lang, country)
  values (
    coalesce(left(p_path, 300), '/'),
    coalesce(left(p_visitor, 64), 'na'),
    left(p_source, 60), left(p_device, 16), left(p_browser, 24),
    left(p_os, 24), left(p_lang, 8), upper(left(p_country, 2))
  );
end; $$;
grant execute on function public.track_event(text,text,text,text,text,text,text,text) to anon, authenticated;

-- Top acquisition sources (excludes internal navigation).
create or replace function public.stats_top_sources(p_days int default 30, p_limit int default 12)
returns table(source text, views bigint, visitors bigint)
language sql security definer set search_path = public stable as $$
  select coalesce(nullif(source, ''), 'direct'), count(*), count(distinct visitor)
  from analytics_events
  where ts >= now() - (p_days || ' days')::interval and coalesce(source, '') <> 'interne'
  group by 1 order by 2 desc limit greatest(p_limit, 1);
$$;
grant execute on function public.stats_top_sources(int, int) to authenticated;
revoke execute on function public.stats_top_sources(int, int) from anon, public;

-- Generic breakdown for device / browser / os / country / lang (whitelisted).
create or replace function public.stats_breakdown(p_field text, p_days int default 30, p_limit int default 15)
returns table(label text, views bigint, visitors bigint)
language plpgsql security definer set search_path = public stable as $$
declare col text := case when p_field in ('device','browser','os','country','lang') then p_field else 'device' end;
begin
  return query execute format(
    'select coalesce(nullif(%I, ''''), ''?''), count(*), count(distinct visitor)
       from analytics_events
      where ts >= now() - ($1 || '' days'')::interval
      group by 1 order by 2 desc limit greatest($2, 1)', col)
  using p_days, p_limit;
end; $$;
grant execute on function public.stats_breakdown(text, int, int) to authenticated;
revoke execute on function public.stats_breakdown(text, int, int) from anon, public;
