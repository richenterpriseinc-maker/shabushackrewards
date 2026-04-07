
CREATE TABLE public.prepaid_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  location_id UUID REFERENCES public.locations(id),
  type TEXT NOT NULL CHECK (type IN ('load', 'deduct')),
  amount NUMERIC NOT NULL,
  bonus_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.prepaid_transactions ENABLE ROW LEVEL SECURITY;

-- Staff can insert via service role; owners can view their location's transactions
CREATE POLICY "Owners view own location transactions"
  ON public.prepaid_transactions
  FOR SELECT
  TO authenticated
  USING (
    is_location_owner(auth.uid(), location_id)
    OR auth.uid() = user_id
    OR has_role(auth.uid(), 'admin'::app_role)
  );
