-- Add social media link columns to site_settings
-- Run this migration in Supabase SQL Editor

ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS instagram_url text,
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS github_url text;
