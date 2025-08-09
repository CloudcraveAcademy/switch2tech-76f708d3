-- Fix the notification trigger to use 'enrollment' instead of 'new_enrollment'
CREATE OR REPLACE FUNCTION public.notify_instructor_on_enrollment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  course_record RECORD;
  student_profile RECORD;
BEGIN
  -- Fetch course and instructor
  SELECT c.title, c.instructor_id
  INTO course_record
  FROM public.courses c
  WHERE c.id = NEW.course_id;

  IF course_record.instructor_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Fetch student name (optional)
  SELECT first_name, last_name INTO student_profile
  FROM public.user_profiles
  WHERE id = NEW.student_id;

  -- Avoid duplicates: if a notification already exists for this enrollment
  IF EXISTS (
    SELECT 1 FROM public.notifications n
    WHERE n.user_id = course_record.instructor_id
      AND n.type = 'enrollment'
      AND n.course_id = NEW.course_id
      AND (n.metadata ? 'enrollment_id')
      AND (n.metadata->>'enrollment_id') = NEW.id::text
  ) THEN
    RETURN NEW;
  END IF;

  -- Insert instructor notification with correct type 'enrollment'
  INSERT INTO public.notifications (
    user_id, type, title, description, action_url, course_id, metadata
  ) VALUES (
    course_record.instructor_id,
    'enrollment',  -- Changed from 'new_enrollment' to 'enrollment'
    'New Student Enrollment',
    COALESCE(TRIM(COALESCE(student_profile.first_name,'') || ' ' || COALESCE(student_profile.last_name,'')), 'A student') ||
      ' has enrolled in "' || COALESCE(course_record.title, 'Course') || '"',
    '/dashboard/students',
    NEW.course_id,
    jsonb_build_object(
      'enrollment_id', NEW.id,
      'student_id', NEW.student_id
    )
  );

  RETURN NEW;
END;
$$;