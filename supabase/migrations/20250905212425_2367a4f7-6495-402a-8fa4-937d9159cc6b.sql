-- Add video_source_type column to lessons table for flexible media integration
ALTER TABLE public.lessons 
ADD COLUMN video_source_type text DEFAULT 'youtube';

-- Add constraint to ensure valid video source types
ALTER TABLE public.lessons 
ADD CONSTRAINT lessons_video_source_type_check 
CHECK (video_source_type IN ('youtube', 'google_drive', 'google_meet', 'zoom', 'teams'));

-- Update existing lessons to have youtube as default source type
UPDATE public.lessons 
SET video_source_type = 'youtube' 
WHERE video_url IS NOT NULL AND video_source_type IS NULL;