import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SpinWheel, { type WheelSlice } from "@/components/SpinWheel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, PartyPopper, Cake, Lock, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const WHITELISTED_EMAILS = [
  "ssdavisca@gmail.com",
];

const LOCATION_PINS: Record<string, string> = {
  "Elk Grove": "8888",
  "South San Francisco": "7777",
  "Downtown Sacramento": "6666",
  Davis: "5555",
};

const WHEEL_SLICES: WheelSlice[] = [
  { label: "FREE Drink", color: "hsl(0, 78%, 45%)" },
  { label: "500 XP", color: "hsl(0, 0%, 14%)" },
  { label: "20% Off", color: "hsl(38, 80%, 55%)", textColor: "#1a1a1a" },
  { label: "FREE Appetizer", color: "hsl(0, 78%, 38%)" },
  { label: "1000 XP", color: "hsl(0, 0%, 22%)" },
  { label: "10% Off", color: "hsl(25, 60%, 52%)" },
  { label: "FREE Meal!", color: "hsl(0, 78%, 45%)" },
  { label: "250 XP", color: "hsl(0, 0%, 14%)" },
  { label: "50% Off!", color: "hsl(38, 80%, 55%)", textColor: "#1a1a1a" },
  { label: "Double XP", color: "hsl(0, 78%, 38%)" },
];

const BirthdayWheel: React.FC = () => {
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [verified, setVerified] = useState(false);
  const [verifiedLocation, setVerifiedLocation] = useState("");
  const [email, setEmail] = useState("");
  const [verifyMethod, setVerifyMethod] = useState<"pin" | "email" | null>(null);
  const [result, setResult] = useState<WheelSlice | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const geoRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "granted" | "denied">("idle");

  // Request geolocation on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          geoRef.current = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setGeoStatus("granted");
        },
        () => setGeoStatus("denied"),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = pin.trim();
    const match = Object.entries(LOCATION_PINS).find(([, p]) => p === trimmed);
    if (match) {
      setVerified(true);
      setVerifiedLocation(match[0]);
      setPinError("");
    } else {
      setPinError("Invalid PIN. Ask your server for today's code!");
    }
  };

  const handleEmailVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (WHITELISTED_EMAILS.includes(trimmedEmail)) {
      setVerified(true);
      setVerifiedLocation("VIP Guest");
      setPinError("");
    } else {
      setPinError("This email is not on the birthday list.");
    }
  };

  const handleResult = async (slice: WheelSlice) => {
    setResult(slice);
    setHasSpun(true);

    // Save spin with geolocation to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const geo = geoRef.current;
        await supabase.from("birthday_spins").insert({
          user_id: user.id,
          prize_type: slice.label.includes("XP") ? "xp" : slice.label.includes("Off") ? "discount" : "free_item",
          prize_value: slice.label,
          latitude: geo?.latitude ?? null,
          longitude: geo?.longitude ?? null,
        } as any);
      }
    } catch (err) {
      console.error("Failed to save spin:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container max-w-lg mx-auto px-4 text-center">
          {/* Header */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <Cake className="w-8 h-8 text-primary" />
            <h1 className="font-display text-4xl sm:text-5xl text-foreground tracking-wide">
              Birthday Spin
            </h1>
            <PartyPopper className="w-8 h-8 text-warm-gold" />
          </div>
          <p className="text-muted-foreground mb-8">
            Happy Birthday! Spin the wheel for an exclusive prize — available in-store only.
          </p>

          <AnimatePresence mode="wait">
            {!verified ? (
              /* ---- PIN GATE ---- */
              <motion.div
                key="pin-gate"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-card border border-border rounded-xl p-8 shadow-lg"
              >
                <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="font-display text-2xl text-foreground mb-2">
                  Verify to Spin
                </h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Enter your location PIN or your registered email to unlock the wheel.
                </p>

                {/* Toggle between PIN and Email */}
                <div className="flex gap-2 justify-center mb-6">
                  <Button
                    type="button"
                    variant={verifyMethod !== "email" ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setVerifyMethod("pin"); setPinError(""); }}
                  >
                    Location PIN
                  </Button>
                  <Button
                    type="button"
                    variant={verifyMethod === "email" ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setVerifyMethod("email"); setPinError(""); }}
                  >
                    Email
                  </Button>
                </div>

                {verifyMethod === "email" ? (
                  <form onSubmit={handleEmailVerify} className="flex flex-col gap-4 max-w-xs mx-auto">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setPinError(""); }}
                      className="text-center"
                    />
                    {pinError && <p className="text-destructive text-sm">{pinError}</p>}
                    <Button type="submit" disabled={!email.includes("@")} className="font-display text-lg tracking-wider">
                      Verify Email
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerify} className="flex flex-col gap-4 max-w-xs mx-auto">
                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="Enter 4-digit PIN"
                      value={pin}
                      onChange={(e) => {
                        setPin(e.target.value.replace(/\D/g, "").slice(0, 4));
                        setPinError("");
                      }}
                      className="text-center text-2xl tracking-[0.5em] font-mono"
                    />
                    {pinError && <p className="text-destructive text-sm">{pinError}</p>}
                    <Button type="submit" disabled={pin.length < 4} className="font-display text-lg tracking-wider">
                      Unlock Wheel
                    </Button>
                  </form>
                )}
              </motion.div>
            ) : (
              /* ---- WHEEL ---- */
              <motion.div
                key="wheel"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6"
              >
                <p className="text-sm text-muted-foreground">
                  📍 Verified at <span className="font-semibold text-foreground">{verifiedLocation}</span>
                </p>
                {geoStatus === "granted" && geoRef.current && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Location tracked ({geoRef.current.latitude.toFixed(4)}, {geoRef.current.longitude.toFixed(4)})
                  </p>
                )}
                {geoStatus === "denied" && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Location access denied — spin won't be geo-tagged
                  </p>
                )}

                <SpinWheel
                  slices={WHEEL_SLICES}
                  onResult={handleResult}
                  disabled={hasSpun}
                />

                {/* Result overlay */}
                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-card border-2 border-warm-gold rounded-xl p-6 shadow-xl w-full"
                    >
                      <Gift className="w-10 h-10 text-warm-gold mx-auto mb-2" />
                      <h3 className="font-display text-3xl text-foreground mb-1">
                        You Won!
                      </h3>
                      <p className="text-2xl font-bold text-primary">{result.label}</p>
                      <p className="text-muted-foreground text-sm mt-3">
                        Show this screen to your server to redeem. Happy Birthday! 🎂
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BirthdayWheel;
