-- Create commission settings table for admin to set platform commission
CREATE TABLE public.commission_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_percentage DECIMAL(5,2) NOT NULL DEFAULT 10.00 CHECK (commission_percentage >= 0 AND commission_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.commission_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for commission settings
CREATE POLICY "Admins can manage commission settings" 
ON public.commission_settings 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Everyone can view commission settings" 
ON public.commission_settings 
FOR SELECT 
USING (true);

-- Create payouts table to track instructor payouts
CREATE TABLE public.instructor_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES auth.users(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  gross_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  commission_percentage DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  net_payout DECIMAL(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'cancelled')),
  currency TEXT NOT NULL DEFAULT 'NGN' CHECK (currency IN ('NGN', 'USD', 'EUR', 'GBP')),
  payment_reference TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.instructor_payouts ENABLE ROW LEVEL SECURITY;

-- Create policies for instructor payouts
CREATE POLICY "Instructors can view their own payouts" 
ON public.instructor_payouts 
FOR SELECT 
USING (instructor_id = auth.uid());

CREATE POLICY "Admins can manage all payouts" 
ON public.instructor_payouts 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Create function to get current commission percentage
CREATE OR REPLACE FUNCTION public.get_current_commission_percentage()
RETURNS DECIMAL(5,2)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT commission_percentage 
  FROM public.commission_settings 
  ORDER BY created_at DESC 
  LIMIT 1;
$$;

-- Insert default commission setting
INSERT INTO public.commission_settings (commission_percentage, created_by)
VALUES (10.00, NULL);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_commission_settings_updated_at
  BEFORE UPDATE ON public.commission_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_instructor_payouts_updated_at
  BEFORE UPDATE ON public.instructor_payouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();