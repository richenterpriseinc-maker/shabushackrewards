import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Lock,
  Search,
  Plus,
  Minus,
  CreditCard,
  Stamp,
  LogOut,
  User,
  MapPin,
  Camera,
  X,
  Clock,
  ChevronRight,
  RotateCcw,
  Star,
  Gift,
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
  points: number;
  freeEntrees: number;
  prepaidBalance: number;
  bonusCredits: number;
}

interface RecentCustomer {
  userId: string;
  name: string | null;
  phone: string | null;
  timestamp: number;
}

const SESSION_KEY = "staff_session";
const RECENT_KEY = "staff_recent_customers";
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours for tablet mode

function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (Date.now() - session.timestamp > SESSION_DURATION) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function getRecentCustomers(locationName: string): RecentCustomer[] {
  try {
    const raw = localStorage.getItem(`${RECENT_KEY}_${locationName}`);
    if (!raw) return [];
    const list: RecentCustomer[] = JSON.parse(raw);
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return list.filter((c) => c.timestamp > cutoff).slice(0, 10);
  } catch {
    return [];
  }
}

function saveRecentCustomer(locationName: string, customer: CustomerData) {
  const existing = getRecentCustomers(locationName);
  const filtered = existing.filter((c) => c.userId !== customer.userId);
  const updated: RecentCustomer[] = [
    {
      userId: customer.userId,
      name: customer.name,
      phone: customer.phone,
      timestamp: Date.now(),
    },
    ...filtered,
  ].slice(0, 10);
  localStorage.setItem(`${RECENT_KEY}_${locationName}`, JSON.stringify(updated));
}

const StaffPanel: React.FC = () => {
  const [searchParams] = useSearchParams();

  const storedSession = getStoredSession();
  const [pin, setPin] = useState(storedSession?.pin || "");
  const [pinError, setPinError] = useState("");
  const [verified, setVerified] = useState(!!storedSession);
  const [locationName, setLocationName] = useState(storedSession?.locationName || "");
  const [locationId, setLocationId] = useState<string | null>(storedSession?.locationId || null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([]);

  // Scanner state
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef<any>(null);
  const scannerContainerId = "qr-scanner-region";

  // Action states
  const [loadAmount, setLoadAmount] = useState("");
  const [deductAmount, setDeductAmount] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [confirmAdd, setConfirmAdd] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (verified && locationName) {
      setRecentCustomers(getRecentCustomers(locationName));
    }
  }, [verified, locationName]);

  const handleQrScan = useCallback((decodedText: string) => {
    setSearchQuery(decodedText);
    setShowScanner(false);
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
        () => {}
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
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
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

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        pin: trimmed,
        locationName: match[0],
        locationId: null,
        timestamp: Date.now(),
      })
    );

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
      if (data.locationId) {
        setLocationId(data.locationId);
        const session = getStoredSession();
        if (session) {
          localStorage.setItem(
            SESSION_KEY,
            JSON.stringify({ ...session, locationId: data.locationId })
          );
        }
      }
      if (data.locationName) setLocationName(data.locationName);
      const c: CustomerData = {
        userId: data.customer.userId,
        name: data.customer.name,
        phone: data.customer.phone,
        email: data.customer.userId.slice(0, 8) + "...",
        tier: data.customer.tier,
        points: data.customer.points,
        freeEntrees: data.customer.freeEntrees,
        prepaidBalance: data.customer.prepaidBalance,
        bonusCredits: data.customer.bonusCredits,
      };
      setCustomer(c);
      saveRecentCustomer(locationName, c);
      setRecentCustomers(getRecentCustomers(locationName));
    } catch (err: any) {
      toast.error(err.message || "Search failed");
    }
    setSearching(false);
  };

  const lookupRecent = (recent: RecentCustomer) => {
    setSearchQuery(`shabu:${recent.userId}`);
    setTimeout(() => {
      document.querySelector<HTMLFormElement>("#staff-search-form")?.requestSubmit();
    }, 50);
  };

  const addPoint = async () => {
    if (!customer) return;
    setActionLoading(true);
    try {
      const data = await callStaffApi({
        action: "add_point",
        userId: customer.userId,
        points: customer.points,
        freeEntrees: customer.freeEntrees,
      });
      setCustomer({
        ...customer,
        points: data.points,
        freeEntrees: data.freeEntrees,
      });
      if (data.points === 0) {
        // 10th point reached — show celebration!
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 4000);
      }
      const xpBreakdown = data.streakMultiplier > 1
        ? `${data.baseXp} base XP × ${data.streakMultiplier}x streak = ${data.xpEarned} XP`
        : `+${data.xpEarned} XP`;
      toast.success(
        data.points === 0
          ? `🎉 Free entrée earned! ${xpBreakdown}`
          : `Point added (${data.points}/10) ${xpBreakdown}`
      );
    } catch {
      toast.error("Failed to add point");
    }
    setActionLoading(false);
  };

  const redeemReward = async () => {
    if (!customer) return;
    setActionLoading(true);
    try {
      const data = await callStaffApi({
        action: "redeem_reward",
        userId: customer.userId,
      });
      setCustomer({
        ...customer,
        freeEntrees: data.freeEntrees,
      });
      toast.success(`🍲 Free entrée redeemed! ${data.freeEntrees} remaining`);
    } catch (err: any) {
      toast.error(err.message || "Failed to redeem reward");
    }
    setActionLoading(false);
  };

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

  const clearCustomer = () => {
    setCustomer(null);
    setSearchQuery("");
    setLoadAmount("");
    setDeductAmount("");
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setVerified(false);
    setPin("");
    setCustomer(null);
    setLocationName("");
    setLocationId(null);
  };

  // ─── PIN Screen ───
  if (!verified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="w-full max-w-sm">
            <CardContent className="p-6 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-bold tracking-wider uppercase">
                Staff Login
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your location PIN to access the staff panel
              </p>
              <form onSubmit={handlePinLogin} className="space-y-3">
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="4-digit PIN"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setPinError("");
                  }}
                  className="text-center text-xl tracking-[0.3em] h-14"
                />
                {pinError && <p className="text-sm text-destructive">{pinError}</p>}
                <Button type="submit" className="w-full h-12 font-display tracking-wider">
                  LOGIN
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ─── Staff Panel ───
  return (
    <div className="min-h-screen bg-background">
      {/* 🎉 Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-secondary/80 backdrop-blur-sm"
            onClick={() => setShowCelebration(false)}
          >
            {/* Confetti particles */}
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ["#e53e3e", "#dd6b20", "#d69e2e", "#38a169", "#3182ce", "#805ad5", "#d53f8c"][i % 7],
                  left: `${Math.random() * 100}%`,
                  top: "-5%",
                }}
                animate={{
                  y: [0, window.innerHeight * 1.2],
                  x: [0, (Math.random() - 0.5) * 200],
                  rotate: [0, Math.random() * 720],
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.8,
                  ease: "easeOut",
                }}
              />
            ))}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
              className="bg-background rounded-2xl p-8 shadow-2xl text-center max-w-xs mx-4 relative z-10"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="font-display text-2xl font-bold text-foreground tracking-wider mb-2">
                FREE ENTRÉE!
              </h2>
              <p className="text-muted-foreground text-sm mb-1">
                {customer?.name || "Customer"} earned a free entrée!
              </p>
              <p className="text-primary font-bold text-lg">
                10 points completed 🍲
              </p>
              <p className="text-xs text-muted-foreground mt-3">Tap anywhere to dismiss</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="font-display text-sm font-bold tracking-wider uppercase">
            Shabu Shack {locationName}
          </span>
          <Badge variant="outline" className="text-[10px] h-5">
            Staff
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 w-8 p-0">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      <div className="max-w-lg mx-auto p-3 space-y-3">
        {/* Search Bar */}
        <Card>
          <CardContent className="p-3 space-y-2">
            <form id="staff-search-form" onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Phone, name, or last 4 digits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-12 text-base"
                inputMode="search"
              />
              <Button
                type="button"
                size="icon"
                variant={showScanner ? "destructive" : "outline"}
                onClick={() => setShowScanner(!showScanner)}
                className="h-12 w-12 shrink-0"
              >
                {showScanner ? <X className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
              </Button>
              <Button type="submit" disabled={searching} size="icon" className="h-12 w-12 shrink-0">
                <Search className="w-5 h-5" />
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

            {/* Recent Customers */}
            {!customer && recentCustomers.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Recent
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {recentCustomers.map((rc) => (
                    <button
                      key={rc.userId}
                      onClick={() => lookupRecent(rc)}
                      className="flex items-center gap-1.5 bg-muted hover:bg-muted/80 rounded-full px-3 py-1.5 text-xs font-medium text-foreground transition-colors min-h-[36px]"
                    >
                      <User className="w-3 h-3 text-muted-foreground" />
                      {rc.name || rc.phone || "Unknown"}
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Card + Actions */}
        <AnimatePresence>
          {customer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <Card>
                <CardContent className="p-3">
                  {/* Customer header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearCustomer}
                      className="h-8 w-8 p-0 shrink-0"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="bg-muted rounded-lg p-2">
                      <p className="text-lg font-bold text-foreground">{customer.points}/10</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Points</p>
                    </div>
                    <div className="bg-muted rounded-lg p-2">
                      <p className="text-lg font-bold text-foreground">{customer.freeEntrees}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Free Entrées</p>
                    </div>
                    <div className="bg-muted rounded-lg p-2">
                      <p className="text-lg font-bold text-foreground">
                        ${(customer.prepaidBalance + customer.bonusCredits).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase">Balance</p>
                    </div>
                  </div>

                  {/* Record Visit — primary action with confirmation */}
                  <Button
                    onClick={() => {
                      if (!confirmAdd) {
                        setConfirmAdd(true);
                        if (confirmTimer.current) clearTimeout(confirmTimer.current);
                        confirmTimer.current = setTimeout(() => setConfirmAdd(false), 3000);
                        return;
                      }
                      setConfirmAdd(false);
                      if (confirmTimer.current) clearTimeout(confirmTimer.current);
                      addPoint();
                    }}
                    disabled={actionLoading}
                    variant={confirmAdd ? "destructive" : "default"}
                    className={`w-full h-12 text-base font-display tracking-wide transition-all ${confirmAdd ? "animate-pulse" : ""}`}
                  >
                    <Stamp className="w-5 h-5 mr-2" />
                    {confirmAdd ? "Tap Again to Confirm" : "Add Point (+50 XP)"}
                  </Button>

                  {/* Points progress visual */}
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          i < customer.points
                            ? "bg-primary border-primary"
                            : "border-border"
                        }`}
                      >
                        {i < customer.points && (
                          <Star className="w-3 h-3 text-primary-foreground fill-current" />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    {customer.points === 0 && customer.freeEntrees > 0
                      ? `${customer.freeEntrees} free entrée${customer.freeEntrees > 1 ? "s" : ""} earned!`
                      : customer.points >= 9
                        ? "🔥 One more point for a free entrée!"
                        : `${10 - customer.points} more point${10 - customer.points === 1 ? "" : "s"} to free entrée`}
                  </p>
                </CardContent>
              </Card>

              {/* Prepaid Balance */}
              <Card>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">Prepaid</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      ${customer.prepaidBalance.toFixed(2)} cash + ${customer.bonusCredits.toFixed(2)} bonus
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="$ Deduct"
                      value={deductAmount}
                      onChange={(e) => setDeductAmount(e.target.value)}
                      className="flex-1 h-10"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={deductBalance}
                      disabled={
                        actionLoading ||
                        customer.prepaidBalance + customer.bonusCredits <= 0
                      }
                      className="h-10 px-4"
                    >
                      <Minus className="w-3 h-3 mr-1" /> Use
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="$ Load"
                      value={loadAmount}
                      onChange={(e) => setLoadAmount(e.target.value)}
                      className="flex-1 h-10"
                    />
                    <Button
                      size="sm"
                      onClick={loadBalance}
                      disabled={actionLoading}
                      className="h-10 px-4"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Load
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    $50+ → 10% bonus • $100+ → 20% bonus
                  </p>
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
