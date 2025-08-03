-- Update student_success_stories table to support application testimonials
ALTER TABLE public.student_success_stories 
ADD COLUMN IF NOT EXISTS application_type text,
ADD COLUMN IF NOT EXISTS application_id uuid;

-- Update mentorship_applications table with testimonial and additional fields
ALTER TABLE public.mentorship_applications 
ADD COLUMN IF NOT EXISTS testimonial_text text,
ADD COLUMN IF NOT EXISTS testimonial_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS user_current_role text,
ADD COLUMN IF NOT EXISTS user_current_company text,
ADD COLUMN IF NOT EXISTS career_goals text,
ADD COLUMN IF NOT EXISTS linkedin_profile text,
ADD COLUMN IF NOT EXISTS github_profile text,
ADD COLUMN IF NOT EXISTS portfolio_url text,
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS years_of_experience integer;

-- Create internship_applications table
CREATE TABLE IF NOT EXISTS public.internship_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.internship_programs(id),
  student_id uuid NOT NULL,
  application_text text,
  status text DEFAULT 'pending'::text,
  testimonial_text text,
  testimonial_consent boolean DEFAULT false,
  user_current_role text,
  user_current_company text,
  career_goals text,
  linkedin_profile text,
  github_profile text,
  portfolio_url text,
  phone_number text,
  years_of_experience integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on internship_applications
ALTER TABLE public.internship_applications ENABLE ROW LEVEL SECURITY;

-- RLS policies for internship_applications
CREATE POLICY "Students can insert their own internship applications" 
ON public.internship_applications
FOR INSERT 
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Users can view their own internship applications" 
ON public.internship_applications
FOR SELECT 
USING (student_id = auth.uid() OR is_admin());

CREATE POLICY "Admins can do everything on internship_applications" 
ON public.internship_applications
FOR ALL 
USING (is_admin());

-- Add updated_at trigger for internship_applications
CREATE TRIGGER internship_applications_updated_at_trigger
BEFORE UPDATE ON public.internship_applications
FOR EACH ROW
EXECUTE PROCEDURE public.update_updated_at_column();

COMMENT ON TABLE public.internship_applications IS 'Stores internship program applications with testimonial collection';