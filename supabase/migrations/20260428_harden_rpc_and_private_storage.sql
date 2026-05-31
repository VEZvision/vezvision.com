-- Restrict public RPC exposure and align private file Storage reads with ACL data.

revoke execute on function public.safe_insert_contact_message(text, text, text, text, text, text, text, text) from anon, authenticated, public;
revoke execute on function public.safe_insert_newsletter_subscriber(text, text) from anon, authenticated, public;
grant execute on function public.safe_insert_contact_message(text, text, text, text, text, text, text, text) to service_role;
grant execute on function public.safe_insert_newsletter_subscriber(text, text) to service_role;

revoke execute on function public.unsubscribe_by_email(text) from anon, authenticated, public;

drop policy if exists vv_files_private_view_select on storage.objects;
create policy vv_files_private_view_select
on storage.objects
for select
to authenticated
using (
  bucket_id = 'vv-files-private'
  and exists (
    select 1
    from public.vv_files f
    where f.storage_bucket = storage.objects.bucket_id
      and f.storage_path = storage.objects.name
      and f.deleted_at is null
      and (
        exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role in ('admin', 'super_admin')
        )
        or f.owner_user_id = auth.uid()
        or exists (
          select 1
          from public.vv_file_permissions fp
          where fp.file_id = f.id
            and fp.user_id = auth.uid()
            and fp.can_view = true
        )
        or exists (
          select 1
          from public.vv_file_permissions fp
          where fp.folder_id = f.folder_id
            and fp.user_id = auth.uid()
            and fp.can_view = true
        )
      )
  )
);
