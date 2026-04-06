import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

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

  const staffApiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/staff-action`;

  const callStaffApi = async (body: Record<string, any>) => {
    const res = await fetch(staffApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      body: JSON.stringify({ pin, ...body }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  };

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = pin.trim();
    const match = Object.entries(LOCATION_PINS).find(([, p]) => p === trimmed);
    if (!match) {
      setPinError("Invalid PIN");
      return;
    }
    setLocationName(match[0]);
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
      const data = await callStaffApi({ action: "search", query: searchQuery.trim() });
      if (data.locationId) setLocationId(data.locationId);
      if (data.locationName) setLocationName(data.locationName);
      setCustomer({
        userId: data.customer.userId,
        name: data.customer.name,
        phone: data.customer.phone,
        email: data.customer.userId.slice(0, 8) + "...",
        tier: data.customer.tier,
        punches: data.customer.punches,
        completedCards: data.customer.completedCards,
        points: data.customer.points,
        prepaidBalance: data.customer.prepaidBalance,
        bonusCredits: data.customer.bonusCredits,
      });
    } catch (err: any) {
      toast.error(err.message || "Search failed");
    }
    setSearching(false);
  };

  const addPunch = async () => {
    if (!customer) return;
    setActionLoading(true);
    try {
      const data = await callStaffApi({
        action: "add_punch",
        userId: customer.userId,
        punches: customer.punches,
        completedCards: customer.completedCards,
      });
      setCustomer({
        ...customer,
        punches: data.punches,
        completedCards: data.completedCards,
      });
      toast.success(
        data.punches === 0
          ? `🎉 Punch card completed! +${data.xpEarned} XP earned!`
          : `Punch added (${data.punches}/10) +${data.xpEarned} XP`
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
      await callStaffApi({
        action: "add_points",
        userId: customer.userId,
        amount,
        type,
        description: pointsDesc || (type === "earn" ? "Staff awarded" : "Staff redeemed"),
      });
      const newPoints = type === "earn" ? customer.points + amount : customer.points - amount;
      setCustomer({ ...customer, points: Math.max(0, newPoints) });
      setPointsAmount("");
      setPointsDesc("");
      toast.success(type === "earn" ? `+${amount} points added` : `${amount} points redeemed`);
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
      const data = await callStaffApi({
        action: "load_balance",
        userId: customer.userId,
        amount,
        currentBalance: customer.prepaidBalance,
        currentBonus: customer.bonusCredits,
      });
      setCustomer({
        ...customer,
        prepaidBalance: data.balance,
        bonusCredits: data.bonusCredits,
      });
      setLoadAmount("");
      toast.success(
        `$${amount.toFixed(2)} loaded${data.bonusAdded > 0 ? ` + $${data.bonusAdded.toFixed(2)} bonus!` : ""}`
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
      const data = await callStaffApi({
        action: "deduct_balance",
        userId: customer.userId,
        amount,
        currentBalance: customer.prepaidBalance,
        currentBonus: customer.bonusCredits,
      });
      setCustomer({
        ...customer,
        prepaidBalance: data.balance,
        bonusCredits: data.bonusCredits,
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

              {/* Prepaid Balance */}
              <Card>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" /> Prepaid Balance
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  {/* Balance breakdown */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-muted rounded-lg p-2">
                      <p className="text-sm font-bold text-foreground">
                        ${customer.prepaidBalance.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase">Cash Balance</p>
                    </div>
                    <div className="bg-muted rounded-lg p-2">
                      <p className="text-sm font-bold text-foreground">
                        ${customer.bonusCredits.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase">Bonus Credits</p>
                    </div>
                  </div>

                  {/* Deduct at checkout */}
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-medium text-foreground mb-2">Deduct at Checkout</p>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="$ Amount"
                        value={deductAmount}
                        onChange={(e) => setDeductAmount(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={deductBalance}
                        disabled={actionLoading || (customer.prepaidBalance + customer.bonusCredits) <= 0}
                      >
                        <Minus className="w-3 h-3 mr-1" /> Deduct
                      </Button>
                    </div>
                  </div>

                  {/* Load balance */}
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-medium text-foreground mb-1">Load Balance</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      $50+ → 10% bonus • $100+ → 20% bonus
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
