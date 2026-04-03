
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'location_owner', 'user');
CREATE TYPE public.membership_tier AS ENUM ('free', 'vip');
CREATE TYPE public.points_type AS ENUM ('earn', 'redeem');
CREATE TYPE public.vip_status AS ENUM ('active', 'canceled', 'expired');
CREATE TYPE public.vip_plan AS ENUM ('monthly', 'yearly');
CREATE TYPE public.promo_type AS ENUM ('discount', 'points_multiplier', 'free_item', 'flash_deal');

-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT,
  phone TEXT,
  favorite_location_id UUID,
  date_of_birth DATE,
  membership_tier public.membership_tier NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Locations
CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT,
  hours TEXT,
  pin_code TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add FK for favorite_location after locations table exists
ALTER TABLE public.profiles ADD CONSTRAINT fk_favorite_location
  FOREIGN KEY (favorite_location_id) REFERENCES public.locations(id) ON DELETE SET NULL;

-- Visits
CREATE TABLE public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE NOT NULL,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  amount_spent NUMERIC(10,2) NOT NULL DEFAULT 0,
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Points transactions
CREATE TABLE public.points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type public.points_type NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  related_visit_id UUID REFERENCES public.visits(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Punch cards (single card per user, tracks across locations)
CREATE TABLE public.punch_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  punches_count INTEGER NOT NULL DEFAULT 0,
  completed_cards INTEGER NOT NULL DEFAULT 0,
  last_punch_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prepaid balances
CREATE TABLE public.prepaid_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  bonus_credits NUMERIC(10,2) NOT NULL DEFAULT 0,
  last_load_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- VIP memberships
CREATE TABLE public.vip_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_subscription_id TEXT,
  status public.vip_status NOT NULL DEFAULT 'active',
  plan_type public.vip_plan NOT NULL DEFAULT 'monthly',
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  expiry_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Birthday spins
CREATE TABLE public.birthday_spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  spin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  prize_type TEXT NOT NULL,
  prize_value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Promotions
CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type public.promo_type NOT NULL DEFAULT 'discount',
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  members_only BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles (separate table per security best practice)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Location owner access mapping
CREATE TABLE public.location_owner_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(owner_id, location_id)
);

-- Indexes
CREATE INDEX idx_visits_user ON public.visits(user_id);
CREATE INDEX idx_visits_location ON public.visits(location_id);
CREATE INDEX idx_points_user ON public.points_transactions(user_id);
CREATE INDEX idx_birthday_spins_user ON public.birthday_spins(user_id);
CREATE INDEX idx_promotions_location ON public.promotions(location_id);

-- Updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_punch_cards_updated_at BEFORE UPDATE ON public.punch_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_prepaid_updated_at BEFORE UPDATE ON public.prepaid_balances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vip_updated_at BEFORE UPDATE ON public.vip_memberships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''));
  INSERT INTO public.punch_cards (user_id) VALUES (NEW.id);
  INSERT INTO public.prepaid_balances (user_id) VALUES (NEW.id);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper: check role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Helper: check location owner
CREATE OR REPLACE FUNCTION public.is_location_owner(_user_id UUID, _location_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.location_owner_access WHERE owner_id = _user_id AND location_id = _location_id)
$$;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punch_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prepaid_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birthday_spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_owner_access ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- LOCATIONS policies (public read)
CREATE POLICY "Anyone can view locations" ON public.locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Location owners can update their location" ON public.locations FOR UPDATE TO authenticated USING (public.is_location_owner(auth.uid(), id));

-- VISITS policies
CREATE POLICY "Users view own visits" ON public.visits FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_location_owner(auth.uid(), location_id));
CREATE POLICY "Users create own visits" ON public.visits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- POINTS policies
CREATE POLICY "Users view own points" ON public.points_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own points" ON public.points_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- PUNCH CARDS policies
CREATE POLICY "Users view own punch card" ON public.punch_cards FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own punch card" ON public.punch_cards FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- PREPAID BALANCES policies
CREATE POLICY "Users view own balance" ON public.prepaid_balances FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own balance" ON public.prepaid_balances FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- VIP MEMBERSHIPS policies
CREATE POLICY "Users view own membership" ON public.vip_memberships FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own membership" ON public.vip_memberships FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own membership" ON public.vip_memberships FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- BIRTHDAY SPINS policies
CREATE POLICY "Users view own spins" ON public.birthday_spins FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own spins" ON public.birthday_spins FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- PROMOTIONS policies
CREATE POLICY "Authenticated users view active promotions" ON public.promotions FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Location owners manage own promotions" ON public.promotions FOR INSERT TO authenticated WITH CHECK (public.is_location_owner(auth.uid(), location_id));
CREATE POLICY "Location owners update own promotions" ON public.promotions FOR UPDATE TO authenticated USING (public.is_location_owner(auth.uid(), location_id));
CREATE POLICY "Location owners delete own promotions" ON public.promotions FOR DELETE TO authenticated USING (public.is_location_owner(auth.uid(), location_id));

-- USER ROLES policies
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- LOCATION OWNER ACCESS policies
CREATE POLICY "Owners view own access" ON public.location_owner_access FOR SELECT TO authenticated USING (auth.uid() = owner_id);
