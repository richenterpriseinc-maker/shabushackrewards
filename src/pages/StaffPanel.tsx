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
  Gift,
  Stamp,
  LogOut,
  User,
  MapPin,
  Camera,
  X,
  Clock,
  ChevronRight,
  RotateCcw,
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
    // Keep last 24 hours only
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

  // Session state — restore from localStorage for tablet persistence
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
  const [pointsAmount, setPointsAmount] = useState("");
  const [pointsDesc, setPointsDesc] = useState("");
  const [loadAmount, setLoadAmount] = useState("");
  const [deductAmount, setDeductAmount] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Load recent customers when location changes
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

    // Persist session for tablet mode
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        pin: trimmed,
        locationName: match[0],
        locationId: null,
        timestamp: Date.now(),
      })
    );

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
      if (data.locationId) {
        setLocationId(data.locationId);
        // Update stored session with locationId
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
        punches: data.customer.punches,
        completedCards: data.customer.completedCards,
        points: data.customer.points,
        prepaidBalance: data.customer.prepaidBalance,
        bonusCredits: data.customer.bonusCredits,
      };
      setCustomer(c);
      // Save to recent
      saveRecentCustomer(locationName, c);
      setRecentCustomers(getRecentCustomers(locationName));
    } catch (err: any) {
      toast.error(err.message || "Search failed");
    }
    setSearching(false);
  };

  const lookupRecent = (recent: RecentCustomer) => {
    // Use userId for exact lookup
    setSearchQuery(`shabu:${recent.userId}`);
    setTimeout(() => {
      document.querySelector<HTMLFormElement>("#staff-search-form")?.requestSubmit();
    }, 50);
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

  const clearCustomer = () => {
    setCustomer(null);
    setSearchQuery("");
    setPointsAmount("");
    setPointsDesc("");
    setLoadAmount("");
    setDeductAmount("");
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setVerified(false);
    setPin("");
    setCustomer(null);
    setSearchQuery("");
    setLocationName("");
    setLocationId(null);
  };

  // ─── PIN Login Screen ───
  if (!verified) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <Card className="border-border bg-card">
            <CardContent className="pt-8 pb-6 px-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h1 className="font-display text-3xl tracking-wide">Staff Login</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Enter your location PIN to access the staff panel
                </p>
              </div>
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

  // ─── Main Staff Panel (single-screen) ───
  return (
    <div className="min-h-screen bg-secondary text-foreground pb-safe-bottom">
      {/* Compact Header */}
      <div className="bg-card border-b border-border px-4 py-2 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="font-display text-base tracking-wide">{locationName}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            Staff
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 px-2">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      <div className="max-w-lg mx-auto p-3 space-y-3">
        {/* Search Bar — always visible */}
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

            {/* Recent Customers — show when no customer is loaded */}
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

        {/* Customer Card + Actions — single unified view */}
        <AnimatePresence>
          {customer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {/* Customer Info + Quick Actions */}
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

                  {/* ─── Record Visit (primary action, prominent) ─── */}
                  <Button
                    onClick={addPunch}
                    disabled={actionLoading}
                    className="w-full h-12 text-base font-display tracking-wide"
                  >
                    <Stamp className="w-5 h-5 mr-2" />
                    Record Visit (+50 XP)
                  </Button>

                  {/* Punch card visual */}
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-5 h-5 rounded-full border-2 ${
                          i < customer.punches
                            ? "bg-primary border-primary"
                            : "border-border"
                        }`}
                      />
                    ))}
                  </div>
                  {customer.completedCards > 0 && (
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      {customer.completedCards} card(s) completed
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Prepaid & Points — collapsed into tabs-like sections */}
              <div className="grid grid-cols-1 gap-3">
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

                    {/* Deduct */}
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

                    {/* Load */}
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

                {/* Points */}
                <Card>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Gift className="w-4 h-4 text-warm-gold" />
                      <span className="text-sm font-semibold">Points</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {customer.points} available
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={pointsAmount}
                        onChange={(e) => setPointsAmount(e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        placeholder="Note (optional)"
                        value={pointsDesc}
                        onChange={(e) => setPointsDesc(e.target.value)}
                        className="flex-1 h-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => addPoints("earn")}
                        disabled={actionLoading}
                        className="flex-1 h-10"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Award
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addPoints("redeem")}
                        disabled={actionLoading}
                        className="flex-1 h-10"
                      >
                        <Minus className="w-3 h-3 mr-1" /> Redeem
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StaffPanel;
