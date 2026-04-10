
CREATE TABLE public.reward_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  location_id UUID NOT NULL REFERENCES public.locations(id),
  staff_note TEXT,
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own redemptions"
  ON public.reward_redemptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owners view location redemptions"
  ON public.reward_redemptions FOR SELECT
  TO authenticated
  USING (is_location_owner(auth.uid(), location_id));

CREATE POLICY "Admins view all redemptions"
  ON public.reward_redemptions FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
