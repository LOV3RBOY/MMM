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

    // SQL to fix all Supabase components
    const sql = `
      -- 1. Fix users table structure
      DO $BODY$
      BEGIN
        -- Add missing columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_admin') THEN
          ALTER TABLE public.users ADD COLUMN is_admin BOOLEAN DEFAULT false;
        END IF;

        -- Ensure token_identifier is nullable (for compatibility)
        ALTER TABLE public.users ALTER COLUMN token_identifier DROP NOT NULL;
      END
      $BODY$;

      -- 2. Create storage buckets if they don't exist
      DO $BODY$
      BEGIN
        -- Create model-images bucket
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('model-images', 'model-images', true)
        ON CONFLICT (id) DO NOTHING;

        -- Create model-documents bucket
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('model-documents', 'model-documents', false)
        ON CONFLICT (id) DO NOTHING;
      END
      $BODY$;

      -- 3. Fix user triggers
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger
      LANGUAGE plpgsql
      SECURITY DEFINER
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
      EXCEPTION
        WHEN unique_violation THEN
          -- If there's a conflict, do nothing (user already exists)
          RETURN NEW;
        WHEN others THEN
          -- Log other errors but don't fail the transaction
          RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
          RETURN NEW;
      END;
      $$;

      -- Ensure the trigger is properly set up
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

      -- 4. Fix users table RLS
      ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

      -- Drop existing policies
      DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
      DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
      DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
      DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;
      DROP POLICY IF EXISTS "Public access" ON public.users;

      -- Create updated policies
      CREATE POLICY "Users can view their own profile"
        ON public.users FOR SELECT
        USING (id = auth.uid());

      CREATE POLICY "Users can update their own profile"
        ON public.users FOR UPDATE
        USING (id = auth.uid());

      CREATE POLICY "Admins can view all profiles"
        ON public.users FOR SELECT
        USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = TRUE));

      CREATE POLICY "Admins can update all profiles"
        ON public.users FOR UPDATE
        USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = TRUE));

      -- Create a public access policy for easier testing
      CREATE POLICY "Public access"
        ON public.users FOR SELECT
        USING (true);
    `;

    // Execute the SQL
    const { error } = await supabaseAdmin.rpc("pgSQL", { query: sql });

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Complete Supabase setup successful",
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
