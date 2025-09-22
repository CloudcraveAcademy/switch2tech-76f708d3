-- Enable certificates for existing courses (for testing)
UPDATE public.courses 
SET certificate_enabled = true 
WHERE id IN ('1a5ad4ed-5f77-4dfa-9674-c1c4c97cf14d', 'd731bb7e-6f4d-46a3-b47f-c96df783e053');

-- Issue missing certificates for completed enrollments where certificates are enabled
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

-- Create improved trigger for certificate issuance
CREATE OR REPLACE FUNCTION public.issue_certificate_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when enrollment is marked as completed
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    
    -- Check if course has certificates enabled
    IF EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = NEW.course_id 
      AND certificate_enabled = true
    ) THEN
      
      -- Get course mode to check completion requirements
      DECLARE
        course_mode text;
        attendance_progress numeric := 100; -- Default to 100% for non-live courses
      BEGIN
        SELECT mode INTO course_mode
        FROM public.courses
        WHERE id = NEW.course_id;

        -- For virtual-live courses, check attendance requirement
        IF course_mode = 'virtual-live' THEN
          attendance_progress := calculate_attendance_progress(NEW.student_id, NEW.course_id);
        END IF;

        -- Issue certificate if requirements are met
        IF (course_mode != 'virtual-live' OR attendance_progress >= 80) THEN
          INSERT INTO public.certificates (student_id, course_id)
          VALUES (NEW.student_id, NEW.course_id)
          ON CONFLICT (student_id, course_id) DO NOTHING;
          
          RAISE NOTICE 'Certificate issued for student % in course %', NEW.student_id, NEW.course_id;
        ELSE
          RAISE NOTICE 'Certificate not issued - attendance requirement not met: %', attendance_progress;
        END IF;
      END;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;