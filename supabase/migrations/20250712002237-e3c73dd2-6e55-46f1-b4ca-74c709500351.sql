-- Create trigger to automatically issue certificates when course is completed
CREATE OR REPLACE FUNCTION public.issue_certificate_on_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Check if course is completed and certificate doesn't already exist
  IF NEW.completed = true AND OLD.completed = false THEN
    -- Check if course has certificates enabled
    IF EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = NEW.course_id 
      AND certificate_enabled = true
    ) THEN
      -- Insert certificate if it doesn't exist
      INSERT INTO public.certificates (student_id, course_id)
      VALUES (NEW.student_id, NEW.course_id)
      ON CONFLICT (student_id, course_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create the trigger on the enrollments table
DROP TRIGGER IF EXISTS trigger_issue_certificate ON public.enrollments;
CREATE TRIGGER trigger_issue_certificate
  AFTER UPDATE ON public.enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.issue_certificate_on_completion();

-- Add unique constraint to prevent duplicate certificates
ALTER TABLE public.certificates 
ADD CONSTRAINT certificates_student_course_unique 
UNIQUE (student_id, course_id);