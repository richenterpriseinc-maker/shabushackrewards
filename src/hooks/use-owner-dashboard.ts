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

  const prepaidDeductions = prepaidTxQuery.data?.filter(t => t.type === "deduct") ?? [];
  const prepaidLoads = prepaidTxQuery.data?.filter(t => t.type === "load") ?? [];

  // Stats
  const stats = {
    totalVisits: visitsQuery.data?.length ?? 0,
    totalRevenue: visitsQuery.data?.reduce((sum, v) => sum + Number(v.amount_spent), 0) ?? 0,
    totalPointsIssued: visitsQuery.data?.reduce((sum, v) => sum + v.points_earned, 0) ?? 0,
    uniqueCustomers: new Set(visitsQuery.data?.map(v => v.user_id) ?? []).size,
    activePromotions: promotionsQuery.data?.filter(p => p.is_active).length ?? 0,
    prepaidRedemptions: prepaidDeductions.reduce((sum, t) => sum + Number(t.amount), 0),
    prepaidLoads: prepaidLoads.reduce((sum, t) => sum + Number(t.amount), 0),
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
    stats,
    isLoading: locationAccessQuery.isLoading,
  };
}
