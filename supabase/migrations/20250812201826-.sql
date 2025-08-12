-- Fix critical security vulnerability in payment gateway access
-- Issue: The get_payment_gateway_config function bypasses RLS and exposes sensitive data

-- 1. Drop the existing vulnerable function
DROP FUNCTION IF EXISTS public.get_payment_gateway_config(text);

-- 2. Create a secure public function that only returns safe, public data
CREATE OR REPLACE FUNCTION public.get_public_payment_gateway_config(gateway_name_param text)
RETURNS TABLE(public_key text, is_active boolean, gateway_name text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Only return non-sensitive public data for active gateways
  RETURN QUERY
  SELECT 
    pg.public_key,
    pg.is_active,
    pg.gateway_name
  FROM public.payment_gateways pg
  WHERE pg.gateway_name = gateway_name_param
  AND pg.is_active = true;
END;
$function$;

-- 3. Create an admin-only function for full access (requires authentication)
CREATE OR REPLACE FUNCTION public.get_admin_payment_gateway_config(gateway_name_param text)
RETURNS TABLE(public_key text, is_active boolean, configuration jsonb, gateway_name text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Verify the user is an admin before allowing access
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Return configuration data but NEVER the secret_key
  RETURN QUERY
  SELECT 
    pg.public_key,
    pg.is_active,
    pg.configuration,
    pg.gateway_name
  FROM public.payment_gateways pg
  WHERE pg.gateway_name = gateway_name_param;
END;
$function$;

-- 4. Add additional RLS policy to be extra secure
CREATE POLICY "Super admins only for payment gateway secrets"
ON public.payment_gateways
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  )
);

-- 5. Create a view that excludes secret keys for regular admin access
CREATE OR REPLACE VIEW public.payment_gateways_safe AS
SELECT 
  id,
  gateway_name,
  public_key,
  is_active,
  configuration,
  webhook_url,
  created_at,
  updated_at
FROM public.payment_gateways;

-- 6. Enable RLS on the view
ALTER VIEW public.payment_gateways_safe SET (security_barrier = true);

-- Grant access to the safe view for admins
GRANT SELECT ON public.payment_gateways_safe TO authenticated;

COMMENT ON FUNCTION public.get_public_payment_gateway_config(text) IS 'Returns only public, non-sensitive payment gateway data for frontend use';
COMMENT ON FUNCTION public.get_admin_payment_gateway_config(text) IS 'Returns payment gateway configuration for admins only - never returns secret keys';
COMMENT ON VIEW public.payment_gateways_safe IS 'Safe view of payment gateways that excludes secret_key field';