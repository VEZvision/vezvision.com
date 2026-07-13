-- Create storage bucket for portfolio images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 5242880, ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/svg+xml']);

-- Create storage policies for portfolio bucket
-- Public can read all files
create policy "Public can read portfolio files" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'portfolio');

-- Admin can upload/update/delete files
create policy "Admin can manage portfolio files" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'portfolio' and
    exists (
      select 1 from public.admins
      where admins.username = auth.jwt() ->> 'email' and admins.is_active = true
    )
  );

-- Grant permissions
grant usage on schema storage to anon, authenticated;
grant all on storage.objects to authenticated;
grant all on storage.buckets to authenticated;