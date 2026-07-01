ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS perk TEXT;
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS yelp_url TEXT;
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS badge TEXT;
GRANT SELECT ON public.locations TO anon;