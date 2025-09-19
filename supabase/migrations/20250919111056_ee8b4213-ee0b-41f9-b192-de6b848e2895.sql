-- Fix the notification function to use the correct 'certificate' type
CREATE OR REPLACE FUNCTION public.notify_certificate_issued()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  student_profile RECORD;
  course_record RECORD;
  admin_ids UUID[];
BEGIN
  -- Get student profile
  SELECT first_name, last_name INTO student_profile
  FROM public.user_profiles
  WHERE id = NEW.student_id;
  
  -- Get course and instructor info
  SELECT 
    c.title, 
    c.instructor_id, 
    up.first_name as instructor_first_name, 
    up.last_name as instructor_last_name
  INTO course_record
  FROM public.courses c
  JOIN public.user_profiles up ON up.id = c.instructor_id
  WHERE c.id = NEW.course_id;
  
  -- Get all admin user IDs
  SELECT ARRAY_AGG(id) INTO admin_ids
  FROM public.user_profiles
  WHERE role IN ('admin', 'super_admin');
  
  -- Notify student using correct 'certificate' type
  INSERT INTO public.notifications (
    user_id, type, title, description, course_id, metadata
  ) VALUES (
    NEW.student_id,
    'certificate',
    'Certificate Issued!',
    'Congratulations! Your certificate for "' || course_record.title || '" has been issued.',
    NEW.course_id,
    jsonb_build_object(
      'certificate_id', NEW.id,
      'certificate_number', NEW.certificate_number,
      'course_title', course_record.title,
      'recipient_type', 'student'
    )
  );
  
  -- Notify instructor using correct 'certificate' type
  INSERT INTO public.notifications (
    user_id, type, title, description, course_id, metadata
  ) VALUES (
    course_record.instructor_id,
    'certificate',
    'Student Certificate Issued',
    'A certificate has been issued to ' || COALESCE(student_profile.first_name || ' ' || student_profile.last_name, 'a student') || ' for your course "' || course_record.title || '".',
    NEW.course_id,
    jsonb_build_object(
      'certificate_id', NEW.id,
      'certificate_number', NEW.certificate_number,
      'student_name', COALESCE(student_profile.first_name || ' ' || student_profile.last_name, 'Unknown Student'),
      'course_title', course_record.title,
      'recipient_type', 'instructor'
    )
  );
  
  -- Notify all admins using correct 'certificate' type
  IF admin_ids IS NOT NULL AND array_length(admin_ids, 1) > 0 THEN
    INSERT INTO public.notifications (
      user_id, type, title, description, course_id, metadata
    )
    SELECT 
      admin_id,
      'certificate',
      'Certificate Issued - Admin Alert',
      'A certificate has been issued to ' || COALESCE(student_profile.first_name || ' ' || student_profile.last_name, 'a student') || ' for course "' || course_record.title || '" by instructor ' || COALESCE(course_record.instructor_first_name || ' ' || course_record.instructor_last_name, 'Unknown Instructor') || '.',
      NEW.course_id,
      jsonb_build_object(
        'certificate_id', NEW.id,
        'certificate_number', NEW.certificate_number,
        'student_name', COALESCE(student_profile.first_name || ' ' || student_profile.last_name, 'Unknown Student'),
        'instructor_name', COALESCE(course_record.instructor_first_name || ' ' || course_record.instructor_last_name, 'Unknown Instructor'),
        'course_title', course_record.title,
        'recipient_type', 'admin'
      )
    FROM UNNEST(admin_ids) AS admin_id;
  END IF;
  
  RETURN NEW;
END;
$function$;