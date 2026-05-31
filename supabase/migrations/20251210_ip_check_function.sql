create or replace function public.check_ip_allowed(check_ip text)
returns boolean
language plpgsql
security definer
as $$
declare
  enabled boolean;
  allowed boolean;
begin
  -- Check if restriction is enabled
  select ip_restriction_enabled into enabled from public.security_settings limit 1;
  
  -- If settings not found or disabled, allow
  if enabled is null or enabled = false then
    return true;
  end if;

  -- Check if IP is in whitelist
  select exists(select 1 from public.whitelisted_ips where ip_address = check_ip) into allowed;
  
  return allowed;
end;
$$;
