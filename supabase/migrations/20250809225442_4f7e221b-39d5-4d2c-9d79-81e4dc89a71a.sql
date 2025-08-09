-- Clear enrollment and payment records for fresh testing of currency conversion fix
-- This will allow testing the corrected pricing calculation flow

-- Delete payment transactions for the course
DELETE FROM public.payment_transactions 
WHERE course_id = '3876a85b-296b-4b2f-aff6-11172ad4bddc';

-- Delete enrollments for the course
DELETE FROM public.enrollments 
WHERE course_id = '3876a85b-296b-4b2f-aff6-11172ad4bddc';

-- Delete any certificates issued for this course
DELETE FROM public.certificates 
WHERE course_id = '3876a85b-296b-4b2f-aff6-11172ad4bddc';

-- Delete any class attendance records for this course
DELETE FROM public.class_attendance 
WHERE course_id = '3876a85b-296b-4b2f-aff6-11172ad4bddc';

-- Delete any notifications related to this course for clean testing
DELETE FROM public.notifications 
WHERE course_id = '3876a85b-296b-4b2f-aff6-11172ad4bddc';