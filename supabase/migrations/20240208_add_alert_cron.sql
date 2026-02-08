-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage to postgres
GRANT USAGE ON SCHEMA cron TO postgres;

-- Schedule the generate-alerts function to run every hour
-- This calls the Edge Function via HTTP
SELECT cron.schedule(
  'generate-alerts-hourly',  -- job name
  '0 * * * *',               -- every hour at minute 0
  $$
  SELECT
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/generate-alerts',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- To verify the job was created:
-- SELECT * FROM cron.job;

-- To remove the job if needed:
-- SELECT cron.unschedule('generate-alerts-hourly');
