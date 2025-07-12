-- Create some test enrollments with completed status to trigger certificate creation
-- First, let's update some courses to be certificate-enabled
UPDATE public.courses 
SET certificate_enabled = true 
WHERE instructor_id = '327bb17b-a7e7-4288-aca7-fd11752c1a66' 
AND id IN (
  SELECT id FROM public.courses 
  WHERE instructor_id = '327bb17b-a7e7-4288-aca7-fd11752c1a66' 
  LIMIT 3
);

-- Create test enrollments for demonstration
INSERT INTO public.enrollments (student_id, course_id, completed, progress, completion_date, enrollment_date)
SELECT 
  '74ee8d54-684d-4e9a-928a-760b32167eeb' as student_id,
  id as course_id,
  true as completed,
  100 as progress,
  NOW() as completion_date,
  NOW() - INTERVAL '30 days' as enrollment_date
FROM public.courses 
WHERE instructor_id = '327bb17b-a7e7-4288-aca7-fd11752c1a66' 
AND certificate_enabled = true
LIMIT 2
ON CONFLICT (student_id, course_id) DO UPDATE SET 
  completed = true,
  progress = 100,
  completion_date = NOW();