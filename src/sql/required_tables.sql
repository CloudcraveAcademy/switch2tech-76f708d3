
-- Create table for tracking individual lesson progress
CREATE TABLE IF NOT EXISTS public.student_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id),
  course_id UUID NOT NULL REFERENCES public.courses(id),
  completed BOOLEAN NOT NULL DEFAULT false,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (student_id, lesson_id)
);

-- Create table for course materials
CREATE TABLE IF NOT EXISTS public.course_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id),
  title TEXT,
  file_url TEXT,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for live class sessions
CREATE TABLE IF NOT EXISTS public.class_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  topic TEXT,
  meeting_link TEXT,
  status TEXT DEFAULT 'scheduled',  -- scheduled, live, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for tracking attendance
CREATE TABLE IF NOT EXISTS public.class_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_session_id UUID NOT NULL REFERENCES public.class_sessions(id),
  student_id UUID NOT NULL REFERENCES auth.users(id),
  course_id UUID NOT NULL REFERENCES public.courses(id),
  attended_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  attendance_status TEXT DEFAULT 'present', -- present, absent, excused
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (class_session_id, student_id)
);

-- Add RLS policies
ALTER TABLE public.student_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_attendance ENABLE ROW LEVEL SECURITY;

-- RLS for student_lesson_progress
CREATE POLICY "Students can view their own lesson progress"
  ON public.student_lesson_progress
  FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own lesson progress"
  ON public.student_lesson_progress
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own lesson progress"
  ON public.student_lesson_progress
  FOR UPDATE
  USING (auth.uid() = student_id);

-- RLS for course_materials (read-only for students)
CREATE POLICY "Anyone can view course materials"
  ON public.course_materials
  FOR SELECT
  USING (true);

CREATE POLICY "Instructors can manage their course materials"
  ON public.course_materials
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- RLS for class_sessions
CREATE POLICY "Anyone can view class sessions"
  ON public.class_sessions
  FOR SELECT
  USING (true);

CREATE POLICY "Instructors can manage their class sessions"
  ON public.class_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = course_id
      AND courses.instructor_id = auth.uid()
    )
  );

-- RLS for class_attendance
CREATE POLICY "Students can view their own attendance"
  ON public.class_attendance
  FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own attendance"
  ON public.class_attendance
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Instructors can view attendance for their courses"
  ON public.class_attendance
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = course_id
      AND courses.instructor_id = auth.uid()
    )
  );
