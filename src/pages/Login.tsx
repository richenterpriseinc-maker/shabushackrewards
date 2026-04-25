import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Lock, ArrowRight, User, Star, Utensils, Gift } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");
  const [showGoogle, setShowGoogle] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard", { replace: true });
    });
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast({
          title: "Sign in failed",
          description: result.error.message || "Could not sign in with Google.",
          variant: "destructive",
        });
        return;
      }
      if (result.redirected) return;
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && !name.trim()) {
      toast({ title: "Missing name", description: "Please enter your name.", variant: "destructive" });
      return;
    }
    if (!email || !password) {
      toast({ title: "Missing fields", description: "Please enter your email and password.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name.trim() },
          },
        });
        if (error) {
          toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Welcome!", description: "Your account has been created." });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
        }
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-mobile-nav md:pb-0">
      <Navbar />
      <main className="container mx-auto px-5 pt-20 pb-10 md:py-12 flex flex-col items-center justify-start md:justify-center md:min-h-[75vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm text-center"
        >
          {/* Header */}
          <div className="mb-5">
            <h1 className="font-display text-[28px] sm:text-3xl font-bold text-foreground tracking-wider mb-2 leading-tight">
              {isSignUp ? "CREATE ACCOUNT" : "WELCOME BACK"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isSignUp ? "Join free. Earn XP. Get free entrées." : "Sign in to check your rewards."}
            </p>
          </div>

          {/* Signup bonus banner */}
          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mb-6 rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-4 text-left shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-0.5">
                    Sign-up Bonus
                  </div>
                  <div className="font-display text-base font-bold text-foreground leading-tight">
                    Buy One Entrée, Get One 50% Off
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Yours instantly when you join — redeem on your next visit.
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Quick perks */}
          <div className="flex justify-center gap-5 sm:gap-6 mb-7 text-xs text-muted-foreground">
            {[
              { icon: Star, label: "Earn XP" },
              { icon: Utensils, label: "Free Entrées" },
              { icon: Gift, label: "Birthday" },
            ].map((p) => (
              <div key={p.label} className="flex flex-col items-center gap-1">
                <p.icon className="w-5 h-5 text-primary" />
                <span>{p.label}</span>
              </div>
            ))}
          </div>

          {/* Sign-up / Sign-in form — primary */}
          <form onSubmit={handleEmailAuth} className="space-y-3 text-left mb-4">
            {isSignUp && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-12"
                  maxLength={100}
                  required
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12"
                minLength={6}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-14 text-base gap-2">
              {loading
                ? isSignUp ? "Creating account..." : "Signing in..."
                : isSignUp ? "Join Now" : "Sign In"}
              <ArrowRight className="w-4 h-4" />
            </Button>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
              </button>
              {!isSignUp && (
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={async () => {
                    if (!email) {
                      toast({ title: "Enter your email", description: "Type your email address above first.", variant: "destructive" });
                      return;
                    }
                    setLoading(true);
                    const { error } = await supabase.auth.resetPasswordForEmail(email, {
                      redirectTo: `${window.location.origin}/reset-password`,
                    });
                    setLoading(false);
                    if (error) {
                      toast({ title: "Error", description: error.message, variant: "destructive" });
                    } else {
                      toast({ title: "Check your email", description: "We sent a password reset link." });
                    }
                  }}
                >
                  Forgot password?
                </button>
              )}
            </div>
          </form>

          {/* Google — secondary */}
          {!showGoogle ? (
            <button
              type="button"
              onClick={() => setShowGoogle(true)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Or continue with Google
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="overflow-hidden"
            >
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full h-14 text-base gap-3"
                variant="outline"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                {loading ? "Signing in..." : "Continue with Google"}
              </Button>
            </motion.div>
          )}
          <p className="text-[10px] text-muted-foreground mt-6">
            By joining, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
