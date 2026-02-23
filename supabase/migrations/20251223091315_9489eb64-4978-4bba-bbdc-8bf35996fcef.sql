-- Remove the unused global_css column from site_config table
-- This eliminates the CSS injection risk since the CSS editor feature was removed
ALTER TABLE public.site_config DROP COLUMN IF EXISTS global_css;