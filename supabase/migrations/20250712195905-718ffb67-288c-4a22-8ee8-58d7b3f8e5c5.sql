-- Create trigger to automatically issue certificates when course is completed
CREATE TRIGGER trigger_issue_certificate_on_completion
  AFTER UPDATE ON public.enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.issue_certificate_on_completion();

-- Also create a unique constraint to prevent duplicate certificates
ALTER TABLE public.certificates 
ADD CONSTRAINT unique_student_course_certificate 
UNIQUE (student_id, course_id);