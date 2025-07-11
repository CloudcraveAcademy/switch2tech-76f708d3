-- Create function to get user emails (only accessible by authenticated users)
CREATE OR REPLACE FUNCTION public.get_user_emails(user_ids uuid[])
RETURNS TABLE(id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow instructors and admins to access this function
  IF NOT (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role IN ('instructor', 'admin', 'super_admin')
    )
  ) THEN
    RAISE EXCEPTION 'Access denied. Only instructors and admins can access user emails.';
  END IF;

  RETURN QUERY
  SELECT 
    au.id,
    au.email
  FROM auth.users au
  WHERE au.id = ANY(user_ids);
END;
$$;