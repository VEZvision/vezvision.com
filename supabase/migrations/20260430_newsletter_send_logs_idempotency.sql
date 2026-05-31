create unique index if not exists vv_newsletter_send_logs_unique_sent
  on public.vv_newsletter_send_logs (campaign_id, subscriber_id, status)
  where status = 'sent';
