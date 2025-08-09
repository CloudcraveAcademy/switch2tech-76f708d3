-- Create function to send certificate notifications
CREATE OR REPLACE FUNCTION public.notify_certificate_issued()
RETURNS TRIGGER AS $$
DECLARE
  student_profile RECORD;
  instructor_profile RECORD;
  course_record RECORD;
  admin_ids UUID[];
BEGIN
  -- Get student profile
  SELECT first_name, last_name INTO student_profile
  FROM public.user_profiles
  WHERE id = NEW.student_id;
  
  -- Get course and instructor info
  SELECT c.title, c.instructor_id, up.first_name as instructor_first_name, up.last_name as instructor_last_name
  INTO course_record
  FROM public.courses c
  JOIN public.user_profiles up ON up.id = c.instructor_id
  WHERE c.id = NEW.course_id;
  
  -- Get all admin user IDs
  SELECT ARRAY_AGG(id) INTO admin_ids
  FROM public.user_profiles
  WHERE role IN ('admin', 'super_admin');
  
  -- Notify student
  INSERT INTO public.notifications (
    user_id, type, title, description, course_id, metadata
  ) VALUES (
    NEW.student_id,
    'certificate_issued',
    'Certificate Issued!',
    'Congratulations! Your certificate for "' || course_record.title || '" has been issued.',
    NEW.course_id,
    jsonb_build_object(
      'certificate_id', NEW.id,
      'certificate_number', NEW.certificate_number,
      'course_title', course_record.title
    )
  );
  
  -- Notify instructor
  INSERT INTO public.notifications (
    user_id, type, title, description, course_id, metadata
  ) VALUES (
    course_record.instructor_id,
    'student_certificate_issued',
    'Student Certificate Issued',
    'A certificate has been issued to ' || COALESCE(student_profile.first_name || ' ' || student_profile.last_name, 'a student') || ' for your course "' || course_record.title || '".',
    NEW.course_id,
    jsonb_build_object(
      'certificate_id', NEW.id,
      'certificate_number', NEW.certificate_number,
      'student_name', COALESCE(student_profile.first_name || ' ' || student_profile.last_name, 'Unknown Student'),
      'course_title', course_record.title
    )
  );
  
  -- Notify all admins
  IF admin_ids IS NOT NULL AND array_length(admin_ids, 1) > 0 THEN
    INSERT INTO public.notifications (
      user_id, type, title, description, course_id, metadata
    )
    SELECT 
      admin_id,
      'admin_certificate_issued',
      'Certificate Issued - Admin Alert',
      'A certificate has been issued to ' || COALESCE(student_profile.first_name || ' ' || student_profile.last_name, 'a student') || ' for course "' || course_record.title || '" by instructor ' || COALESCE(course_record.instructor_first_name || ' ' || course_record.instructor_last_name, 'Unknown Instructor') || '.',
      NEW.course_id,
      jsonb_build_object(
        'certificate_id', NEW.id,
        'certificate_number', NEW.certificate_number,
        'student_name', COALESCE(student_profile.first_name || ' ' || student_profile.last_name, 'Unknown Student'),
        'instructor_name', COALESCE(course_record.instructor_first_name || ' ' || course_record.instructor_last_name, 'Unknown Instructor'),
        'course_title', course_record.title
      )
    FROM UNNEST(admin_ids) AS admin_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically send notifications when certificates are issued
DROP TRIGGER IF EXISTS trigger_notify_certificate_issued ON public.certificates;
CREATE TRIGGER trigger_notify_certificate_issued
  AFTER INSERT ON public.certificates
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_certificate_issued();