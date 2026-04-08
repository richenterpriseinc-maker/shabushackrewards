-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all punch cards
CREATE POLICY "Admins can view all punch cards"
ON public.punch_cards
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all visits
CREATE POLICY "Admins can view all visits"
ON public.visits
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all prepaid transactions
CREATE POLICY "Admins can view all prepaid transactions"
ON public.prepaid_transactions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));