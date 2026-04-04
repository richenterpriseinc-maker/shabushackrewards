import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { User, CalendarIcon, MapPin, Save, ArrowLeft, Loader2 } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [dob, setDob] = useState<Date | undefined>();
  const [favoriteLocationId, setFavoriteLocationId] = useState<string>("");

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/login");
    });
  }, [navigate]);

  useEffect(() => {
    if (profileQuery.data) {
      setName(profileQuery.data.name || "");
      setDob(profileQuery.data.date_of_birth ? new Date(profileQuery.data.date_of_birth + "T00:00:00") : undefined);
      setFavoriteLocationId(profileQuery.data.favorite_location_id || "");
    }
  }, [profileQuery.data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const updates: Record<string, unknown> = {
        name: name.trim() || null,
        date_of_birth: dob ? format(dob, "yyyy-MM-dd") : null,
        favorite_location_id: favoriteLocationId || null,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (profileQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            className="mb-4 gap-2 text-muted-foreground"
            onClick={() => navigate("/rewards")}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Rewards
          </Button>

          <Card className="border-primary/20">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="font-display text-2xl tracking-wide">My Profile</CardTitle>
              <p className="text-muted-foreground text-sm">
                Update your info to personalize your rewards experience.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" /> Name
                </label>
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  className="h-12"
                />
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" /> Birthday
                </label>
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
                <p className="text-xs text-muted-foreground">
                  Used for your birthday spin reward 🎂
                </p>
              </div>

              {/* Favorite Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" /> Favorite Location
                </label>
                <Select value={favoriteLocationId} onValueChange={setFavoriteLocationId}>
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
              </div>

              {/* Save */}
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full h-12 text-base gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
