ALTER TABLE public.keep_alive ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on keep_alive"
ON public.keep_alive
FOR SELECT
USING (true);