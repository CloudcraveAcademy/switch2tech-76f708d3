-- Create quiz_submissions table to track student quiz attempts and scores
CREATE TABLE public.quiz_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL,
  student_id UUID NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 0,
  percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  time_taken_minutes INTEGER,
  answers JSONB DEFAULT '{}',
  is_passed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Foreign key constraints
  CONSTRAINT quiz_submissions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE,
  CONSTRAINT quiz_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  -- Unique constraint to prevent duplicate submissions (one attempt per quiz per student)
  CONSTRAINT unique_student_quiz_submission UNIQUE(quiz_id, student_id)
);

-- Enable Row Level Security
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz_submissions
CREATE POLICY "Students can view their own quiz submissions" 
ON public.quiz_submissions 
FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own quiz submissions" 
ON public.quiz_submissions 
FOR INSERT 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own quiz submissions" 
ON public.quiz_submissions 
FOR UPDATE 
USING (auth.uid() = student_id);

CREATE POLICY "Instructors can view submissions for their course quizzes" 
ON public.quiz_submissions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.quizzes q
  JOIN public.courses c ON c.id = q.course_id
  WHERE q.id = quiz_submissions.quiz_id 
  AND c.instructor_id = auth.uid()
));

CREATE POLICY "Admins can do everything on quiz_submissions" 
ON public.quiz_submissions 
FOR ALL 
USING (is_admin());

-- Create indexes for better performance
CREATE INDEX idx_quiz_submissions_quiz_id ON public.quiz_submissions(quiz_id);
CREATE INDEX idx_quiz_submissions_student_id ON public.quiz_submissions(student_id);
CREATE INDEX idx_quiz_submissions_submitted_at ON public.quiz_submissions(submitted_at);

-- Add missing RLS policies for quizzes and quiz_questions tables
CREATE POLICY "Students can view published quizzes for enrolled courses" 
ON public.quizzes 
FOR SELECT 
USING (
  is_published = true 
  AND EXISTS (
    SELECT 1 FROM public.enrollments 
    WHERE enrollments.course_id = quizzes.course_id 
    AND enrollments.student_id = auth.uid()
  )
);

CREATE POLICY "Instructors can manage quizzes for their courses" 
ON public.quizzes 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.courses 
  WHERE courses.id = quizzes.course_id 
  AND courses.instructor_id = auth.uid()
));

CREATE POLICY "Students can view questions for accessible quizzes" 
ON public.quiz_questions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.quizzes q
  JOIN public.enrollments e ON e.course_id = q.course_id
  WHERE q.id = quiz_questions.quiz_id 
  AND q.is_published = true
  AND e.student_id = auth.uid()
));

CREATE POLICY "Instructors can manage questions for their course quizzes" 
ON public.quiz_questions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.quizzes q
  JOIN public.courses c ON c.id = q.course_id
  WHERE q.id = quiz_questions.quiz_id 
  AND c.instructor_id = auth.uid()
));