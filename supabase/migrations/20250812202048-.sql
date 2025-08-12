-- Fix critical security vulnerability in user_profiles table
-- Issue: "Users can view all profiles" policy allows access to all sensitive personal data

-- 1. Drop the dangerous policy that allows viewing all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;

-- 2. Keep existing secure policies and add missing ones
-- Note: The existing policies for users viewing/updating their own profiles are good

-- 3. Create a secure policy for limited public profile viewing (only basic info)
CREATE POLICY "Public basic profile info only"
ON public.user_profiles
FOR SELECT
USING (
  -- Only allow viewing of basic, non-sensitive profile information
  -- This policy will be used in conjunction with a view for public data
  false -- We'll create a separate view for public data instead
);

-- 4. Create a secure view for public profile information (excludes sensitive data)
CREATE OR REPLACE VIEW public.user_profiles_public AS
SELECT 
  id,
  first_name,
  last_name,
  bio,
  avatar_url,
  professional_title,
  skills,
  career_level,
  website,
  linkedin_url,
  twitter_url,
  github_url,
  created_at
FROM public.user_profiles;

-- 5. Enable security barrier on the view
ALTER VIEW public.user_profiles_public SET (security_barrier = true);

-- 6. Grant access to the public view
GRANT SELECT ON public.user_profiles_public TO authenticated;
GRANT SELECT ON public.user_profiles_public TO anon;

-- 7. Create a secure view for admin access (includes more data but still excludes bank secrets)
CREATE OR REPLACE VIEW public.user_profiles_admin AS
SELECT 
  id,
  first_name,
  last_name,
  bio,
  avatar_url,
  professional_title,
  skills,
  career_level,
  website,
  linkedin_url,
  twitter_url,
  github_url,
  phone,
  country,
  role,
  student_status,
  preferences,
  bank_verification_status,
  payout_frequency,
  created_at,
  updated_at
FROM public.user_profiles;

-- 8. Enable security barrier on admin view
ALTER VIEW public.user_profiles_admin SET (security_barrier = true);

-- 9. Create RLS policy for admin view (only admins can access)
CREATE POLICY "Admins can view admin profile data"
ON public.user_profiles_admin
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- 10. Create a secure function for getting user profile basics (for instructors, etc.)
CREATE OR REPLACE FUNCTION public.get_user_basic_info(user_id_param uuid)
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  avatar_url text,
  professional_title text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only return basic, non-sensitive information
  RETURN QUERY
  SELECT 
    up.id,
    up.first_name,
    up.last_name,
    up.avatar_url,
    up.professional_title
  FROM public.user_profiles up
  WHERE up.id = user_id_param;
END;
$function$;

-- 11. Clean up any duplicate policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profiles" ON public.user_profiles;

-- 12. Create the definitive secure policies
CREATE POLICY "Users can view their own profile only"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile only"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = id);

-- 13. Admin policies (already exist but let's ensure they're correct)
-- The existing admin policies look good, keeping them

COMMENT ON VIEW public.user_profiles_public IS 'Public view of user profiles containing only non-sensitive information';
COMMENT ON VIEW public.user_profiles_admin IS 'Admin view of user profiles with extended information but excluding bank account details';
COMMENT ON FUNCTION public.get_user_basic_info(uuid) IS 'Returns basic user information for display purposes (e.g., instructor names)';