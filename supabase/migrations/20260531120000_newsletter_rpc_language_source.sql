-- Extend newsletter RPC with language/source (used by subscribe-newsletter edge function).

drop function if exists public.safe_insert_newsletter_subscriber(text, text);

create or replace function public.safe_insert_newsletter_subscriber(
  p_email text,
  p_client_ip text default 'unknown'::text,
  p_language text default 'pl'::text,
  p_source text default 'newsletter'::text
)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_id uuid;
  v_rate_limit record;
  v_email text := lower(trim(coalesce(p_email, '')));
  v_ip text := left(trim(coalesce(p_client_ip, 'unknown')), 128);
  v_language text := case when p_language in ('pl', 'en') then p_language else 'pl' end;
  v_source text := left(trim(coalesce(nullif(p_source, ''), 'newsletter')), 50);
begin
  if v_source = '' or position('<' in v_source) > 0 or position('>' in v_source) > 0 then
    v_source := 'newsletter';
  end if;

  select * into v_rate_limit
  from public.consume_rate_limit('newsletter:' || v_ip || ':' || v_email, 5, 300000);

  if not v_rate_limit.allowed then
    raise exception 'Too many newsletter attempts';
  end if;

  if v_email !~* '^[^\s@]+@[^\s@]+\.[^\s@]+$' or char_length(v_email) > 254 then
    raise exception 'Invalid email';
  end if;

  insert into public.vv_newsletter_subscribers (email, source, tags, token, is_active, language)
  values (
    v_email,
    v_source,
    array['newsletter'],
    encode(extensions.gen_random_bytes(32), 'hex'),
    true,
    v_language
  )
  on conflict (email) do update
  set is_active = true,
      unsubscribed_at = null,
      source = excluded.source,
      language = excluded.language,
      updated_at = now()
  returning id into v_id;

  return v_id;
end;
$$;

revoke execute on function public.safe_insert_newsletter_subscriber(text, text, text, text) from anon, authenticated, public;
grant execute on function public.safe_insert_newsletter_subscriber(text, text, text, text) to service_role;
