-- Fix RLS policies for assignments, discussion_boards, and quizzes
-- Ensure instructors can manage content only for their courses

-- Add RLS policy for instructors to insert assignments for their courses
DROP POLICY IF EXISTS "Instructors can manage assignments for their courses" ON assignments;
CREATE POLICY "Instructors can manage assignments for their courses" 
ON assignments 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = assignments.course_id 
    AND courses.instructor_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = assignments.course_id 
    AND courses.instructor_id = auth.uid()
  )
);

-- Add RLS policy for instructors to manage discussion boards for their courses  
DROP POLICY IF EXISTS "Instructors can manage discussion boards for their courses" ON discussion_boards;
CREATE POLICY "Instructors can manage discussion boards for their courses" 
ON discussion_boards 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = discussion_boards.course_id 
    AND courses.instructor_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = discussion_boards.course_id 
    AND courses.instructor_id = auth.uid()
  )
);

-- Add RLS policy for instructors to view assignment submissions for their courses
DROP POLICY IF EXISTS "Instructors can view submissions for their course assignments" ON assignment_submissions;
CREATE POLICY "Instructors can view submissions for their course assignments" 
ON assignment_submissions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM assignments a
    JOIN courses c ON c.id = a.course_id
    WHERE a.id = assignment_submissions.assignment_id 
    AND c.instructor_id = auth.uid()
  )
);

-- Add RLS policy for instructors to update assignment submissions (for grading)
DROP POLICY IF EXISTS "Instructors can grade submissions for their course assignments" ON assignment_submissions;
CREATE POLICY "Instructors can grade submissions for their course assignments" 
ON assignment_submissions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM assignments a
    JOIN courses c ON c.id = a.course_id
    WHERE a.id = assignment_submissions.assignment_id 
    AND c.instructor_id = auth.uid()
  )
);

-- Add RLS policy for instructors to view quiz submissions for their courses
DROP POLICY IF EXISTS "Instructors can view quiz submissions for their courses" ON quiz_submissions;
CREATE POLICY "Instructors can view quiz submissions for their courses" 
ON quiz_submissions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM quizzes q
    JOIN courses c ON c.id = q.course_id
    WHERE q.id = quiz_submissions.quiz_id 
    AND c.instructor_id = auth.uid()
  )
);

-- Add RLS policy for instructors to grade quiz submissions
DROP POLICY IF EXISTS "Instructors can grade quiz submissions for their courses" ON quiz_submissions;
CREATE POLICY "Instructors can grade quiz submissions for their courses" 
ON quiz_submissions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM quizzes q
    JOIN courses c ON c.id = q.course_id
    WHERE q.id = quiz_submissions.quiz_id 
    AND c.instructor_id = auth.uid()
  )
);

-- Add RLS policy for instructors to manage discussion posts moderation
DROP POLICY IF EXISTS "Instructors can manage discussion posts for their courses" ON discussion_posts;
CREATE POLICY "Instructors can manage discussion posts for their courses" 
ON discussion_posts 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM discussion_boards db
    JOIN courses c ON c.id = db.course_id
    WHERE db.id = discussion_posts.discussion_board_id 
    AND c.instructor_id = auth.uid()
  )
);