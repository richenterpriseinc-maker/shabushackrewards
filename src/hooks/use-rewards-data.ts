import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useRewardsData() {
  const profileQuery = useQuery({
    queryKey: ["profile"],
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

  const punchCardQuery = useQuery({
    queryKey: ["punch_card"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("punch_cards")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
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

  const activityQuery = useQuery({
    queryKey: ["recent_activity"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch points transactions with location info via visits
      const { data: pointsTx } = await supabase
        .from("points_transactions")
        .select("id, type, amount, description, created_at, related_visit_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      // Fetch visits for location names
      const { data: visits } = await supabase
        .from("visits")
        .select("id, location_id, visited_at, amount_spent, points_earned, locations(name)")
        .eq("user_id", user.id)
        .order("visited_at", { ascending: false })
        .limit(20);

      // Fetch birthday spins
      const { data: spins } = await supabase
        .from("birthday_spins")
        .select("id, spin_date, prize_type, prize_value, created_at, locations(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      // Build visit lookup
      const visitMap = new Map<string, { locationName: string }>();
      for (const v of visits || []) {
        const loc = v.locations as any;
        visitMap.set(v.id, { locationName: loc?.name || "—" });
      }

      // Combine into activity feed
      type Activity = { date: string; action: string; location: string; type: string };
      const activities: Activity[] = [];

      for (const tx of pointsTx || []) {
        const visit = tx.related_visit_id ? visitMap.get(tx.related_visit_id) : null;
        activities.push({
          date: new Date(tx.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          action: tx.type === "earn"
            ? `Earned ${tx.amount} pts`
            : `Redeemed: ${tx.description || `${tx.amount} pts`}`,
          location: visit?.locationName || "—",
          type: tx.type === "earn" ? "earn" : "redeem",
        });
      }

      for (const spin of spins || []) {
        const loc = spin.locations as any;
        activities.push({
          date: new Date(spin.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          action: `Birthday Spin: ${spin.prize_value}`,
          location: loc?.name || "—",
          type: "spin",
        });
      }

      // Sort by date descending
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return activities.slice(0, 10);
    },
  });

  const isLoading = profileQuery.isLoading || punchCardQuery.isLoading || prepaidQuery.isLoading || pointsQuery.isLoading;

  return {
    profile: profileQuery.data,
    punchCard: punchCardQuery.data,
    prepaid: prepaidQuery.data,
    points: pointsQuery.data ?? 0,
    activity: activityQuery.data ?? [],
    isLoading,
    isAuthenticated: !profileQuery.isError,
  };
}
