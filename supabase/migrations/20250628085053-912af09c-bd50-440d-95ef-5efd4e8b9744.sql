
-- Create student_success_stories table
CREATE TABLE public.student_success_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  story TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Add Row Level Security
ALTER TABLE public.student_success_stories ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to approved stories
CREATE POLICY "Anyone can view approved stories" 
  ON public.student_success_stories 
  FOR SELECT 
  USING (is_approved = true);

-- Policy for authenticated users to submit stories
CREATE POLICY "Authenticated users can submit stories" 
  ON public.student_success_stories 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = submitted_by AND is_approved = false);

-- Policy for users to view their own submitted stories
CREATE POLICY "Users can view their own stories" 
  ON public.student_success_stories 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = submitted_by);

-- Policy for admins to manage all stories
CREATE POLICY "Admins can manage all stories" 
  ON public.student_success_stories 
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_student_success_stories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_student_success_stories_updated_at
  BEFORE UPDATE ON public.student_success_stories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_student_success_stories_updated_at();

-- Insert some sample data
INSERT INTO public.student_success_stories (name, story, role, company, image_url, is_approved, is_featured) VALUES
('John Doe', 'I transitioned from retail to a tech career in just 6 months! The hands-on projects and personalized mentorship were game-changers for my career path.', 'Software Engineer', 'TechCorp', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80', true, true),
('Jane Smith', 'The mentorship program helped me land my dream job at a top tech company. The industry-relevant curriculum gave me exactly what I needed to succeed.', 'Data Scientist', 'DataViz Inc', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80', true, true),
('Mike Johnson', 'Switch2Tech''s practical approach gave me the skills I needed to succeed. I went from zero coding knowledge to leading a development team in just one year.', 'Cloud Engineer', 'CloudNine', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80', true, true),
('Sarah Wilson', 'The career support team was incredible. They helped me prepare for interviews and negotiate my salary. I doubled my income within 8 months!', 'Frontend Developer', 'StartupXYZ', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80', true, false),
('David Chen', 'From accounting to cybersecurity - Switch2Tech made my career pivot possible. The practical labs and real-world projects were exactly what I needed.', 'Security Analyst', 'SecureNet', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80', true, false);
