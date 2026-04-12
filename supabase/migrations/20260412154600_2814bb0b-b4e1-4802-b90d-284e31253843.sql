CREATE TABLE IF NOT EXISTS public.keep_alive (
  id serial primary key,
  pinged_at timestamptz default now()
);

INSERT INTO public.keep_alive DEFAULT VALUES;