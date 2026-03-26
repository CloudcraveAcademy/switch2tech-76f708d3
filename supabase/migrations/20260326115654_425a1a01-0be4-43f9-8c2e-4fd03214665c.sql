-- Bulk complete enrollments older than 2 months that are not yet completed
-- This will trigger issue_certificate_on_completion for each updated row,
-- which in turn triggers notify_certificate_issued for certificate-enabled courses
UPDATE public.enrollments 
SET 
  completed = true, 
  completion_date = NOW(),
  progress = 100
WHERE enrollment_date <= NOW() - INTERVAL '2 months' 
  AND (completed = false OR completed IS NULL);