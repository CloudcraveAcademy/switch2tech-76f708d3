-- Update the get_user_emails function to accept instructor_id parameter for verification
CREATE OR REPLACE FUNCTION public.get_user_emails(user_ids uuid[], instructor_id uuid DEFAULT NULL)
 RETURNS TABLE(id uuid, email character varying)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- If instructor_id is provided, verify they are an instructor/admin
  -- Otherwise, use the existing auth.uid() check
  IF instructor_id IS NOT NULL THEN
    IF NOT (
      EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_profiles.id = instructor_id 
        AND user_profiles.role IN ('instructor', 'admin', 'super_admin')
      )
    ) THEN
      RAISE EXCEPTION 'Access denied. Only instructors and admins can access user emails.';
    END IF;
  ELSE
    -- Original check for direct calls
    IF NOT (
      EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role IN ('instructor', 'admin', 'super_admin')
      )
    ) THEN
      RAISE EXCEPTION 'Access denied. Only instructors and admins can access user emails.';
    END IF;
  END IF;

  RETURN QUERY
  SELECT 
    au.id,
    au.email
  FROM auth.users au
  WHERE au.id = ANY(user_ids);
END;
$function$;