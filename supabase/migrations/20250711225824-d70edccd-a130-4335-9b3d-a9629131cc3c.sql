-- Add RLS policy to allow instructors to view enrollments in their courses
CREATE POLICY "Instructors can view enrollments for their courses" 
ON public.enrollments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = enrollments.course_id 
    AND courses.instructor_id = auth.uid()
  )
);