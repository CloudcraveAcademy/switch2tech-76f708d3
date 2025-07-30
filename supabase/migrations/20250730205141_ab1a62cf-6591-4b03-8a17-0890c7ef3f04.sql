-- Create course_invitations table to track email invitations
CREATE TABLE public.course_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  message TEXT,
  instructor_name TEXT NOT NULL,
  instructor_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'accepted', 'expired')),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.course_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for course invitations
CREATE POLICY "Instructors can view their own invitations" 
ON public.course_invitations 
FOR SELECT 
USING (instructor_id = auth.uid());

CREATE POLICY "Instructors can create invitations" 
ON public.course_invitations 
FOR INSERT 
WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "Instructors can update their own invitations" 
ON public.course_invitations 
FOR UPDATE 
USING (instructor_id = auth.uid());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_course_invitations_updated_at
BEFORE UPDATE ON public.course_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();