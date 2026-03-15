
-- Add missing columns to mentorship_applications
ALTER TABLE public.mentorship_applications
  ADD COLUMN IF NOT EXISTS user_current_role text,
  ADD COLUMN IF NOT EXISTS user_current_company text,
  ADD COLUMN IF NOT EXISTS career_goals text,
  ADD COLUMN IF NOT EXISTS linkedin_profile text,
  ADD COLUMN IF NOT EXISTS github_profile text,
  ADD COLUMN IF NOT EXISTS portfolio_url text,
  ADD COLUMN IF NOT EXISTS phone_number text,
  ADD COLUMN IF NOT EXISTS years_of_experience integer,
  ADD COLUMN IF NOT EXISTS testimonial_text text,
  ADD COLUMN IF NOT EXISTS testimonial_consent boolean DEFAULT false;

-- Add missing columns to internship_applications
ALTER TABLE public.internship_applications
  ADD COLUMN IF NOT EXISTS user_current_role text,
  ADD COLUMN IF NOT EXISTS user_current_company text,
  ADD COLUMN IF NOT EXISTS career_goals text,
  ADD COLUMN IF NOT EXISTS linkedin_profile text,
  ADD COLUMN IF NOT EXISTS github_profile text,
  ADD COLUMN IF NOT EXISTS portfolio_url text,
  ADD COLUMN IF NOT EXISTS phone_number text,
  ADD COLUMN IF NOT EXISTS years_of_experience integer,
  ADD COLUMN IF NOT EXISTS testimonial_text text,
  ADD COLUMN IF NOT EXISTS testimonial_consent boolean DEFAULT false;
