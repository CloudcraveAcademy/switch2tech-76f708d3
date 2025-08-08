-- Drop the duplicate certificate triggers
DROP TRIGGER IF EXISTS auto_issue_certificate ON public.enrollments;
DROP TRIGGER IF EXISTS trigger_issue_certificate ON public.enrollments;
DROP TRIGGER IF EXISTS trigger_issue_certificate_on_completion ON public.enrollments;

-- Create function to calculate attendance progress for virtual-live courses
CREATE OR REPLACE FUNCTION public.calculate_attendance_progress(student_id_param uuid, course_id_param uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_sessions integer;
  attended_sessions integer;
BEGIN
  -- Get total number of past class sessions for this course
  SELECT COUNT(*) INTO total_sessions
  FROM public.class_sessions
  WHERE course_id = course_id_param
  AND start_time <= now();

  -- If no sessions have occurred yet, return 100% (no attendance requirement)
  IF total_sessions = 0 THEN
    RETURN 100;
  END IF;

  -- Get number of sessions the student attended
  SELECT COUNT(*) INTO attended_sessions
  FROM public.class_attendance
  WHERE course_id = course_id_param
  AND student_id = student_id_param
  AND attendance_status = 'present';

  -- Calculate attendance percentage
  RETURN ROUND((attended_sessions::numeric / total_sessions::numeric) * 100, 2);
END;
$$;

-- Create function to check if course completion requirements are met
CREATE OR REPLACE FUNCTION public.check_course_completion_requirements(student_id_param uuid, course_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  course_mode text;
  attendance_progress numeric;
BEGIN
  -- Get course mode
  SELECT mode INTO course_mode
  FROM public.courses
  WHERE id = course_id_param;

  -- For self-paced courses or unknown modes, completion is based on enrollment.completed only
  IF course_mode IS NULL OR course_mode = 'self-paced' THEN
    RETURN true; -- Already checked in trigger that enrollment.completed = true
  END IF;

  -- For virtual-live courses, check attendance requirement
  IF course_mode = 'virtual-live' THEN
    attendance_progress := calculate_attendance_progress(student_id_param, course_id_param);
    RETURN attendance_progress >= 80; -- 80% attendance requirement
  END IF;

  -- Default to true for other modes
  RETURN true;
END;
$$;

-- Updated certificate issuance function with attendance checking
CREATE OR REPLACE FUNCTION public.issue_certificate_on_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if course is completed and certificate doesn't already exist
  IF NEW.completed = true AND OLD.completed = false THEN
    -- Check if course has certificates enabled
    IF EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = NEW.course_id 
      AND certificate_enabled = true
    ) THEN
      -- Check if completion requirements are met (including attendance for virtual-live)
      IF check_course_completion_requirements(NEW.student_id, NEW.course_id) THEN
        -- Insert certificate if it doesn't exist
        INSERT INTO public.certificates (student_id, course_id)
        VALUES (NEW.student_id, NEW.course_id)
        ON CONFLICT (student_id, course_id) DO NOTHING;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the new certificate trigger
CREATE TRIGGER certificate_on_completion
BEFORE UPDATE ON public.enrollments
FOR EACH ROW
EXECUTE FUNCTION public.issue_certificate_on_completion();

-- Function to manually check and issue missing certificates for virtual-live courses
CREATE OR REPLACE FUNCTION public.check_virtual_live_completion()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Re-evaluate completion for virtual-live courses and issue certificates where appropriate
  INSERT INTO public.certificates (student_id, course_id)
  SELECT DISTINCT e.student_id, e.course_id
  FROM public.enrollments e
  JOIN public.courses c ON c.id = e.course_id
  WHERE e.completed = true 
    AND c.certificate_enabled = true
    AND c.mode = 'virtual-live'
    AND check_course_completion_requirements(e.student_id, e.course_id)
    AND NOT EXISTS (
      SELECT 1 FROM public.certificates cert 
      WHERE cert.student_id = e.student_id 
      AND cert.course_id = e.course_id
    );
END;
$$;