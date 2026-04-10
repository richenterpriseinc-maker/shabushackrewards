import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthReady } from "@/hooks/use-auth-ready";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import {
  Users, TrendingUp, Utensils, DollarSign, Search,
  Loader2, ShieldAlert, Shield, Crown, Star, Trophy,
  ChevronLeft, ChevronRight, Gift,
} from "lucide-react";

const TIER_ICON_MAP: Record<string, typeof Shield> = {
  bronze: Shield,
  silver: Star,
  gold: Crown,
  diamond: Trophy,
};

const PAGE_SIZE = 15;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isReady } = useAuthReady();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  // Check admin role
  const roleQuery = useQuery({
    queryKey: ["admin-role-check", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: isReady && !!user,
  });

  // All profiles
  const profilesQuery = useQuery({
    queryKey: ["admin-all-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, name, phone, current_tier, xp_total, membership_tier, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: roleQuery.data === true,
  });

  // All punch cards
  const punchCardsQuery = useQuery({
    queryKey: ["admin-all-punchcards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("punch_cards")
        .select("user_id, punches_count, completed_cards");
      if (error) throw error;
      return data || [];
    },
    enabled: roleQuery.data === true,
  });

  // Visit stats
  const visitsQuery = useQuery({
    queryKey: ["admin-visit-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visits")
        .select("id, user_id, visited_at, location_id");
      if (error) throw error;
      return data || [];
    },
    enabled: roleQuery.data === true,
  });

  // Prepaid totals
  const prepaidQuery = useQuery({
    queryKey: ["admin-prepaid-totals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prepaid_transactions")
        .select("type, amount, bonus_amount");
      if (error) throw error;
      return data || [];
    },
    enabled: roleQuery.data === true,
  });

  // Reward redemptions
  const redemptionsQuery = useQuery({
    queryKey: ["admin-redemptions-total"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reward_redemptions")
        .select("id");
      if (error) throw error;
      return data || [];
    },
    enabled: roleQuery.data === true,
  });

  useEffect(() => {
    if (isReady && !user) navigate("/login", { replace: true });
  }, [isReady, user, navigate]);

  if (!isReady || roleQuery.isLoading || profilesQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (roleQuery.data !== true) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <ShieldAlert className="w-12 h-12 text-destructive" />
          <h1 className="text-xl font-display font-bold text-foreground">Access Denied</h1>
          <p className="text-sm text-muted-foreground">You need admin privileges to view this page.</p>
          <Button onClick={() => navigate("/dashboard")} variant="outline">Back to Dashboard</Button>
        </main>
      </div>
    );
  }

  const profiles = profilesQuery.data || [];
  const punchCards = punchCardsQuery.data || [];
  const visits = visitsQuery.data || [];
  const prepaidTx = prepaidQuery.data || [];
  const totalRedemptions = redemptionsQuery.data?.length ?? 0;

  // Metrics
  const totalMembers = profiles.length;
  const totalVisits = visits.length;
  const totalLoaded = prepaidTx
    .filter((t) => t.type === "load")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalRedeemed = prepaidTx
    .filter((t) => t.type === "deduct")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Recent signups (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSignups = profiles.filter(
    (p) => new Date(p.created_at) >= thirtyDaysAgo
  ).length;

  // Today's visits
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayVisits = visits.filter(
    (v) => v.visited_at.slice(0, 10) === todayStr
  ).length;

  // Build punch card map
  const punchMap = new Map(punchCards.map((p) => [p.user_id, p]));

  // Filter and paginate profiles
  const filtered = profiles.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (p.name || "").toLowerCase().includes(q) ||
      (p.phone || "").includes(q) ||
      p.user_id.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-display font-bold text-foreground tracking-wide mb-1">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mb-6">Overview of all members, visits, and activity</p>
          </motion.div>

          {/* Metric Cards */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {[
                { icon: Users, label: "Total Members", value: totalMembers.toLocaleString(), sub: `${recentSignups} new (30d)` },
                { icon: Utensils, label: "Total Visits", value: totalVisits.toLocaleString(), sub: `${todayVisits} today` },
                { icon: Gift, label: "Redemptions", value: totalRedemptions.toLocaleString(), sub: "free entrées" },
                { icon: DollarSign, label: "Prepaid Loaded", value: `$${totalLoaded.toFixed(0)}`, sub: "all time" },
                { icon: TrendingUp, label: "Prepaid Redeemed", value: `$${totalRedeemed.toFixed(0)}`, sub: "all time" },
              ].map((m) => (
                <Card key={m.label} className="border-border">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <m.icon className="w-5 h-5 text-primary" />
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{m.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{m.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Search + Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <CardTitle className="text-lg font-display tracking-wide">All Members</CardTitle>
                  <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or phone…"
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                      className="pl-9 h-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead className="text-right">XP</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                        <TableHead className="text-right">Free Entrées</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginated.map((p) => {
                        const pc = punchMap.get(p.user_id);
                        const TIcon = TIER_ICON_MAP[p.current_tier] || Shield;
                        return (
                          <TableRow key={p.user_id}>
                            <TableCell className="font-medium">{p.name || "—"}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">{p.phone || "—"}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs gap-1">
                                <TIcon className="w-3 h-3" />
                                {p.current_tier}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm">{p.xp_total.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-mono text-sm">{pc?.punches_count ?? 0}/10</TableCell>
                            <TableCell className="text-right font-mono text-sm">{pc?.completed_cards ?? 0}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {paginated.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            {search ? "No members match your search." : "No members yet."}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
                    </p>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)} className="h-7 w-7 p-0">
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="h-7 w-7 p-0">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
