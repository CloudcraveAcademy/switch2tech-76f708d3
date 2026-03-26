-- Bulk complete enrollments older than 1 month that are not yet completed
-- Triggers issue_certificate_on_completion and notify_certificate_issued will fire automatically
UPDATE public.enrollments 
SET 
  completed = true, 
  completion_date = NOW(),
  progress = 100
WHERE enrollment_date <= NOW() - INTERVAL '1 month' 
  AND (completed = false OR completed IS NULL);