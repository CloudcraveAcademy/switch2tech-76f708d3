-- Add attachment_url column to assignments table
ALTER TABLE public.assignments 
ADD COLUMN attachment_url TEXT;