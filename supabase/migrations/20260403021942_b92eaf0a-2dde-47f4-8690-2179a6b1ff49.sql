
-- Allow location owners to see points transactions linked to visits at their location
DROP POLICY IF EXISTS "Users view own points" ON public.points_transactions;
CREATE POLICY "Users and owners view points" ON public.points_transactions
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.visits v
      WHERE v.id = related_visit_id
      AND public.is_location_owner(auth.uid(), v.location_id)
    )
  );

-- Allow location owners to see punch cards for customers who visited their location
DROP POLICY IF EXISTS "Users view own punch card" ON public.punch_cards;
CREATE POLICY "Users and owners view punch cards" ON public.punch_cards
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.visits v
      WHERE v.user_id = punch_cards.user_id
      AND public.is_location_owner(auth.uid(), v.location_id)
    )
  );

-- Allow location owners to view profiles of customers who visited their location (needed for dashboard)
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users and owners view profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.visits v
      WHERE v.user_id = profiles.user_id
      AND public.is_location_owner(auth.uid(), v.location_id)
    )
  );
