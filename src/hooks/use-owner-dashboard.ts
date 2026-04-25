import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useOwnerDashboard() {
  // Get the location(s) this owner manages
  const locationAccessQuery = useQuery({
    queryKey: ["owner_location_access"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("location_owner_access")
        .select("location_id, locations(id, name, address, city, phone, hours, pin_code)")
        .eq("owner_id", user.id);
      if (error) throw error;
      return data;
    },
  });

  const locationId = locationAccessQuery.data?.[0]?.location_id;
  const location = locationAccessQuery.data?.[0]?.locations as any;

  // Visits for this location
  const visitsQuery = useQuery({
    queryKey: ["owner_visits", locationId],
    enabled: !!locationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visits")
        .select("id, user_id, visited_at, amount_spent, points_earned, profiles(name)")
        .eq("location_id", locationId!)
        .order("visited_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  // Promotions for this location
  const promotionsQuery = useQuery({
    queryKey: ["owner_promotions", locationId],
    enabled: !!locationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("location_id", locationId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Prepaid transactions for this location
  const prepaidTxQuery = useQuery({
    queryKey: ["owner_prepaid_transactions", locationId],
    enabled: !!locationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prepaid_transactions")
        .select("id, user_id, type, amount, bonus_amount, created_at")
        .eq("location_id", locationId!)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  // Reward redemptions for this location
  const redemptionsQuery = useQuery({
    queryKey: ["owner_redemptions", locationId],
    enabled: !!locationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reward_redemptions")
        .select("id, user_id, redeemed_at, staff_note")
        .eq("location_id", locationId!)
        .order("redeemed_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      // Fetch profile names for each redemption
      const userIds = [...new Set((data || []).map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name")
        .in("user_id", userIds.length > 0 ? userIds : ["none"]);
      const nameMap = new Map((profiles || []).map(p => [p.user_id, p.name]));
      return (data || []).map(r => ({ ...r, customer_name: nameMap.get(r.user_id) || "Guest" }));
    },
  });

  const prepaidDeductions = prepaidTxQuery.data?.filter(t => t.type === "deduct") ?? [];
  const prepaidLoads = prepaidTxQuery.data?.filter(t => t.type === "load") ?? [];

  // BOGO / Signup-conversion analytics
  // Definition (proxy, since redemption isn't a discrete event in DB):
  //   - "Signup" = profile.created_at
  //   - "BOGO redemption" = customer's first visit at THIS location, occurring
  //     within N days of their signup. This matches the BOGO offer that's
  //     redeemed in-store on the first visit after sign-up.
  const bogoQuery = useQuery({
    queryKey: ["owner_bogo_analytics", locationId],
    enabled: !!locationId,
    queryFn: async () => {
      // Pull all visits at this location with visited_at (we already have, but
      // get full set rather than the limited-50 from the visits query above).
      const { data: locVisits, error: vErr } = await supabase
        .from("visits")
        .select("user_id, visited_at")
        .eq("location_id", locationId!)
        .order("visited_at", { ascending: true });
      if (vErr) throw vErr;

      // First-visit-at-this-location per user
      const firstVisit = new Map<string, string>();
      (locVisits || []).forEach(v => {
        if (!firstVisit.has(v.user_id)) firstVisit.set(v.user_id, v.visited_at);
      });

      // Pull signup dates for users who have visited this location
      const userIds = Array.from(firstVisit.keys());
      const { data: profs, error: pErr } = await supabase
        .from("profiles")
        .select("user_id, created_at")
        .in("user_id", userIds.length > 0 ? userIds : ["none"]);
      if (pErr) throw pErr;

      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      let signups7 = 0, signups30 = 0;
      let conv7 = 0, conv30 = 0;

      (profs || []).forEach(p => {
        const created = new Date(p.created_at).getTime();
        const daysSinceSignup = (now - created) / day;
        const fv = firstVisit.get(p.user_id);
        const daysToFirstVisit = fv
          ? (new Date(fv).getTime() - created) / day
          : Infinity;

        if (daysSinceSignup <= 7) signups7 += 1;
        if (daysSinceSignup <= 30) signups30 += 1;

        // Redeemed within 7 days of signup AND signup happened in last 7 days
        if (daysSinceSignup <= 7 && daysToFirstVisit <= 7 && daysToFirstVisit >= 0) conv7 += 1;
        if (daysSinceSignup <= 30 && daysToFirstVisit <= 30 && daysToFirstVisit >= 0) conv30 += 1;
      });

      return {
        signups7,
        signups30,
        conv7,
        conv30,
        rate7: signups7 > 0 ? (conv7 / signups7) * 100 : 0,
        rate30: signups30 > 0 ? (conv30 / signups30) * 100 : 0,
      };
    },
  });

  // Stats
  const stats = {
    totalVisits: visitsQuery.data?.length ?? 0,
    totalRevenue: visitsQuery.data?.reduce((sum, v) => sum + Number(v.amount_spent), 0) ?? 0,
    totalPointsIssued: visitsQuery.data?.reduce((sum, v) => sum + v.points_earned, 0) ?? 0,
    uniqueCustomers: new Set(visitsQuery.data?.map(v => v.user_id) ?? []).size,
    activePromotions: promotionsQuery.data?.filter(p => p.is_active).length ?? 0,
    prepaidRedemptions: prepaidDeductions.reduce((sum, t) => sum + Number(t.amount), 0),
    prepaidLoads: prepaidLoads.reduce((sum, t) => sum + Number(t.amount), 0),
    totalRewardRedemptions: redemptionsQuery.data?.length ?? 0,
  };

  // Today's visits
  const today = new Date().toISOString().split("T")[0];
  const todayVisits = visitsQuery.data?.filter(v => v.visited_at.startsWith(today)) ?? [];

  return {
    isOwner: (locationAccessQuery.data?.length ?? 0) > 0,
    location,
    locationId,
    visits: visitsQuery.data ?? [],
    todayVisits,
    promotions: promotionsQuery.data ?? [],
    prepaidTransactions: prepaidTxQuery.data ?? [],
    prepaidDeductions,
    prepaidLoads,
    redemptions: redemptionsQuery.data ?? [],
    stats,
    isLoading: locationAccessQuery.isLoading,
  };
}
