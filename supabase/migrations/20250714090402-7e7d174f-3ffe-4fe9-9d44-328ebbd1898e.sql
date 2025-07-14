-- Insert sample payment transactions for testing revenue pages
-- Using actual course IDs and user IDs from the database

INSERT INTO public.payment_transactions (
  user_id, 
  course_id, 
  amount, 
  currency, 
  status, 
  payment_method, 
  payment_reference, 
  paystack_reference,
  metadata,
  created_at
) VALUES 
  -- Recent transactions (last 7 days) - for instructor 74ee8d54-684d-4e9a-928a-760b32167eeb
  ('0f60628b-7bd6-490a-a7d5-d396b3a5af20', '67bf49ff-cf9e-4a24-a65b-f2f88973f79b', 25000, 'NGN', 'completed', 'card', 'PAY_REF_001', 'PS_REF_001', '{"course_title": "Generative AI Fundamentals"}', now() - interval '2 days'),
  ('ac4803b5-8cd1-4a44-928a-7be898197235', '6575bd03-b789-422d-baea-9773f2f74d04', 18000, 'NGN', 'completed', 'bank_transfer', 'PAY_REF_002', 'PS_REF_002', '{"course_title": "UI / UX for Beginners"}', now() - interval '5 days'),
  
  -- Transactions from last 30 days
  ('0f60628b-7bd6-490a-a7d5-d396b3a5af20', '4f9d553d-75fb-47b4-a81b-892be1deca43', 15000, 'NGN', 'completed', 'card', 'PAY_REF_003', 'PS_REF_003', '{"course_title": "Tech for Beginner"}', now() - interval '15 days'),
  ('ac4803b5-8cd1-4a44-928a-7be898197235', '67bf49ff-cf9e-4a24-a65b-f2f88973f79b', 25000, 'NGN', 'completed', 'ussd', 'PAY_REF_004', 'PS_REF_004', '{"course_title": "Generative AI Fundamentals"}', now() - interval '20 days'),
  ('74ee8d54-684d-4e9a-928a-760b32167eeb', 'ad94c3db-5ed9-44e0-b277-26395f8f40ae', 22000, 'NGN', 'completed', 'card', 'PAY_REF_005', 'PS_REF_005', '{"course_title": "Software Testing"}', now() - interval '25 days'),
  
  -- Transactions from last 90 days - for instructor ac4803b5-8cd1-4a44-928a-7be898197235
  ('74ee8d54-684d-4e9a-928a-760b32167eeb', 'a11d7f37-8025-4d36-96de-f119e0b2cd65', 20000, 'NGN', 'completed', 'card', 'PAY_REF_006', 'PS_REF_006', '{"course_title": "Social Media Management"}', now() - interval '45 days'),
  ('0f60628b-7bd6-490a-a7d5-d396b3a5af20', 'ad94c3db-5ed9-44e0-b277-26395f8f40ae', 22000, 'NGN', 'completed', 'bank_transfer', 'PAY_REF_007', 'PS_REF_007', '{"course_title": "Software Testing"}', now() - interval '60 days'),
  ('ac4803b5-8cd1-4a44-928a-7be898197235', '6575bd03-b789-422d-baea-9773f2f74d04', 18000, 'NGN', 'completed', 'card', 'PAY_REF_008', 'PS_REF_008', '{"course_title": "UI / UX for Beginners"}', now() - interval '75 days'),
  
  -- Older transactions (over 1 year)
  ('74ee8d54-684d-4e9a-928a-760b32167eeb', '4f9d553d-75fb-47b4-a81b-892be1deca43', 12000, 'NGN', 'completed', 'card', 'PAY_REF_009', 'PS_REF_009', '{"course_title": "Tech for Beginner", "discount_applied": true}', now() - interval '14 months'),
  ('0f60628b-7bd6-490a-a7d5-d396b3a5af20', 'a11d7f37-8025-4d36-96de-f119e0b2cd65', 20000, 'NGN', 'completed', 'ussd', 'PAY_REF_010', 'PS_REF_010', '{"course_title": "Social Media Management", "promo_code": "EARLY2023"}', now() - interval '18 months'),
  
  -- More recent transactions for better testing
  ('ac4803b5-8cd1-4a44-928a-7be898197235', '67bf49ff-cf9e-4a24-a65b-f2f88973f79b', 25000, 'NGN', 'completed', 'card', 'PAY_REF_011', 'PS_REF_011', '{"course_title": "Generative AI Fundamentals"}', now() - interval '10 days'),
  ('74ee8d54-684d-4e9a-928a-760b32167eeb', '6575bd03-b789-422d-baea-9773f2f74d04', 18000, 'NGN', 'completed', 'bank_transfer', 'PAY_REF_012', 'PS_REF_012', '{"course_title": "UI / UX for Beginners"}', now() - interval '1 day');

COMMENT ON TABLE public.payment_transactions IS 'Sample data added for testing revenue pages across different time periods, amounts, and instructors.';