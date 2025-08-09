-- Clear enrollment and payment records for fresh testing
-- This allows testing the payment flow again

-- Delete payment transactions first (due to potential foreign key constraints)
DELETE FROM public.payment_transactions 
WHERE course_id IN (
  SELECT id FROM public.courses 
  WHERE instructor_id IS NOT NULL
);

-- Delete enrollments for courses with instructors
DELETE FROM public.enrollments 
WHERE course_id IN (
  SELECT id FROM public.courses 
  WHERE instructor_id IS NOT NULL
);

-- Also clear any related notifications for these enrollments
DELETE FROM public.notifications 
WHERE type IN ('enrollment', 'new_enrollment', 'student_certificate_issued')
AND course_id IN (
  SELECT id FROM public.courses 
  WHERE instructor_id IS NOT NULL
);