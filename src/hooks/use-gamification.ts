import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Tier thresholds
const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 500,
  gold: 1500,
  diamond: 4000,
} as const;

const TIER_ORDER = ["bronze", "silver", "gold", "diamond"] as const;

export type TierName = (typeof TIER_ORDER)[number];

export const TIER_PERKS: Record<TierName, string[]> = {
  bronze: ["10 visits = free entrée", "Monthly challenges", "Birthday spin"],
  silver: ["10 visits = free entrée", "5% off every visit", "Priority seating"],
  gold: ["10 visits = free entrée", "10% off every visit", "Free appetizer monthly", "Early menu access"],
  diamond: ["10 visits = free entrée", "15% off every visit", "Free meal monthly", "Double birthday spin", "VIP events"],
};

export const TIER_COLORS: Record<TierName, { bg: string; text: string; border: string; gradient: string }> = {
  bronze: { bg: "bg-amber-700/10", text: "text-amber-700", border: "border-amber-700/30", gradient: "from-amber-700 to-amber-600" },
  silver: { bg: "bg-slate-400/10", text: "text-slate-500", border: "border-slate-400/30", gradient: "from-slate-400 to-slate-300" },
  gold: { bg: "bg-yellow-500/10", text: "text-yellow-600", border: "border-yellow-500/30", gradient: "from-yellow-500 to-yellow-400" },
  diamond: { bg: "bg-cyan-400/10", text: "text-cyan-500", border: "border-cyan-400/30", gradient: "from-cyan-500 to-blue-400" },
};

export function getTierFromXP(xp: number): TierName {
  if (xp >= TIER_THRESHOLDS.diamond) return "diamond";
  if (xp >= TIER_THRESHOLDS.gold) return "gold";
  if (xp >= TIER_THRESHOLDS.silver) return "silver";
  return "bronze";
}

export function getNextTier(current: TierName): TierName | null {
  const idx = TIER_ORDER.indexOf(current);
  return idx < TIER_ORDER.length - 1 ? TIER_ORDER[idx + 1] : null;
}

export function getXPToNextTier(xp: number, current: TierName): { needed: number; progress: number } {
  const next = getNextTier(current);
  if (!next) return { needed: 0, progress: 100 };
  const currentThreshold = TIER_THRESHOLDS[current];
  const nextThreshold = TIER_THRESHOLDS[next];
  const range = nextThreshold - currentThreshold;
  const progressXP = xp - currentThreshold;
  return { needed: nextThreshold - xp, progress: Math.min(100, (progressXP / range) * 100) };
}

export function getStreakMultiplier(weeks: number): number {
  if (weeks >= 8) return 3;
  if (weeks >= 4) return 2;
  if (weeks >= 2) return 1.5;
  return 1;
}

export function useGamification() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["gamification-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const streakQuery = useQuery({
    queryKey: ["user-streak"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const challengesQuery = useQuery({
    queryKey: ["monthly-challenges"],
    queryFn: async () => {
      const now = new Date();
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("month", now.getMonth() + 1)
        .eq("year", now.getFullYear())
        .eq("is_active", true);
      if (error) throw error;
      return data || [];
    },
  });

  const progressQuery = useQuery({
    queryKey: ["challenge-progress"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("challenge_progress")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      return data || [];
    },
  });

  const prepaidQuery = useQuery({
    queryKey: ["prepaid_balance"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("prepaid_balances")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const pointsQuery = useQuery({
    queryKey: ["points_total"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("points_transactions")
        .select("type, amount")
        .eq("user_id", user.id);
      if (error) throw error;
      let total = 0;
      for (const tx of data || []) {
        total += tx.type === "earn" ? tx.amount : -tx.amount;
      }
      return Math.max(0, total);
    },
  });

  const profile = profileQuery.data;
  const xp = profile?.xp_total ?? 0;
  const currentTier = (profile?.current_tier as TierName) ?? "bronze";
  const nextTier = getNextTier(currentTier);
  const xpInfo = getXPToNextTier(xp, currentTier);

  const streak = streakQuery.data;
  const currentStreak = streak?.current_streak ?? 0;
  const bestStreak = streak?.best_streak ?? 0;
  const multiplier = getStreakMultiplier(currentStreak);

  const challenges = challengesQuery.data ?? [];
  const progress = progressQuery.data ?? [];

  const challengesWithProgress = challenges.map((c) => {
    const p = progress.find((p) => p.challenge_id === c.id);
    return {
      ...c,
      currentValue: Number(p?.current_value ?? 0),
      completed: !!p?.completed_at,
      progressPercent: Math.min(100, (Number(p?.current_value ?? 0) / Number(c.goal_value)) * 100),
    };
  });

  const completedChallenges = challengesWithProgress.filter((c) => c.completed).length;
  const totalChallenges = challengesWithProgress.length;

  const isLoading = profileQuery.isLoading || streakQuery.isLoading || challengesQuery.isLoading || progressQuery.isLoading;

  return {
    profile,
    xp,
    currentTier,
    nextTier,
    xpInfo,
    streak: { current: currentStreak, best: bestStreak, multiplier },
    challenges: challengesWithProgress,
    completedChallenges,
    totalChallenges,
    prepaid: prepaidQuery.data,
    points: pointsQuery.data ?? 0,
    isLoading,
    isAuthenticated: !profileQuery.isError,
    TIER_THRESHOLDS,
  };
}
