-- Add missing updated_at column to account_deletion_requests table
ALTER TABLE public.account_deletion_requests 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create or replace trigger function for updating updated_at
CREATE OR REPLACE FUNCTION public.update_account_deletion_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER account_deletion_requests_updated_at_trigger
BEFORE UPDATE ON public.account_deletion_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_account_deletion_requests_updated_at();