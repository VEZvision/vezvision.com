DO $$
BEGIN
  IF to_regprocedure('public.check_ip_allowed(text)') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION public.check_ip_allowed(text) FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.check_ip_allowed(text) TO service_role;
  END IF;
END $$;
