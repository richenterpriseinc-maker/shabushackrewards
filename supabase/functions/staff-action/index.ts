import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { action, pin, ...params } = body;

    // Verify PIN against locations table
    const { data: location } = await supabase
      .from("locations")
      .select("id, name, pin_code")
      .eq("pin_code", pin)
      .maybeSingle();

    // Also check hardcoded PINs as fallback
    const LOCATION_PINS: Record<string, string> = {
      "Elk Grove": "8888",
      "South San Francisco": "7777",
      "Downtown Sacramento": "6666",
      Davis: "5555",
    };
    const hardcodedMatch = Object.entries(LOCATION_PINS).find(([_, p]) => p === pin);

    if (!location && !hardcodedMatch) {
      return new Response(JSON.stringify({ error: "Invalid PIN" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const locationId = location?.id || null;
    const locationName = location?.name || hardcodedMatch?.[0] || "";

    // Handle actions
    switch (action) {
      case "search": {
        const { query } = params;
        let profileData: any = null;

        if (query.startsWith("shabu:")) {
          const qrUserId = query.replace("shabu:", "");
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", qrUserId)
            .maybeSingle();
          profileData = data;
        } else {
          // Try phone
          const { data: byPhone } = await supabase
            .from("profiles")
            .select("*")
            .eq("phone", query)
            .maybeSingle();
          if (byPhone) {
            profileData = byPhone;
          } else {
            // Try name
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
          return new Response(JSON.stringify({ error: "No customer found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const userId = profileData.user_id;
        const [punchRes, pointsRes, prepaidRes, streakRes] = await Promise.all([
          supabase.from("punch_cards").select("*").eq("user_id", userId).maybeSingle(),
          supabase.from("points_transactions").select("type, amount").eq("user_id", userId),
          supabase.from("prepaid_balances").select("*").eq("user_id", userId).maybeSingle(),
          supabase.from("user_streaks").select("*").eq("user_id", userId).maybeSingle(),
        ]);

        const totalPoints = (pointsRes.data || []).reduce((sum: number, t: any) => {
          return sum + (t.type === "earn" ? t.amount : -t.amount);
        }, 0);

        return new Response(
          JSON.stringify({
            customer: {
              userId,
              name: profileData.name,
              phone: profileData.phone,
              tier: profileData.membership_tier,
              currentTier: profileData.current_tier,
              xpTotal: profileData.xp_total,
              punches: punchRes.data?.punches_count ?? 0,
              completedCards: punchRes.data?.completed_cards ?? 0,
              points: Math.max(0, totalPoints),
              prepaidBalance: Number(prepaidRes.data?.balance ?? 0),
              bonusCredits: Number(prepaidRes.data?.bonus_credits ?? 0),
              streak: streakRes.data?.current_streak ?? 0,
            },
            locationId,
            locationName,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "add_punch": {
        const { userId, punches, completedCards } = params;
        let newPunches = punches + 1;
        let newCompleted = completedCards;
        if (newPunches >= 10) {
          newCompleted += 1;
          newPunches = 0;
        }

        await supabase
          .from("punch_cards")
          .update({
            punches_count: newPunches,
            completed_cards: newCompleted,
            last_punch_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (locationId) {
          await supabase.from("visits").insert({
            user_id: userId,
            location_id: locationId,
            amount_spent: 0,
            points_earned: 0,
          });
        }

        // Update streak
        const now = new Date();
        const weekKey = `${now.getFullYear()}-W${String(Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 604800000)).padStart(2, "0")}`;
        
        const { data: streak } = await supabase
          .from("user_streaks")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (streak) {
          if (streak.last_visit_week !== weekKey) {
            const lastWeekNum = streak.last_visit_week ? parseInt(streak.last_visit_week.split("-W")[1]) : 0;
            const currentWeekNum = parseInt(weekKey.split("-W")[1]);
            const isConsecutive = currentWeekNum - lastWeekNum === 1;
            
            const newStreak = isConsecutive ? streak.current_streak + 1 : 1;
            const multiplier = newStreak >= 8 ? 3 : newStreak >= 4 ? 2 : newStreak >= 2 ? 1.5 : 1;
            
            await supabase
              .from("user_streaks")
              .update({
                current_streak: newStreak,
                best_streak: Math.max(streak.best_streak, newStreak),
                last_visit_week: weekKey,
                multiplier,
              })
              .eq("user_id", userId);
          }
        }

        // Award XP (base 50 per visit)
        const { data: streakData } = await supabase
          .from("user_streaks")
          .select("multiplier")
          .eq("user_id", userId)
          .maybeSingle();
        
        const xpEarned = Math.round(50 * (streakData?.multiplier || 1));
        await supabase.rpc("increment_xp", { _user_id: userId, _amount: xpEarned }).catch(() => {
          // Fallback: direct update
          supabase
            .from("profiles")
            .select("xp_total")
            .eq("user_id", userId)
            .maybeSingle()
            .then(({ data: prof }) => {
              if (prof) {
                const newXp = (prof.xp_total || 0) + xpEarned;
                const newTier = newXp >= 4000 ? "diamond" : newXp >= 1500 ? "gold" : newXp >= 500 ? "silver" : "bronze";
                supabase
                  .from("profiles")
                  .update({ xp_total: newXp, current_tier: newTier })
                  .eq("user_id", userId)
                  .then(() => {});
              }
            });
        });

        // Update challenge progress for visit-type challenges
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const { data: challenges } = await supabase
          .from("challenges")
          .select("id, goal_type, goal_value, xp_reward")
          .eq("is_active", true)
          .eq("month", currentMonth)
          .eq("year", currentYear);

        if (challenges) {
          for (const challenge of challenges) {
            if (challenge.goal_type === "visits") {
              const { data: progress } = await supabase
                .from("challenge_progress")
                .select("*")
                .eq("user_id", userId)
                .eq("challenge_id", challenge.id)
                .maybeSingle();

              if (progress) {
                const newVal = progress.current_value + 1;
                const completed = newVal >= challenge.goal_value && !progress.completed_at;
                await supabase
                  .from("challenge_progress")
                  .update({
                    current_value: newVal,
                    ...(completed ? { completed_at: new Date().toISOString() } : {}),
                  })
                  .eq("id", progress.id);
              } else {
                await supabase.from("challenge_progress").insert({
                  user_id: userId,
                  challenge_id: challenge.id,
                  current_value: 1,
                  ...(1 >= challenge.goal_value ? { completed_at: new Date().toISOString() } : {}),
                });
              }
            }
          }
        }

        return new Response(
          JSON.stringify({
            punches: newPunches,
            completedCards: newCompleted,
            xpEarned,
            message: newPunches === 0 ? "Punch card completed! Free reward earned!" : `Punch added (${newPunches}/10)`,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "add_points": {
        const { userId, amount, type, description } = params;
        await supabase.from("points_transactions").insert({
          user_id: userId,
          amount,
          type,
          description: description || (type === "earn" ? "Staff awarded" : "Staff redeemed"),
        });

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "load_balance": {
        const { userId, amount, currentBalance, currentBonus } = params;
        const bonus = amount >= 100 ? amount * 0.2 : amount >= 50 ? amount * 0.1 : 0;
        await supabase
          .from("prepaid_balances")
          .update({
            balance: currentBalance + amount,
            bonus_credits: currentBonus + bonus,
            last_load_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        return new Response(
          JSON.stringify({
            balance: currentBalance + amount,
            bonusCredits: currentBonus + bonus,
            bonusAdded: bonus,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "deduct_balance": {
        const { userId, amount, currentBalance, currentBonus } = params;
        let remaining = amount;
        let newBonus = currentBonus;
        let newBalance = currentBalance;

        if (newBonus > 0) {
          const bonusDeduct = Math.min(remaining, newBonus);
          newBonus -= bonusDeduct;
          remaining -= bonusDeduct;
        }
        newBalance -= remaining;

        await supabase
          .from("prepaid_balances")
          .update({ balance: newBalance, bonus_credits: newBonus })
          .eq("user_id", userId);

        return new Response(
          JSON.stringify({ balance: newBalance, bonusCredits: newBonus }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
