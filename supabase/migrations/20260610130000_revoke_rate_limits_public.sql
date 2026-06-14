-- Defense-in-depth: legacy rate_limits table should not be writable by anon/authenticated.

REVOKE ALL ON TABLE public.rate_limits FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.rate_limits TO service_role;
