import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, MapPin, ChevronRight, Check, Loader2, PartyPopper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface OnboardingBannerProps {
  profile: {
    user_id: string;
    date_of_birth: string | null;
    favorite_location_id: string | null;
  };
}

const OnboardingBanner = ({ profile }: OnboardingBannerProps) => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"birthday" | "location" | "done">(
    !profile.date_of_birth ? "birthday" : !profile.favorite_location_id ? "location" : "done"
  );
  const [dob, setDob] = useState<Date | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [locationId, setLocationId] = useState("");
  const [saving, setSaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const locationsQuery = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("id, name, city")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Don't show if both are filled or user dismissed
  if (dismissed || (profile.date_of_birth && profile.favorite_location_id)) {
    return null;
  }

  const handleSaveBirthday = async () => {
    if (!dob) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ date_of_birth: format(dob, "yyyy-MM-dd") })
        .eq("user_id", profile.user_id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["gamification-profile"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Birthday saved! 🎂");
      if (!profile.favorite_location_id) {
        setStep("location");
      } else {
        setStep("done");
      }
    } catch {
      toast.error("Failed to save birthday");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!locationId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ favorite_location_id: locationId })
        .eq("user_id", profile.user_id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["gamification-profile"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Favorite location saved! 📍");
      setStep("done");
    } catch {
      toast.error("Failed to save location");
    } finally {
      setSaving(false);
    }
  };

  if (step === "done") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, height: 0 }}
        className="mb-6"
      >
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4 text-center">
            <PartyPopper className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="font-display text-lg font-bold text-foreground tracking-wide">YOU'RE ALL SET!</p>
            <p className="text-sm text-muted-foreground">Your profile is complete. Enjoy your rewards!</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const stepNumber = step === "birthday" ? 1 : 2;
  const totalSteps = (!profile.date_of_birth && !profile.favorite_location_id) ? 2 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="border-primary/30 overflow-hidden">
        <div className="bg-primary px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary-foreground">
              COMPLETE YOUR PROFILE
            </span>
            {totalSteps > 1 && (
              <span className="text-[10px] text-primary-foreground/70">
                Step {stepNumber} of {totalSteps}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 h-6 text-[10px] px-2"
            onClick={() => setDismissed(true)}
          >
            Skip
          </Button>
        </div>

        <CardContent className="py-4">
          <AnimatePresence mode="wait">
            {step === "birthday" && (
              <motion.div
                key="birthday"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-bold text-foreground">When's your birthday?</p>
                    <p className="text-xs text-muted-foreground">We'll give you a free birthday spin! 🎉</p>
                  </div>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal",
                        !dob && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dob ? format(dob, "MMMM d, yyyy") : "Select your birthday"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dob}
                      onSelect={setDob}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1920-01-01")
                      }
                      initialFocus
                      captionLayout="dropdown-buttons"
                      fromYear={1920}
                      toYear={new Date().getFullYear()}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  onClick={handleSaveBirthday}
                  disabled={!dob || saving}
                  className="w-full h-10 gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                  {saving ? "Saving..." : "Continue"}
                </Button>
              </motion.div>
            )}

            {step === "location" && (
              <motion.div
                key="location"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Pick your favorite location</p>
                    <p className="text-xs text-muted-foreground">We'll personalize your deals & rewards 📍</p>
                  </div>
                </div>
                <Select value={locationId} onValueChange={setLocationId}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Choose your go-to spot" />
                  </SelectTrigger>
                  <SelectContent>
                    {(locationsQuery.data || []).map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name} — {loc.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleSaveLocation}
                  disabled={!locationId || saving}
                  className="w-full h-10 gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {saving ? "Saving..." : "Done!"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OnboardingBanner;
