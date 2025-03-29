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

    // SQL to fix user creation
    const sql = `
      -- Fix user schema and trigger function to ensure proper account creation

      -- First, add missing is_admin column if it doesn't exist
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_admin') THEN
          ALTER TABLE public.users ADD COLUMN is_admin BOOLEAN DEFAULT false;
        END IF;
      END
      $$;

      -- Update the handle_new_user function to properly handle all fields
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger
      LANGUAGE plpgsql
      SECURITY INVOKER
      SET search_path = ''
      AS $$
      BEGIN
        INSERT INTO public.users (
          id,
          user_id,
          email,
          name,
          full_name,
          avatar_url,
          token_identifier,
          is_admin,
          created_at,
          updated_at
        ) VALUES (
          NEW.id,
          NEW.id::text,
          NEW.email,
          NEW.raw_user_meta_data->>'name',
          NEW.raw_user_meta_data->>'full_name',
          NEW.raw_user_meta_data->>'avatar_url',
          NEW.email,
          COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false),
          NEW.created_at,
          NEW.updated_at
        );
        RETURN NEW;
      END;
      $$;

      -- Ensure the trigger is properly set up
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `;

    // Execute the SQL
    const { error } = await supabaseAdmin.rpc("pgSQL", { query: sql });

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        message: "User creation fixed successfully",
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
