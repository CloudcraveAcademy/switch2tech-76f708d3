-- Add RLS policy to allow instructors to view transactions for their courses
CREATE POLICY "Instructors can view transactions for their courses" 
ON public.payment_transactions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = payment_transactions.course_id 
    AND courses.instructor_id = auth.uid()
  )
);