-- Bulk complete enrollments older than 3 months that are not yet completed
-- This will trigger issue_certificate_on_completion for each row
UPDATE public.enrollments 
SET 
  completed = true, 
  completion_date = NOW(),
  progress = 100
WHERE enrollment_date <= NOW() - INTERVAL '3 months' 
  AND (completed = false OR completed IS NULL);