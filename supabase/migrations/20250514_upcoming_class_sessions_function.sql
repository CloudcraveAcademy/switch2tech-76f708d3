
-- Create a function to get upcoming class sessions for a user
CREATE OR REPLACE FUNCTION public.get_upcoming_class_sessions(user_id UUID)
RETURNS TABLE (
  id UUID,
  course_id UUID,
  course_title TEXT,
  instructor_name TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  meeting_link TEXT,
  topic TEXT,
  status TEXT,
  image_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.id,
    cs.course_id,
    c.title as course_title,
    (up.first_name || ' ' || up.last_name) as instructor_name,
    cs.start_time,
    cs.end_time,
    cs.meeting_link,
    cs.topic,
    cs.status,
    c.image_url
  FROM 
    public.class_sessions cs
  JOIN 
    public.courses c ON cs.course_id = c.id
  JOIN
    public.enrollments e ON cs.course_id = e.course_id AND e.student_id = user_id
  JOIN
    public.user_profiles up ON c.instructor_id = up.id
  WHERE
    cs.status = 'scheduled'
    AND cs.start_time > NOW()
  ORDER BY
    cs.start_time ASC
  LIMIT 5;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_upcoming_class_sessions TO authenticated;
