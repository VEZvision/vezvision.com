# Video Assets CDN Strategy

**Date:** 2026-06-19
**Status:** Documented — migration deferred until Supabase Storage bucket is configured

## Current state

Two video files are committed directly in `public/`:

- `aMPvRVYHFQxBoB0v2qyJln83jI.mp4` (131KB) — hero/home background video
- `aMPvRVYHFQxBoB0v2qyJln83jI.webm` (134KB) — WebM version
- `navons.mp4` (1.1MB) — footer/other pages background video
- `navons.webm` (1.3MB) — WebM version

Total: ~2.5MB in the repository. Every `git clone` downloads these files.

## Recommended approach

Move video files to Supabase Storage public bucket (`vezvision-assets`) or a CDN (Cloudflare R2).

### Benefits

- Smaller repository (faster clones, less storage)
- CDN-level cache control and edge distribution
- Easy A/B testing (swap video URL without code change)
- Conditional loading based on network conditions (already supported via `usePrefersReducedData`)

### Migration steps (when ready)

1. Upload video files to Supabase Storage bucket `vezvision-assets`:

   ```bash
   supabase storage upload vezvision-assets/videos/footer-home.webm public/aMPvRVYHFQxBoB0v2qyJln83jI.webm
   supabase storage upload vezvision-assets/videos/footer-default.webm public/navons.webm
   ```

2. Set bucket to public read: `supabase storage bucket update vezvision-assets --public`

3. Update `Footer.tsx` and `Hero.tsx` to build video URLs from `storageBaseUrl`:

   ```typescript
   const storageBaseUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/vezvision-assets`;
   const videoSrc = `${storageBaseUrl}/videos/footer-home.webm`;
   ```

4. Remove video files from `public/` and from git tracking

5. Add `public/*.mp4` and `public/*.webm` to `.gitignore` (except small placeholder if needed)

### Why deferred

- Current video files are small (total 2.5MB) — not a critical performance issue
- Supabase Storage bucket `vezvision-assets` exists but video files are not yet uploaded
- Requires testing video playback from Storage URL (CORS, range requests, seeking)
- Can be done in a focused PR without affecting other work
