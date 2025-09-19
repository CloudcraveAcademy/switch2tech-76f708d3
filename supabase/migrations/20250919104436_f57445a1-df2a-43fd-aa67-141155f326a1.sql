-- First check what notification types are currently allowed
SELECT 
  conname, 
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'notifications_type_check';