
-- Create reward tier enum
CREATE TYPE public.reward_tier AS ENUM ('bronze', 'silver', 'gold', 'diamond');

-- Add gamification columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN xp_total integer NOT NULL DEFAULT 0,
  ADD COLUMN current_tier reward_tier NOT NULL DEFAULT 'bronze';

-- Monthly challenges definitions
CREATE TABLE public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  goal_type text NOT NULL, -- 'visits_count', 'locations_count', 'spend_amount'
  goal_value numeric NOT NULL,
  xp_reward integer NOT NULL DEFAULT 100,
  month integer NOT NULL,
  year integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active challenges"
  ON public.challenges FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage challenges"
  ON public.challenges FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_challenges_updated_at
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Per-user challenge progress
CREATE TABLE public.challenge_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  current_value numeric NOT NULL DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own challenge progress"
  ON public.challenge_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own challenge progress"
  ON public.challenge_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own challenge progress"
  ON public.challenge_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_challenge_progress_updated_at
  BEFORE UPDATE ON public.challenge_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User streaks
CREATE TABLE public.user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  current_streak integer NOT NULL DEFAULT 0,
  best_streak integer NOT NULL DEFAULT 0,
  last_visit_week text, -- ISO week like '2026-W14'
  multiplier numeric NOT NULL DEFAULT 1.0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own streak"
  ON public.user_streaks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own streak"
  ON public.user_streaks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own streak"
  ON public.user_streaks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON public.user_streaks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial monthly challenges for April 2026
INSERT INTO public.challenges (title, description, goal_type, goal_value, xp_reward, month, year) VALUES
  ('Frequent Flyer', 'Visit 4 times this month', 'visits_count', 4, 200, 4, 2026),
  ('Explorer', 'Try 2 different locations', 'locations_count', 2, 150, 4, 2026),
  ('Big Spender', 'Spend $50+ in a single visit', 'spend_amount', 50, 100, 4, 2026),
  ('Weekly Regular', 'Visit every week this month', 'visits_count', 4, 300, 4, 2026);

-- Update handle_new_user to create streak record
CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''));
  INSERT INTO public.punch_cards (user_id) VALUES (NEW.id);
  INSERT INTO public.prepaid_balances (user_id) VALUES (NEW.id);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  INSERT INTO public.user_streaks (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;
