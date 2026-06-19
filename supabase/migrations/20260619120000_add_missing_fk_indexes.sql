-- Add missing indexes on foreign key columns used by public site queries.
-- Public-read critical (JOINs from public SPA):
--   vv_faq_items.category_id        — FAQ section JOINs categories
--   vv_blog_post_categories.post_id  — blog post → categories
--   vv_project_images.project_id     — portfolio detail → images
--   vv_project_technologies.project_id — portfolio detail → technologies
-- Admin/dashboard (created_by lookups in VezCore):
--   vv_blog_posts.author_id, vv_blog_posts.created_by
--   vv_projects.created_by, vv_services.created_by
--   vv_faq_categories.created_by, vv_faq_items.created_by
--   vv_newsletter_campaigns.created_by, vv_calendar_events.created_by
--   vv_message_send_logs.message_id
-- Filesystem (VezCore file manager):
--   vv_files.folder_id, vv_files.owner_user_id
--   vv_folders.parent_id, vv_folders.owner_user_id
--   vv_file_events.file_id, vv_file_events.folder_id, vv_file_events.actor_user_id
--   vv_file_permissions.file_id, vv_file_permissions.folder_id
--   vv_project_category_assignments.project_id
--   vv_service_category_assignments.service_id
--   vv_blog_post_categories.post_id (covered above)
-- Profiles/RBAC:
--   profiles.id (PK already indexed — skip)
--   user_permissions.user_id, user_permissions.granted_by
--
-- All created CONCURRENTLY to avoid lock contention on production.

create index concurrently if not exists idx_vv_faq_items_category_id on public.vv_faq_items(category_id);
create index concurrently if not exists idx_vv_blog_post_categories_post_id on public.vv_blog_post_categories(post_id);
create index concurrently if not exists idx_vv_project_images_project_id on public.vv_project_images(project_id);
create index concurrently if not exists idx_vv_project_technologies_project_id on public.vv_project_technologies(project_id);

create index concurrently if not exists idx_vv_blog_posts_author_id on public.vv_blog_posts(author_id);
create index concurrently if not exists idx_vv_blog_posts_created_by on public.vv_blog_posts(created_by);
create index concurrently if not exists idx_vv_projects_created_by on public.vv_projects(created_by);
create index concurrently if not exists idx_vv_services_created_by on public.vv_services(created_by);
create index concurrently if not exists idx_vv_faq_categories_created_by on public.vv_faq_categories(created_by);
create index concurrently if not exists idx_vv_faq_items_created_by on public.vv_faq_items(created_by);
create index concurrently if not exists idx_vv_newsletter_campaigns_created_by on public.vv_newsletter_campaigns(created_by);
create index concurrently if not exists idx_vv_calendar_events_created_by on public.vv_calendar_events(created_by);
create index concurrently if not exists idx_vv_message_send_logs_message_id on public.vv_message_send_logs(message_id);

create index concurrently if not exists idx_vv_files_folder_id on public.vv_files(folder_id);
create index concurrently if not exists idx_vv_files_owner_user_id on public.vv_files(owner_user_id);
create index concurrently if not exists idx_vv_folders_parent_id on public.vv_folders(parent_id);
create index concurrently if not exists idx_vv_folders_owner_user_id on public.vv_folders(owner_user_id);
create index concurrently if not exists idx_vv_file_events_file_id on public.vv_file_events(file_id);
create index concurrently if not exists idx_vv_file_events_folder_id on public.vv_file_events(folder_id);
create index concurrently if not exists idx_vv_file_events_actor_user_id on public.vv_file_events(actor_user_id);
create index concurrently if not exists idx_vv_file_permissions_file_id on public.vv_file_permissions(file_id);
create index concurrently if not exists idx_vv_file_permissions_folder_id on public.vv_file_permissions(folder_id);
create index concurrently if not exists idx_vv_project_category_assignments_project_id on public.vv_project_category_assignments(project_id);
create index concurrently if not exists idx_vv_service_category_assignments_service_id on public.vv_service_category_assignments(service_id);

create index concurrently if not exists idx_user_permissions_user_id on public.user_permissions(user_id);
create index concurrently if not exists idx_user_permissions_granted_by on public.user_permissions(granted_by);
