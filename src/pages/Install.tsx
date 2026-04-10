import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Share, MoreVertical, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background pb-mobile-nav md:pb-0">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg">
              <img src="/icon-192.png" alt="Shabu Shack" className="w-full h-full object-cover" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-wider mb-2">
              INSTALL THE APP
            </h1>
            <p className="text-muted-foreground text-sm">
              Add Shabu Shack Rewards to your home screen for quick access
            </p>
          </motion.div>

          {isInstalled ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card>
                <CardContent className="py-8 text-center">
                  <Smartphone className="w-12 h-12 mx-auto mb-3 text-primary" />
                  <h2 className="font-display text-lg font-bold text-foreground mb-1">Already Installed!</h2>
                  <p className="text-sm text-muted-foreground">
                    Shabu Shack Rewards is on your home screen. Open it from there for the best experience.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : deferredPrompt ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardContent className="py-6 text-center space-y-4">
                  <Download className="w-10 h-10 mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Tap below to install — it takes just a second!
                  </p>
                  <Button onClick={handleInstall} size="lg" className="w-full h-12 font-display tracking-wider">
                    <Download className="w-5 h-5 mr-2" /> INSTALL APP
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {isIOS ? (
                <Card>
                  <CardContent className="py-6 space-y-4">
                    <h2 className="font-display text-lg font-bold text-foreground text-center">
                      Install on iPhone / iPad
                    </h2>
                    <div className="space-y-3">
                      {[
                        { icon: Share, text: "Tap the Share button in Safari" },
                        { icon: Plus, text: 'Scroll down and tap "Add to Home Screen"' },
                        { icon: Download, text: 'Tap "Add" to confirm' },
                      ].map((step, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <step.icon className="w-4 h-4 text-primary" />
                          </div>
                          <p className="text-sm text-foreground">{step.text}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-6 space-y-4">
                    <h2 className="font-display text-lg font-bold text-foreground text-center">
                      Install on Android
                    </h2>
                    <div className="space-y-3">
                      {[
                        { icon: MoreVertical, text: "Tap the menu (⋮) in Chrome" },
                        { icon: Download, text: 'Tap "Install app" or "Add to Home Screen"' },
                        { icon: Smartphone, text: "Open from your home screen" },
                      ].map((step, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <step.icon className="w-4 h-4 text-primary" />
                          </div>
                          <p className="text-sm text-foreground">{step.text}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              No app store needed — works like a real app right from your browser
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Install;
