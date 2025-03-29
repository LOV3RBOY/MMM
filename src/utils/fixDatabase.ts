import { supabase } from "../../supabase/supabase";

export async function fixDatabasePolicies() {
  try {
    // First try using the edge function
    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-fix-rls-policies",
      );

      if (!error) {
        console.log(
          "Database policies fixed successfully via edge function:",
          data,
        );
        return { success: true, data };
      }
    } catch (edgeFunctionError) {
      console.warn(
        "Edge function approach failed, trying direct SQL:",
        edgeFunctionError,
      );
    }

    // Fallback to direct SQL execution with service role
    const { data, error } = await supabase.rpc("pgSQL", {
      query: `
        -- Fix user creation and optimize RLS policies

        -- First disable RLS to make changes
        ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
        DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
        DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
        DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;
        DROP POLICY IF EXISTS "Public access" ON public.users;
        
        -- Create optimized policies with (SELECT auth.uid()) pattern
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
      `,
    });

    if (error) {
      console.error("Error fixing database policies with direct SQL:", error);
      return { success: false, error };
    }

    console.log("Database policies fixed successfully with direct SQL:", data);
    return { success: true, data };
  } catch (err) {
    console.error("Exception when fixing database policies:", err);
    return { success: false, error: err };
  }
}
