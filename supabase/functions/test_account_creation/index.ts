import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Admin key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Create a test user with admin privileges
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = "Password123!";
    const testName = "Test User";

    // Create user directly with admin API
    const { data: authUser, error: createUserError } =
      await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: {
          full_name: testName,
          name: testName.split(" ")[0],
          is_admin: true,
        },
      });

    if (createUserError) throw createUserError;

    // Manually create user in public.users table
    if (authUser?.user) {
      const { error: insertError } = await supabaseAdmin.from("users").upsert({
        id: authUser.user.id,
        user_id: authUser.user.id,
        email: testEmail,
        name: testName.split(" ")[0],
        full_name: testName,
        is_admin: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error(
          "Error inserting user into public.users table:",
          insertError,
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Test account created successfully",
        credentials: {
          email: testEmail,
          password: testPassword,
        },
        user: authUser?.user,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
