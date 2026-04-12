
-- Function: Issue certificates for a specific course
-- Can be called by the course instructor or an admin
CREATE OR REPLACE FUNCTION public.issue_certificates_for_course(course_id_param uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count integer;
BEGIN
  -- Verify caller is admin or the course instructor
  IF NOT (
    is_admin() OR EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = course_id_param AND instructor_id = auth.uid()
    )
  ) THEN
    RAISE EXCEPTION 'Access denied. Only the course instructor or admins can issue certificates.';
  END IF;

  -- Verify course has certificates enabled
  IF NOT EXISTS (
    SELECT 1 FROM public.courses WHERE id = course_id_param AND certificate_enabled = true
  ) THEN
    RAISE EXCEPTION 'Certificates are not enabled for this course.';
  END IF;

  -- Insert missing certificates for completed enrollments
  WITH inserted AS (
    INSERT INTO public.certificates (student_id, course_id)
    SELECT e.student_id, e.course_id
    FROM public.enrollments e
    WHERE e.course_id = course_id_param
      AND e.completed = true
      AND NOT EXISTS (
        SELECT 1 FROM public.certificates c
        WHERE c.student_id = e.student_id AND c.course_id = e.course_id
      )
    RETURNING id
  )
  SELECT COUNT(*) INTO inserted_count FROM inserted;

  RETURN inserted_count;
END;
$$;

-- Function: Issue certificates across all courses for an instructor
-- Can be called by the instructor themselves or an admin
CREATE OR REPLACE FUNCTION public.issue_certificates_for_instructor(instructor_id_param uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count integer;
BEGIN
  -- Verify caller is admin or the instructor themselves
  IF NOT (
    is_admin() OR auth.uid() = instructor_id_param
  ) THEN
    RAISE EXCEPTION 'Access denied. Only the instructor or admins can issue certificates.';
  END IF;

  -- Insert missing certificates for all completed enrollments in instructor's certificate-enabled courses
  WITH inserted AS (
    INSERT INTO public.certificates (student_id, course_id)
    SELECT e.student_id, e.course_id
    FROM public.enrollments e
    JOIN public.courses c ON c.id = e.course_id
    WHERE c.instructor_id = instructor_id_param
      AND c.certificate_enabled = true
      AND e.completed = true
      AND NOT EXISTS (
        SELECT 1 FROM public.certificates cert
        WHERE cert.student_id = e.student_id AND cert.course_id = e.course_id
      )
    RETURNING id
  )
  SELECT COUNT(*) INTO inserted_count FROM inserted;

  RETURN inserted_count;
END;
$$;
