
CREATE TABLE public.phone_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.phone_otps ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_phone_otps_phone ON public.phone_otps (phone);
CREATE INDEX idx_phone_otps_expires ON public.phone_otps (expires_at);
