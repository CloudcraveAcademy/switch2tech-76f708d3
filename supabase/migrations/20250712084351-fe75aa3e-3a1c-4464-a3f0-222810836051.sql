-- Create course ratings table
CREATE TABLE public.course_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, student_id)
);

-- Enable RLS on course_ratings
ALTER TABLE public.course_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for course_ratings
CREATE POLICY "Students can insert their own ratings" 
ON public.course_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own ratings" 
ON public.course_ratings 
FOR UPDATE 
USING (auth.uid() = student_id);

CREATE POLICY "Students can view ratings for enrolled courses" 
ON public.course_ratings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.enrollments 
    WHERE enrollments.course_id = course_ratings.course_id 
    AND enrollments.student_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = course_ratings.course_id 
    AND courses.instructor_id = auth.uid()
  ) OR
  auth.uid() = student_id
);

CREATE POLICY "Instructors can view ratings for their courses" 
ON public.course_ratings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = course_ratings.course_id 
    AND courses.instructor_id = auth.uid()
  )
);

CREATE POLICY "Admins can do everything on course_ratings" 
ON public.course_ratings 
FOR ALL 
USING (is_admin());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_course_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_course_ratings_updated_at
BEFORE UPDATE ON public.course_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_course_ratings_updated_at();

-- Create function to get course rating statistics
CREATE OR REPLACE FUNCTION public.get_course_rating_stats(course_id_param UUID)
RETURNS TABLE(
  average_rating NUMERIC(3,2),
  total_ratings INTEGER,
  rating_distribution JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(AVG(cr.rating), 2) as average_rating,
    COUNT(cr.rating)::INTEGER as total_ratings,
    jsonb_build_object(
      '5', COUNT(CASE WHEN cr.rating = 5 THEN 1 END),
      '4', COUNT(CASE WHEN cr.rating = 4 THEN 1 END),
      '3', COUNT(CASE WHEN cr.rating = 3 THEN 1 END),
      '2', COUNT(CASE WHEN cr.rating = 2 THEN 1 END),
      '1', COUNT(CASE WHEN cr.rating = 1 THEN 1 END)
    ) as rating_distribution
  FROM public.course_ratings cr
  WHERE cr.course_id = course_id_param;
END;
$$;