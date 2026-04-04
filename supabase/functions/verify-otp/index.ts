import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone, code } = await req.json();
    if (!phone || !code) {
      return new Response(
        JSON.stringify({ error: "Phone and code are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Look up OTP
    const { data: otpRecord, error: otpError } = await supabaseAdmin
      .from("phone_otps")
      .select("*")
      .eq("phone", phone)
      .eq("code", code)
      .gte("expires_at", new Date().toISOString())
      .maybeSingle();

    if (otpError || !otpRecord) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete used OTP
    await supabaseAdmin.from("phone_otps").delete().eq("id", otpRecord.id);

    // Check if user exists by phone
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.phone === phone);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user with phone
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        phone,
        phone_confirm: true,
      });
      if (createError || !newUser?.user) {
        console.error("Create user error:", createError);
        return new Response(
          JSON.stringify({ error: "Failed to create account" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      userId = newUser.user.id;
    }

    // Generate a session token for the user
    const { data: session, error: sessionError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: `${phone.replace(/\+/g, "")}@phone.shabu.local`,
      });

    // Use signInWithPassword workaround - create a temp password and sign in
    const tempPassword = crypto.randomUUID();
    await supabaseAdmin.auth.admin.updateUser(userId, { password: tempPassword });

    // Now sign in with the temp password to get a proper session
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!
    );

    // Use admin to generate link won't work for session, let's use a different approach
    // Sign in directly and return the session
    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      phone,
      password: tempPassword,
    });

    // Clean up - remove the temp password
    await supabaseAdmin.auth.admin.updateUser(userId, { password: undefined });

    if (signInError || !signInData?.session) {
      console.error("Sign in error:", signInError);
      return new Response(
        JSON.stringify({ error: "Failed to create session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        access_token: signInData.session.access_token,
        refresh_token: signInData.session.refresh_token,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("verify-otp error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
