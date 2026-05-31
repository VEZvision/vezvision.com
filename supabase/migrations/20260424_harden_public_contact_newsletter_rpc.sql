create or replace function public.safe_insert_contact_message(
  p_full_name text,
  p_email text,
  p_subject text,
  p_message text,
  p_phone text default null::text,
  p_status text default 'new'::text,
  p_language text default 'pl'::text,
  p_client_ip text default 'unknown'::text
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
begin
  select * into v_rate_limit
  from public.consume_rate_limit('contact:' || v_ip || ':' || v_email, 3, 300000);

  if not v_rate_limit.allowed then
    raise exception 'Too many contact attempts';
  end if;

  if char_length(trim(coalesce(p_full_name, ''))) < 2 or char_length(trim(coalesce(p_full_name, ''))) > 120 then
    raise exception 'Invalid full name';
  end if;

  if v_email !~* '^[^\s@]+@[^\s@]+\.[^\s@]+$' or char_length(v_email) > 254 then
    raise exception 'Invalid email';
  end if;

  if char_length(trim(coalesce(p_subject, ''))) < 2 or char_length(trim(coalesce(p_subject, ''))) > 160 then
    raise exception 'Invalid subject';
  end if;

  if char_length(trim(coalesce(p_message, ''))) < 10 or char_length(trim(coalesce(p_message, ''))) > 5000 then
    raise exception 'Invalid message';
  end if;

  if p_phone is not null and char_length(trim(p_phone)) > 40 then
    raise exception 'Invalid phone';
  end if;

  insert into public.messages (full_name, email, subject, message, phone, status, language, client_ip)
  values (
    left(trim(p_full_name), 120),
    v_email,
    left(trim(p_subject), 160),
    left(trim(p_message), 5000),
    nullif(left(trim(coalesce(p_phone, '')), 40), ''),
    case when p_status in ('new', 'read', 'replied', 'archived') then p_status else 'new' end,
    case when p_language in ('pl', 'en') then p_language else 'pl' end,
    v_ip
  )
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.safe_insert_newsletter_subscriber(
  p_email text,
  p_client_ip text default 'unknown'::text
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
begin
  select * into v_rate_limit
  from public.consume_rate_limit('newsletter:' || v_ip || ':' || v_email, 5, 300000);

  if not v_rate_limit.allowed then
    raise exception 'Too many newsletter attempts';
  end if;

  if v_email !~* '^[^\s@]+@[^\s@]+\.[^\s@]+$' or char_length(v_email) > 254 then
    raise exception 'Invalid email';
  end if;

  insert into public.vv_newsletter_subscribers (email, source, tags, token, is_active)
  values (
    v_email,
    'newsletter',
    array['newsletter'],
    encode(extensions.gen_random_bytes(32), 'hex'),
    true
  )
  on conflict (email) do update
  set is_active = true,
      unsubscribed_at = null,
      updated_at = now()
  returning id into v_id;

  return v_id;
end;
$$;
