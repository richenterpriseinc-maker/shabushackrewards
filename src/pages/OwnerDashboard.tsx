import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useOwnerDashboard } from "@/hooks/use-owner-dashboard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  MapPin, Users, DollarSign, Coins, TrendingUp, Tag, Plus,
  Loader2, ShieldAlert, Calendar, Clock
} from "lucide-react";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isOwner, location, locationId, visits, todayVisits, promotions, prepaidTransactions, prepaidDeductions, prepaidLoads, stats, isLoading } = useOwnerDashboard();
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [newPromo, setNewPromo] = useState({
    title: "",
    description: "",
    type: "discount" as string,
    members_only: false,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/login");
    });
  }, [navigate]);

  const handleCreatePromotion = async () => {
    if (!locationId || !newPromo.title.trim()) return;

    const { error } = await supabase.from("promotions").insert({
      location_id: locationId,
      title: newPromo.title,
      description: newPromo.description,
      type: newPromo.type as any,
      members_only: newPromo.members_only,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Promotion created!" });
      setPromoDialogOpen(false);
      setNewPromo({ title: "", description: "", type: "discount", members_only: false });
      queryClient.invalidateQueries({ queryKey: ["owner_promotions"] });
    }
  };

  const togglePromoActive = async (promoId: string, currentActive: boolean) => {
    const { error } = await supabase
      .from("promotions")
      .update({ is_active: !currentActive })
      .eq("id", promoId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["owner_promotions"] });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-mobile-nav md:pb-0">
        <Navbar />
        <main className="pt-24 pb-16 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-background pb-mobile-nav md:pb-0">
        <Navbar />
        <main className="pt-24 pb-16 flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="py-8 text-center">
              <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                You don't have location owner access. Contact an admin to be assigned a location.
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-mobile-nav md:pb-0">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-6 h-6 text-primary" />
              <h1 className="font-display text-3xl font-bold text-foreground tracking-wider">
                {location?.name || "Owner Dashboard"}
              </h1>
            </div>
            <p className="text-muted-foreground">{location?.address}, {location?.city}</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { icon: Calendar, label: "Today", value: todayVisits.length.toString(), color: "text-primary" },
              { icon: Users, label: "Total Visits", value: stats.totalVisits.toString(), color: "text-primary" },
              { icon: Users, label: "Unique Guests", value: stats.uniqueCustomers.toString(), color: "text-accent" },
              { icon: DollarSign, label: "Revenue", value: `$${stats.totalRevenue.toFixed(0)}`, color: "text-accent" },
              { icon: Tag, label: "Active Deals", value: stats.activePromotions.toString(), color: "text-primary" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-border">
                  <CardContent className="py-4 text-center">
                    <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Visits */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-lg tracking-wide flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    RECENT VISITS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {visits.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No visits recorded yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {visits.slice(0, 20).map((visit) => {
                        const profile = visit.profiles as any;
                        return (
                          <div key={visit.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <div>
                              <p className="text-sm font-medium text-foreground">{profile?.name || "Guest"}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(visit.visited_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-foreground">${Number(visit.amount_spent).toFixed(2)}</p>
                              <p className="text-xs text-primary">+{visit.points_earned} pts</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Promotions */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display text-lg tracking-wide flex items-center gap-2">
                      <Tag className="w-5 h-5 text-primary" />
                      PROMOTIONS
                    </CardTitle>
                    <Dialog open={promoDialogOpen} onOpenChange={setPromoDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="gap-1">
                          <Plus className="w-4 h-4" /> New
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Promotion</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                          <div>
                            <Label htmlFor="promo-title">Title</Label>
                            <Input
                              id="promo-title"
                              value={newPromo.title}
                              onChange={(e) => setNewPromo({ ...newPromo, title: e.target.value })}
                              placeholder="e.g. Tuesday 20% Off"
                            />
                          </div>
                          <div>
                            <Label htmlFor="promo-desc">Description</Label>
                            <Textarea
                              id="promo-desc"
                              value={newPromo.description}
                              onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                              placeholder="Details about the promotion..."
                            />
                          </div>
                          <div>
                            <Label>Type</Label>
                            <Select value={newPromo.type} onValueChange={(v) => setNewPromo({ ...newPromo, type: v })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="discount">Discount</SelectItem>
                                <SelectItem value="points_multiplier">Points Multiplier</SelectItem>
                                <SelectItem value="free_item">Free Item</SelectItem>
                                <SelectItem value="flash_deal">Flash Deal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={newPromo.members_only}
                              onCheckedChange={(v) => setNewPromo({ ...newPromo, members_only: v })}
                            />
                            <Label>Members only (VIP)</Label>
                          </div>
                          <Button onClick={handleCreatePromotion} className="w-full" disabled={!newPromo.title.trim()}>
                            Create Promotion
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {promotions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No promotions yet. Create one!</p>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {promotions.map((promo) => (
                        <div key={promo.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-foreground">{promo.title}</p>
                              <Badge variant={promo.is_active ? "default" : "secondary"} className="text-xs">
                                {promo.is_active ? "Active" : "Inactive"}
                              </Badge>
                              {promo.members_only && (
                                <Badge variant="outline" className="text-xs">VIP</Badge>
                              )}
                            </div>
                            {promo.description && (
                              <p className="text-xs text-muted-foreground">{promo.description}</p>
                            )}
                          </div>
                          <Switch
                            checked={promo.is_active}
                            onCheckedChange={() => togglePromoActive(promo.id, promo.is_active)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Monthly Prepaid Revenue Report */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
            <Card className="mt-6 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-lg tracking-wide flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  PREPAID REVENUE REPORT
                </CardTitle>
              </CardHeader>
              <CardContent>
                {prepaidTransactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No prepaid transactions yet.</p>
                ) : (
                  <>
                    {/* Summary */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-3 rounded-lg bg-muted/50 text-center">
                        <p className="text-2xl font-bold text-foreground">${stats.prepaidLoads.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Total Loaded</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 text-center">
                        <p className="text-2xl font-bold text-primary">${stats.prepaidRedemptions.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Total Redeemed</p>
                      </div>
                    </div>
                    {/* Monthly breakdown */}
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {(() => {
                        const monthlyMap = new Map<string, { loads: number; deductions: number; bonuses: number }>();
                        prepaidTransactions.forEach((tx) => {
                          const d = new Date(tx.created_at);
                          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                          const entry = monthlyMap.get(key) || { loads: 0, deductions: 0, bonuses: 0 };
                          if (tx.type === "load") {
                            entry.loads += Number(tx.amount);
                            entry.bonuses += Number(tx.bonus_amount);
                          } else {
                            entry.deductions += Number(tx.amount);
                          }
                          monthlyMap.set(key, entry);
                        });
                        return Array.from(monthlyMap.entries())
                          .sort((a, b) => b[0].localeCompare(a[0]))
                          .map(([month, data]) => {
                            const [y, m] = month.split("-");
                            const label = new Date(Number(y), Number(m) - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
                            return (
                              <div key={month} className="p-3 rounded-lg border border-border">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    {label}
                                  </p>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                  <div>
                                    <p className="font-medium text-foreground">${data.loads.toFixed(2)}</p>
                                    <p className="text-muted-foreground">Loaded</p>
                                  </div>
                                  <div>
                                    <p className="font-medium text-primary">${data.deductions.toFixed(2)}</p>
                                    <p className="text-muted-foreground">Redeemed</p>
                                  </div>
                                  <div>
                                    <p className="font-medium text-accent">${data.bonuses.toFixed(2)}</p>
                                    <p className="text-muted-foreground">Bonuses</p>
                                  </div>
                                </div>
                              </div>
                            );
                          });
                      })()}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Location Info */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="mt-6 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-lg tracking-wide flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  LOCATION INFO
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Address</p>
                    <p className="text-foreground font-medium">{location?.address}, {location?.city}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="text-foreground font-medium">{location?.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Hours</p>
                    <p className="text-foreground font-medium">{location?.hours || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Staff PIN</p>
                    <p className="text-foreground font-medium font-mono">{location?.pin_code || "—"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OwnerDashboard;
