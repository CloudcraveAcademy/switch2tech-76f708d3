-- Drop the existing restrictive insert policy
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Create a more permissive insert policy for notifications
CREATE POLICY "Allow authenticated users to insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);