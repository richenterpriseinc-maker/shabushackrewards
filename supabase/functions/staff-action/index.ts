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
          // Try exact phone match first
          const { data: byPhone } = await supabase
            .from("profiles")
            .select("*")
            .eq("phone", query)
            .maybeSingle();
          if (byPhone) {
            profileData = byPhone;
          } else if (/^\d{4}$/.test(query)) {
            const { data: byPartial } = await supabase
              .from("profiles")
              .select("*")
              .like("phone", `%${query}`)
              .limit(1)
              .maybeSingle();
            profileData = byPartial;
          } else {
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
        const [punchRes, prepaidRes, streakRes] = await Promise.all([
          supabase.from("punch_cards").select("*").eq("user_id", userId).maybeSingle(),
          supabase.from("prepaid_balances").select("*").eq("user_id", userId).maybeSingle(),
          supabase.from("user_streaks").select("*").eq("user_id", userId).maybeSingle(),
        ]);

        return new Response(
          JSON.stringify({
            customer: {
              userId,
              name: profileData.name,
              phone: profileData.phone,
              tier: profileData.membership_tier,
              currentTier: profileData.current_tier,
              xpTotal: profileData.xp_total,
              points: punchRes.data?.punches_count ?? 0,
              freeEntrees: punchRes.data?.completed_cards ?? 0,
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

      case "add_point": {
        const { userId, points, freeEntrees } = params;
        let newPoints = points + 1;
        let newFreeEntrees = freeEntrees;
        if (newPoints >= 10) {
          newFreeEntrees += 1;
          newPoints = 0;
        }

        await supabase
          .from("punch_cards")
          .update({
            punches_count: newPoints,
            completed_cards: newFreeEntrees,
            last_punch_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        let visitId: string | null = null;
        if (locationId) {
          const { data: visitData } = await supabase.from("visits").insert({
            user_id: userId,
            location_id: locationId,
            amount_spent: 0,
            points_earned: 1,
          }).select("id").single();
          visitId = visitData?.id ?? null;
        }

        // Record in points_transactions
        await supabase.from("points_transactions").insert({
          user_id: userId,
          type: "earn",
          amount: 1,
          description: `Visit at ${locationName || "Shabu Shack"}`,
          related_visit_id: visitId,
        });

        // 🔔 Notification: Free entrée earned
        if (newPoints === 0) {
          await supabase.from("notifications").insert({
            user_id: userId,
            title: "🎉 Free Entrée Earned!",
            message: `You've earned 500 XP and unlocked a free entrée! Redeem it at any location.`,
            type: "milestone",
            link: "/rewards",
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

            // 🔔 Notification: Streak milestones
            if (newStreak === 2) {
              await supabase.from("notifications").insert({
                user_id: userId,
                title: "🔥 2-Week Streak!",
                message: "You're on fire! Keep visiting weekly to boost your XP multiplier.",
                type: "milestone",
                link: "/rewards",
              });
            } else if (newStreak === 4) {
              await supabase.from("notifications").insert({
                user_id: userId,
                title: "🔥🔥 4-Week Streak — 2x XP!",
                message: "Your XP multiplier just doubled! Keep the streak alive.",
                type: "milestone",
                link: "/rewards",
              });
            } else if (newStreak === 8) {
              await supabase.from("notifications").insert({
                user_id: userId,
                title: "🔥🔥🔥 8-Week Streak — 3x XP!",
                message: "Legendary! You're earning triple XP on every visit.",
                type: "milestone",
                link: "/rewards",
              });
            }
          }
        } else {
          await supabase.from("user_streaks").insert({
            user_id: userId,
            current_streak: 1,
            best_streak: 1,
            last_visit_week: weekKey,
            multiplier: 1,
          });
        }

        // Award XP (base 50 per visit)
        const { data: streakData } = await supabase
          .from("user_streaks")
          .select("multiplier")
          .eq("user_id", userId)
          .maybeSingle();
        
        const xpEarned = Math.round(50 * (streakData?.multiplier || 1));
        const { data: prof } = await supabase
          .from("profiles")
          .select("xp_total, current_tier")
          .eq("user_id", userId)
          .maybeSingle();
        if (prof) {
          const oldTier = prof.current_tier;
          const newXp = (prof.xp_total || 0) + xpEarned;
          const newTier = newXp >= 4000 ? "diamond" : newXp >= 1500 ? "gold" : newXp >= 500 ? "silver" : "bronze";
          await supabase
            .from("profiles")
            .update({ xp_total: newXp, current_tier: newTier })
            .eq("user_id", userId);

          // 🔔 Notification: Tier upgrade
          if (newTier !== oldTier) {
            const tierNames: Record<string, string> = { silver: "Silver", gold: "Gold", diamond: "Diamond" };
            const tierEmoji: Record<string, string> = { silver: "🥈", gold: "🥇", diamond: "💎" };
            await supabase.from("notifications").insert({
              user_id: userId,
              title: `${tierEmoji[newTier] || "🏆"} ${tierNames[newTier] || newTier} Tier Reached!`,
              message: `Congratulations! You've leveled up to ${tierNames[newTier] || newTier}. Check out your new perks!`,
              type: "milestone",
              link: "/rewards",
            });
          }
        }

        // Update challenge progress for visit-type challenges
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const { data: challenges } = await supabase
          .from("challenges")
          .select("id, goal_type, goal_value, xp_reward, title")
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

                // 🔔 Notification: Challenge completed
                if (completed) {
                  await supabase.from("notifications").insert({
                    user_id: userId,
                    title: "🏅 Challenge Complete!",
                    message: `You finished "${challenge.title}" and earned ${challenge.xp_reward} XP!`,
                    type: "milestone",
                    link: "/rewards",
                  });
                }
              } else {
                const firstComplete = 1 >= challenge.goal_value;
                await supabase.from("challenge_progress").insert({
                  user_id: userId,
                  challenge_id: challenge.id,
                  current_value: 1,
                  ...(firstComplete ? { completed_at: new Date().toISOString() } : {}),
                });
                if (firstComplete) {
                  await supabase.from("notifications").insert({
                    user_id: userId,
                    title: "🏅 Challenge Complete!",
                    message: `You finished "${challenge.title}" and earned ${challenge.xp_reward} XP!`,
                    type: "milestone",
                    link: "/rewards",
                  });
                }
              }
            }
          }
        }

        const multiplier = streakData?.multiplier || 1;
        return new Response(
          JSON.stringify({
            points: newPoints,
            freeEntrees: newFreeEntrees,
            xpEarned,
            baseXp: 50,
            streakMultiplier: multiplier,
            message: newPoints === 0 ? "🎉 500 XP reached! Free entrée earned!" : `Visit added (${newPoints * 50}/500 XP)`,
          }),
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

        await supabase.from("prepaid_transactions").insert({
          user_id: userId,
          location_id: locationId,
          type: "load",
          amount,
          bonus_amount: bonus,
        });

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

        await supabase.from("prepaid_transactions").insert({
          user_id: userId,
          location_id: locationId,
          type: "deduct",
          amount,
          bonus_amount: 0,
        });

        return new Response(
          JSON.stringify({ balance: newBalance, bonusCredits: newBonus }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "redeem_reward": {
        const { userId } = params;

        // Get current punch card
        const { data: pc } = await supabase
          .from("punch_cards")
          .select("completed_cards")
          .eq("user_id", userId)
          .maybeSingle();

        if (!pc || pc.completed_cards < 1) {
          return new Response(JSON.stringify({ error: "No free entrées to redeem" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Decrement completed_cards
        await supabase
          .from("punch_cards")
          .update({ completed_cards: pc.completed_cards - 1 })
          .eq("user_id", userId);

        // Record the redemption
        await supabase.from("reward_redemptions").insert({
          user_id: userId,
          location_id: locationId,
        });

        return new Response(
          JSON.stringify({
            freeEntrees: pc.completed_cards - 1,
            message: "Free entrée redeemed!",
          }),
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
