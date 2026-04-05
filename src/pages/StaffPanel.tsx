import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Lock,
  Search,
  Plus,
  Minus,
  CreditCard,
  Gift,
  Stamp,
  LogOut,
  User,
  MapPin,
  Camera,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LOCATION_PINS: Record<string, string> = {
  "Elk Grove": "8888",
  "South San Francisco": "7777",
  "Downtown Sacramento": "6666",
  Davis: "5555",
};

interface CustomerData {
  userId: string;
  name: string | null;
  phone: string | null;
  email: string;
  tier: string;
  punches: number;
  completedCards: number;
  points: number;
  prepaidBalance: number;
  bonusCredits: number;
}

const StaffPanel: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [verified, setVerified] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [locationId, setLocationId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [customer, setCustomer] = useState<CustomerData | null>(null);

  // Scanner state
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef<any>(null);
  const scannerContainerId = "qr-scanner-region";

  // Action states
  const [pointsAmount, setPointsAmount] = useState("");
  const [pointsDesc, setPointsDesc] = useState("");
  const [loadAmount, setLoadAmount] = useState("");
  const [deductAmount, setDeductAmount] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const handleQrScan = useCallback((decodedText: string) => {
    setSearchQuery(decodedText);
    setShowScanner(false);
    // Auto-submit search
    setTimeout(() => {
      const form = document.querySelector<HTMLFormElement>("#staff-search-form");
      form?.requestSubmit();
    }, 100);
  }, []);

  useEffect(() => {
    if (!showScanner) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
      return;
    }

    let cancelled = false;

    const startScanner = async () => {
      const { Html5QrcodeScanner } = await import("html5-qrcode");
      if (cancelled) return;

      const scanner = new Html5QrcodeScanner(
        scannerContainerId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
        },
        false
      );

      scanner.render(
        (decodedText: string) => {
          handleQrScan(decodedText);
          scanner.clear().catch(() => {});
        },
        () => {} // ignore errors
      );

      scannerRef.current = scanner;
    };

    startScanner();

    return () => {
      cancelled = true;
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [showScanner, handleQrScan]);

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = pin.trim();
    const match = Object.entries(LOCATION_PINS).find(([, p]) => p === trimmed);
    if (!match) {
      setPinError("Invalid PIN");
      return;
    }
    // Find location_id from DB
    const { data } = await supabase
      .from("locations")
      .select("id, name")
      .eq("pin_code", trimmed)
      .maybeSingle();
    if (data) {
      setLocationId(data.id);
      setLocationName(data.name);
    } else {
      setLocationName(match[0]);
    }
    setVerified(true);
    setPinError("");
    // Auto-search if customer param exists
    const customerParam = searchParams.get("customer");
    if (customerParam) {
      setSearchQuery(`shabu:${customerParam}`);
      setTimeout(() => {
        document.querySelector<HTMLFormElement>("#staff-search-form")?.requestSubmit();
      }, 100);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setCustomer(null);

    try {
      const query = searchQuery.trim();
      let profileData: any = null;

      // Check for QR code format: shabu:<user_id>
      if (query.startsWith("shabu:")) {
        const qrUserId = query.replace("shabu:", "");
        const { data: byId } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", qrUserId)
          .maybeSingle();
        profileData = byId;
      } else {
        // Try phone match first
        const { data: byPhone } = await supabase
          .from("profiles")
          .select("*")
          .eq("phone", query)
          .maybeSingle();

        if (byPhone) {
          profileData = byPhone;
        } else {
          // Try name search (partial)
          const { data: byName } = await supabase
            .from("profiles")
            .select("*")
            .ilike("name", `%${query}%`)
            .limit(1)
            .maybeSingle();
          profileData = byName;
        }
      }

      if (!profileData) {
        toast.error("No customer found with that phone or name");
        setSearching(false);
        return;
      }

      // Fetch related data
      const userId = profileData.user_id;
      const [punchRes, pointsRes, prepaidRes] = await Promise.all([
        supabase.from("punch_cards").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("points_transactions").select("type, amount").eq("user_id", userId),
        supabase.from("prepaid_balances").select("*").eq("user_id", userId).maybeSingle(),
      ]);

      const totalPoints = (pointsRes.data || []).reduce((sum, t) => {
        return sum + (t.type === "earn" ? t.amount : -t.amount);
      }, 0);

      // Get email from auth - we'll show user_id shortened as fallback
      setCustomer({
        userId,
        name: profileData.name,
        phone: profileData.phone,
        email: userId.slice(0, 8) + "...",
        tier: profileData.membership_tier,
        punches: punchRes.data?.punches_count ?? 0,
        completedCards: punchRes.data?.completed_cards ?? 0,
        points: Math.max(0, totalPoints),
        prepaidBalance: Number(prepaidRes.data?.balance ?? 0),
        bonusCredits: Number(prepaidRes.data?.bonus_credits ?? 0),
      });
    } catch (err) {
      toast.error("Search failed");
      console.error(err);
    }
    setSearching(false);
  };

  const addPunch = async () => {
    if (!customer || !locationId) return;
    setActionLoading(true);
    try {
      const newPunches = customer.punches + 1;
      let newCompleted = customer.completedCards;
      let finalPunches = newPunches;
      if (newPunches >= 10) {
        newCompleted += 1;
        finalPunches = 0;
      }
      await supabase
        .from("punch_cards")
        .update({
          punches_count: finalPunches,
          completed_cards: newCompleted,
          last_punch_at: new Date().toISOString(),
        })
        .eq("user_id", customer.userId);

      // Record visit
      await supabase.from("visits").insert({
        user_id: customer.userId,
        location_id: locationId,
        amount_spent: 0,
        points_earned: 0,
      } as any);

      setCustomer({
        ...customer,
        punches: finalPunches,
        completedCards: newCompleted,
      });
      toast.success(
        finalPunches === 0
          ? "🎉 Punch card completed! Free reward earned!"
          : `Punch added (${finalPunches}/10)`
      );
    } catch {
      toast.error("Failed to add punch");
    }
    setActionLoading(false);
  };

  const addPoints = async (type: "earn" | "redeem") => {
    if (!customer) return;
    const amount = parseInt(pointsAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (type === "redeem" && amount > customer.points) {
      toast.error("Not enough points");
      return;
    }
    setActionLoading(true);
    try {
      await supabase.from("points_transactions").insert({
        user_id: customer.userId,
        amount,
        type,
        description: pointsDesc || (type === "earn" ? "Staff awarded" : "Staff redeemed"),
      } as any);

      const newPoints =
        type === "earn" ? customer.points + amount : customer.points - amount;
      setCustomer({ ...customer, points: Math.max(0, newPoints) });
      setPointsAmount("");
      setPointsDesc("");
      toast.success(
        type === "earn" ? `+${amount} points added` : `${amount} points redeemed`
      );
    } catch {
      toast.error("Failed to update points");
    }
    setActionLoading(false);
  };

  const loadBalance = async () => {
    if (!customer) return;
    const amount = parseFloat(loadAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setActionLoading(true);
    try {
      const bonus = amount >= 100 ? amount * 0.2 : amount >= 50 ? amount * 0.1 : 0;
      await supabase
        .from("prepaid_balances")
        .update({
          balance: customer.prepaidBalance + amount,
          bonus_credits: customer.bonusCredits + bonus,
          last_load_at: new Date().toISOString(),
        })
        .eq("user_id", customer.userId);

      setCustomer({
        ...customer,
        prepaidBalance: customer.prepaidBalance + amount,
        bonusCredits: customer.bonusCredits + bonus,
      });
      setLoadAmount("");
      toast.success(
        `$${amount.toFixed(2)} loaded${bonus > 0 ? ` + $${bonus.toFixed(2)} bonus!` : ""}`
      );
    } catch {
      toast.error("Failed to load balance");
    }
    setActionLoading(false);
  };

  const deductBalance = async () => {
    if (!customer) return;
    const amount = parseFloat(deductAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    const totalAvailable = customer.prepaidBalance + customer.bonusCredits;
    if (amount > totalAvailable) {
      toast.error(`Insufficient balance ($${totalAvailable.toFixed(2)} available)`);
      return;
    }
    setActionLoading(true);
    try {
      // Deduct from bonus credits first, then main balance
      let remaining = amount;
      let newBonus = customer.bonusCredits;
      let newBalance = customer.prepaidBalance;

      if (newBonus > 0) {
        const bonusDeduct = Math.min(remaining, newBonus);
        newBonus -= bonusDeduct;
        remaining -= bonusDeduct;
      }
      newBalance -= remaining;

      await supabase
        .from("prepaid_balances")
        .update({
          balance: newBalance,
          bonus_credits: newBonus,
        })
        .eq("user_id", customer.userId);

      setCustomer({
        ...customer,
        prepaidBalance: newBalance,
        bonusCredits: newBonus,
      });
      setDeductAmount("");
      toast.success(`$${amount.toFixed(2)} deducted from prepaid balance`);
    } catch {
      toast.error("Failed to deduct balance");
    }
    setActionLoading(false);
  };

  if (!verified) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <Card className="border-border bg-card">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="font-display text-3xl tracking-wide">
                Staff Login
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Enter your location PIN to access the staff panel
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePinLogin} className="space-y-4">
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="4-digit PIN"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, "").slice(0, 4));
                    setPinError("");
                  }}
                  className="text-center text-3xl tracking-[0.6em] font-mono h-14"
                />
                {pinError && (
                  <p className="text-destructive text-sm text-center">{pinError}</p>
                )}
                <Button
                  type="submit"
                  disabled={pin.length < 4}
                  className="w-full font-display text-lg tracking-wider h-12"
                >
                  Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary text-foreground">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="font-display text-lg tracking-wide">{locationName}</span>
          <Badge variant="outline" className="text-xs">
            Staff
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setVerified(false);
            setPin("");
            setCustomer(null);
            setSearchQuery("");
          }}
        >
          <LogOut className="w-4 h-4 mr-1" /> Exit
        </Button>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Customer Search */}
        <Card>
          <CardContent className="pt-4 space-y-3">
            <form id="staff-search-form" onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Phone, name, or scan QR..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                variant={showScanner ? "destructive" : "outline"}
                onClick={() => setShowScanner(!showScanner)}
              >
                {showScanner ? <X className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
              </Button>
              <Button type="submit" disabled={searching} size="icon">
                <Search className="w-4 h-4" />
              </Button>
            </form>

            {/* QR Scanner */}
            <AnimatePresence>
              {showScanner && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden rounded-lg"
                >
                  <div id={scannerContainerId} className="w-full" />
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <AnimatePresence>
          {customer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Customer Info */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        {customer.name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {customer.phone || "No phone"}
                      </p>
                    </div>
                    <Badge
                      className={
                        customer.tier === "vip"
                          ? "bg-warm-gold text-secondary"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {customer.tier.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-muted rounded-lg p-2">
                      <p className="text-lg font-bold text-foreground">{customer.points}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Points</p>
                    </div>
                    <div className="bg-muted rounded-lg p-2">
                      <p className="text-lg font-bold text-foreground">
                        {customer.punches}/10
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase">Punches</p>
                    </div>
                    <div className="bg-muted rounded-lg p-2">
                      <p className="text-lg font-bold text-foreground">
                        ${(customer.prepaidBalance + customer.bonusCredits).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase">Balance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Add Punch */}
              <Card>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Stamp className="w-4 h-4 text-primary" /> Punch Card
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-6 h-6 rounded-full border-2 ${
                            i < customer.punches
                              ? "bg-primary border-primary"
                              : "border-border"
                          }`}
                        />
                      ))}
                    </div>
                    <Button
                      size="sm"
                      onClick={addPunch}
                      disabled={actionLoading}
                      className="ml-3"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Punch
                    </Button>
                  </div>
                  {customer.completedCards > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {customer.completedCards} card(s) completed
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Points */}
              <Card>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Gift className="w-4 h-4 text-warm-gold" /> Points
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={pointsAmount}
                      onChange={(e) => setPointsAmount(e.target.value)}
                      className="w-24"
                    />
                    <Input
                      placeholder="Note (optional)"
                      value={pointsDesc}
                      onChange={(e) => setPointsDesc(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => addPoints("earn")}
                      disabled={actionLoading}
                      className="flex-1"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Award
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addPoints("redeem")}
                      disabled={actionLoading}
                      className="flex-1"
                    >
                      <Minus className="w-3 h-3 mr-1" /> Redeem
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Load Balance */}
              <Card>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" /> Prepaid Balance
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Load $50+ → 10% bonus • Load $100+ → 20% bonus
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="$ Amount"
                      value={loadAmount}
                      onChange={(e) => setLoadAmount(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={loadBalance}
                      disabled={actionLoading}
                    >
                      <Plus className="w-3 h-3 mr-1" /> Load
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StaffPanel;
