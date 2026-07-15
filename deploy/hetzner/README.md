# VEZvision PostgreSQL cutover

The application is split into three private containers: a small API for public form
writes, PostgREST for public CMS reads, and an Nginx gateway. PostgreSQL and MinIO
remain private Docker-network services; expose only the gateway through the existing
reverse proxy, for example `https://api.vezlabs.dev` in lab or the final production
API hostname.

## One-time database setup

1. Apply `schema.sql` to the dedicated `vezvision` database as its owner, then run
   `seed-from-repository.sh` to restore the public CMS defaults versioned in this repo.
2. Generate a long, unique password and run `provision-postgrest-role.sql` with it.
3. Set `DATABASE_URL` in Coolify for the restricted `vezvision_api` role, not the
   `postgres` owner.
4. Set `ALLOWED_ORIGIN` or comma-separated `ALLOWED_ORIGINS` to the website origin(s)
   allowed to call `/functions/v1/*`.
5. If Cloudflare Turnstile is enabled in the frontend (`VITE_TURNSTILE_SITE_KEY`),
   set the matching server-side `TURNSTILE_SECRET_KEY` in the API service.
6. Point `VITE_API_URL` to the public gateway and `VITE_PUBLIC_ASSETS_URL` to the
   public MinIO/CDN endpoint. Both values are build-time public configuration.

## Required cutover checks

- Import rows from the source only after a successful source backup and compare counts
  for every table in `schema.sql`.
- Copy objects from Supabase Storage bucket `vv-portfolio-images` to the MinIO bucket
  of the same name before publishing a website build.
- Verify anonymous reads return only published/active content; newsletter subscribers,
  contact messages, rate limits and view-dedup rows must return `403`.
- Exercise contact, subscribe, unsubscribe, maintenance and blog-view endpoints from
  the public origin. Configure the mail sender before accepting production forms.
