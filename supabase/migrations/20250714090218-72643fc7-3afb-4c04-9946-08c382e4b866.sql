-- Insert sample payment transactions for testing revenue pages
-- Note: Replace the UUIDs below with actual user_ids and course_ids from your database

-- Sample transactions with various amounts, dates, and statuses
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
  -- Recent transactions (last 7 days)
  ('0f60628b-7bd6-490a-a7d5-d396b3a5af20', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 25000, 'NGN', 'completed', 'card', 'PAY_REF_001', 'PS_REF_001', '{"course_title": "Web Development Bootcamp"}', now() - interval '2 days'),
  ('74ee8d54-684d-4e9a-928a-760b32167eeb', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 25000, 'NGN', 'success', 'bank_transfer', 'PAY_REF_002', 'PS_REF_002', '{"course_title": "Web Development Bootcamp"}', now() - interval '5 days'),
  
  -- Transactions from last 30 days
  ('0f60628b-7bd6-490a-a7d5-d396b3a5af20', 'a1b2c3d4-e5f6-4789-a012-345678901234', 15000, 'NGN', 'completed', 'card', 'PAY_REF_003', 'PS_REF_003', '{"course_title": "React Masterclass"}', now() - interval '15 days'),
  ('74ee8d54-684d-4e9a-928a-760b32167eeb', 'a1b2c3d4-e5f6-4789-a012-345678901234', 15000, 'NGN', 'completed', 'ussd', 'PAY_REF_004', 'PS_REF_004', '{"course_title": "React Masterclass"}', now() - interval '20 days'),
  ('0f60628b-7bd6-490a-a7d5-d396b3a5af20', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 25000, 'NGN', 'success', 'card', 'PAY_REF_005', 'PS_REF_005', '{"course_title": "Web Development Bootcamp"}', now() - interval '25 days'),
  
  -- Transactions from last 90 days
  ('74ee8d54-684d-4e9a-928a-760b32167eeb', 'b2c3d4e5-f6a7-4890-b123-456789012345', 35000, 'NGN', 'completed', 'card', 'PAY_REF_006', 'PS_REF_006', '{"course_title": "Full Stack Development"}', now() - interval '45 days'),
  ('0f60628b-7bd6-490a-a7d5-d396b3a5af20', 'b2c3d4e5-f6a7-4890-b123-456789012345', 35000, 'NGN', 'completed', 'bank_transfer', 'PAY_REF_007', 'PS_REF_007', '{"course_title": "Full Stack Development"}', now() - interval '60 days'),
  ('74ee8d54-684d-4e9a-928a-760b32167eeb', 'a1b2c3d4-e5f6-4789-a012-345678901234', 15000, 'NGN', 'success', 'card', 'PAY_REF_008', 'PS_REF_008', '{"course_title": "React Masterclass"}', now() - interval '75 days'),
  
  -- Older transactions (over 1 year)
  ('0f60628b-7bd6-490a-a7d5-d396b3a5af20', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 20000, 'NGN', 'completed', 'card', 'PAY_REF_009', 'PS_REF_009', '{"course_title": "Web Development Bootcamp", "discount_applied": true}', now() - interval '14 months'),
  ('74ee8d54-684d-4e9a-928a-760b32167eeb', 'b2c3d4e5-f6a7-4890-b123-456789012345', 30000, 'NGN', 'success', 'ussd', 'PAY_REF_010', 'PS_REF_010', '{"course_title": "Full Stack Development", "promo_code": "EARLY2023"}', now() - interval '18 months'),
  
  -- Different currencies for testing
  ('0f60628b-7bd6-490a-a7d5-d396b3a5af20', 'a1b2c3d4-e5f6-4789-a012-345678901234', 50, 'USD', 'completed', 'card', 'PAY_REF_011', 'PS_REF_011', '{"course_title": "React Masterclass", "currency_converted": true}', now() - interval '10 days');

-- Add some pending/failed transactions for testing edge cases
INSERT INTO public.payment_transactions (
  user_id, 
  course_id, 
  amount, 
  currency, 
  status, 
  payment_method, 
  payment_reference,
  metadata,
  created_at
) VALUES 
  ('74ee8d54-684d-4e9a-928a-760b32167eeb', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 25000, 'NGN', 'pending', 'card', 'PAY_REF_012', '{"course_title": "Web Development Bootcamp"}', now() - interval '1 day'),
  ('0f60628b-7bd6-490a-a7d5-d396b3a5af20', 'b2c3d4e5-f6a7-4890-b123-456789012345', 35000, 'NGN', 'failed', 'bank_transfer', 'PAY_REF_013', '{"course_title": "Full Stack Development", "failure_reason": "insufficient_funds"}', now() - interval '3 days');

COMMENT ON TABLE public.payment_transactions IS 'Sample data has been added for testing revenue pages. Includes transactions across different time periods, statuses, and amounts.';