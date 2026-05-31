-- Keep existing policies stable while moving SECURITY DEFINER logic out of the exposed public API surface.

create schema if not exists app_private;
revoke all on schema app_private from public;
grant usage on schema app_private to authenticated, service_role;

create or replace function app_private.vv_is_admin()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('super_admin', 'admin')
  );
$$;

create or replace function app_private.vv_has_files_permission(required_key text)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'super_admin')
  )
  or exists (
    select 1
    from public.user_permissions up
    where up.user_id = auth.uid() and up.permission_key = required_key
  );
$$;

create or replace function app_private.vv_has_root_files_permission(required_key text)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'super_admin')
  )
  or exists (
    select 1
    from public.user_permissions up
    where up.user_id = auth.uid() and up.permission_key = required_key
  );
$$;

create or replace function app_private.vv_has_folder_manage_access(target_folder_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public', 'app_private'
as $$
  with recursive folder_chain as (
    select f.id, f.parent_id
    from public.vv_folders f
    where f.id = target_folder_id

    union all

    select parent.id, parent.parent_id
    from public.vv_folders parent
    inner join folder_chain child on child.parent_id = parent.id
  )
  select
    target_folder_id is not null
    and target_folder_id <> '00000000-0000-0000-0000-000000000001'::uuid
    and (
      exists (
        select 1
        from public.profiles p
        where p.id = auth.uid() and p.role in ('admin', 'super_admin')
      )
      or (
        app_private.vv_has_files_permission('vezvision.files.manage')
        and exists (
          select 1
          from public.vv_file_permissions fp
          where fp.user_id = auth.uid()
            and fp.folder_id in (select id from folder_chain)
            and fp.can_manage = true
        )
      )
    );
$$;

grant execute on function app_private.vv_is_admin() to anon, authenticated, service_role;
grant execute on function app_private.vv_has_files_permission(text) to authenticated, service_role;
grant execute on function app_private.vv_has_root_files_permission(text) to authenticated, service_role;
grant execute on function app_private.vv_has_folder_manage_access(uuid) to authenticated, service_role;

create or replace function public.vv_is_admin()
returns boolean
language sql
stable
security invoker
set search_path to 'public', 'app_private'
as $$
  select app_private.vv_is_admin();
$$;

create or replace function public.vv_has_files_permission(required_key text)
returns boolean
language sql
stable
security invoker
set search_path to 'public', 'app_private'
as $$
  select app_private.vv_has_files_permission(required_key);
$$;

create or replace function public.vv_has_root_files_permission(required_key text)
returns boolean
language sql
stable
security invoker
set search_path to 'public', 'app_private'
as $$
  select app_private.vv_has_root_files_permission(required_key);
$$;

create or replace function public.vv_has_folder_manage_access(target_folder_id uuid)
returns boolean
language sql
stable
security invoker
set search_path to 'public', 'app_private'
as $$
  select app_private.vv_has_folder_manage_access(target_folder_id);
$$;

grant execute on function public.vv_is_admin() to anon, authenticated;
grant execute on function public.vv_has_files_permission(text) to authenticated;
grant execute on function public.vv_has_root_files_permission(text) to authenticated;
grant execute on function public.vv_has_folder_manage_access(uuid) to authenticated;
