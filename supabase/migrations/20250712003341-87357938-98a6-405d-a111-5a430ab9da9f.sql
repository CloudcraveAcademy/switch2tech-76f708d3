-- Insert sample notifications for different users
INSERT INTO public.notifications (user_id, type, title, description, read, action_url, course_id, instructor_id, metadata)
VALUES 
-- Notifications for instructor (74ee8d54-684d-4e9a-928a-760b32167eeb)
('74ee8d54-684d-4e9a-928a-760b32167eeb', 'system', 'Welcome to the platform!', 'Your instructor account has been successfully set up. Start creating amazing courses!', true, '/dashboard/create-course', NULL, NULL, '{}'),
('74ee8d54-684d-4e9a-928a-760b32167eeb', 'certificate', 'Certificate generated', 'A new certificate has been issued for one of your course completions.', false, '/dashboard/certificates', NULL, NULL, '{}'),
('74ee8d54-684d-4e9a-928a-760b32167eeb', 'payment', 'Payment received', 'You have received a payment of ₦25,000 for course enrollment.', false, '/dashboard/revenue', NULL, NULL, '{"amount": 25000, "currency": "NGN"}'),

-- Notifications for student (327bb17b-a7e7-4288-aca7-fd11752c1a66) 
('327bb17b-a7e7-4288-aca7-fd11752c1a66', 'enrollment', 'Course enrollment confirmed', 'You have successfully enrolled in Advanced React Development. Welcome!', false, '/dashboard/my-courses', 
  (SELECT id FROM public.courses WHERE instructor_id = '74ee8d54-684d-4e9a-928a-760b32167eeb' LIMIT 1), 
  '74ee8d54-684d-4e9a-928a-760b32167eeb', 
  '{}'),
('327bb17b-a7e7-4288-aca7-fd11752c1a66', 'course', 'New lesson available', 'A new lesson has been added to your enrolled course. Check it out now!', false, '/courses', 
  (SELECT id FROM public.courses WHERE instructor_id = '74ee8d54-684d-4e9a-928a-760b32167eeb' LIMIT 1), 
  '74ee8d54-684d-4e9a-928a-760b32167eeb', 
  '{}'),
('327bb17b-a7e7-4288-aca7-fd11752c1a66', 'announcement', 'Platform update', 'We have updated our platform with new features. Explore the enhanced learning experience!', true, '/dashboard', NULL, NULL, '{}'),
('327bb17b-a7e7-4288-aca7-fd11752c1a66', 'certificate', 'Certificate earned!', 'Congratulations! You have earned a certificate for completing the course.', false, '/dashboard/certificates', NULL, NULL, '{}'),

-- More notifications for variety
('327bb17b-a7e7-4288-aca7-fd11752c1a66', 'message', 'Instructor feedback', 'Your instructor has provided feedback on your recent assignment submission.', false, '/dashboard/assignments', 
  (SELECT id FROM public.courses WHERE instructor_id = '74ee8d54-684d-4e9a-928a-760b32167eeb' LIMIT 1), 
  '74ee8d54-684d-4e9a-928a-760b32167eeb', 
  '{}'),
('327bb17b-a7e7-4288-aca7-fd11752c1a66', 'assignment', 'Assignment due soon', 'Your assignment for React Fundamentals is due in 2 days. Make sure to submit on time!', false, '/dashboard/assignments', 
  (SELECT id FROM public.courses WHERE instructor_id = '74ee8d54-684d-4e9a-928a-760b32167eeb' LIMIT 1), 
  '74ee8d54-684d-4e9a-928a-760b32167eeb', 
  '{}');