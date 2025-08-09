-- Clear payment transactions and enrollments for fresh testing
-- Delete payment transactions for the course
DELETE FROM payment_transactions 
WHERE course_id = '3876a85b-296b-4b2f-aff6-11172ad4bddc';

-- Delete enrollments for the course  
DELETE FROM enrollments 
WHERE course_id = '3876a85b-296b-4b2f-aff6-11172ad4bddc';

-- Delete any certificates that might have been issued
DELETE FROM certificates 
WHERE course_id = '3876a85b-296b-4b2f-aff6-11172ad4bddc';

-- Delete any student lesson progress for this course
DELETE FROM student_lesson_progress 
WHERE course_id = '3876a85b-296b-4b2f-aff6-11172ad4bddc';

-- Delete any class attendance records for this course
DELETE FROM class_attendance 
WHERE course_id = '3876a85b-296b-4b2f-aff6-11172ad4bddc';