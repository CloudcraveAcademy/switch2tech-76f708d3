
-- Create a table for course announcements if it doesn't exist
CREATE TABLE IF NOT EXISTS public.course_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for course announcements
ALTER TABLE public.course_announcements ENABLE ROW LEVEL SECURITY;

-- Allow instructors to manage their own course announcements
CREATE POLICY "Instructors can manage their course announcements" 
ON public.course_announcements
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = course_announcements.course_id
    AND courses.instructor_id = auth.uid()
  )
);

-- Allow students to read announcements for courses they are enrolled in
CREATE POLICY "Students can view announcements for enrolled courses" 
ON public.course_announcements
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE enrollments.course_id = course_announcements.course_id
    AND enrollments.student_id = auth.uid()
  )
);

-- Add trigger to update updated_at when a record is modified
CREATE OR REPLACE FUNCTION public.update_course_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER course_announcements_updated_at_trigger
BEFORE UPDATE ON public.course_announcements
FOR EACH ROW
EXECUTE PROCEDURE public.update_course_announcements_updated_at();

COMMENT ON TABLE public.course_announcements IS 'Stores announcements for courses made by instructors';
