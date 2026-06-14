DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'admin_login'
  ) THEN
    REVOKE ALL ON FUNCTION public.admin_login(text, text) FROM PUBLIC;
    DROP FUNCTION public.admin_login(text, text);
  END IF;
END $$;
