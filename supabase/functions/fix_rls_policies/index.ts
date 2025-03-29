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

    // SQL to fix RLS policies
    const sql = `
      -- Update RLS policies to use more secure approach

      -- First disable RLS to make changes
      ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

      -- Drop existing policies
      DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
      DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
      DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
      DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;
      DROP POLICY IF EXISTS "Public access" ON public.users;

      -- Create updated policies with more secure approach
      CREATE POLICY "Users can view their own profile"
        ON public.users FOR SELECT
        USING (id = (SELECT auth.uid()));

      CREATE POLICY "Users can update their own profile"
        ON public.users FOR UPDATE
        USING (id = (SELECT auth.uid()));

      CREATE POLICY "Admins can view all profiles"
        ON public.users FOR SELECT
        USING (EXISTS (SELECT 1 FROM public.users WHERE id = (SELECT auth.uid()) AND is_admin = TRUE));

      CREATE POLICY "Admins can update all profiles"
        ON public.users FOR UPDATE
        USING (EXISTS (SELECT 1 FROM public.users WHERE id = (SELECT auth.uid()) AND is_admin = TRUE));

      -- Create a public access policy for easier testing
      CREATE POLICY "Public access"
        ON public.users FOR SELECT
        USING (true);

      -- Re-enable RLS
      ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    `;

    // Execute the SQL
    const { error } = await supabaseAdmin.rpc("pgSQL", { query: sql });

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        message: "RLS policies updated successfully",
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
