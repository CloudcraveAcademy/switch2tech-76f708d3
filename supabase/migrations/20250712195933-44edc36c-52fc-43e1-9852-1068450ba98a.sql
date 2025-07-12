-- Create a function to manually issue certificates for completed courses
CREATE OR REPLACE FUNCTION public.issue_missing_certificates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert certificates for all completed enrollments where course has certificates enabled
  -- and no certificate exists yet
  INSERT INTO public.certificates (student_id, course_id)
  SELECT DISTINCT e.student_id, e.course_id
  FROM public.enrollments e
  JOIN public.courses c ON c.id = e.course_id
  WHERE e.completed = true 
    AND c.certificate_enabled = true
    AND NOT EXISTS (
      SELECT 1 FROM public.certificates cert 
      WHERE cert.student_id = e.student_id 
      AND cert.course_id = e.course_id
    );
END;
$$;