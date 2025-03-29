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

    // Get request body
    const { email, password, fullName, isAdmin } = await req.json();

    // Validate inputs
    if (!email || !password || !fullName) {
      throw new Error("Missing required fields: email, password, fullName");
    }

    // Check if user already exists in auth.users
    const { data: existingAuthUsers, error: authQueryError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (authQueryError) throw authQueryError;

    const existingAuthUser = existingAuthUsers.users.find(
      (u) => u.email === email,
    );

    // Check if user already exists in public.users
    const { data: existingPublicUsers, error: publicQueryError } =
      await supabaseAdmin.from("users").select("*").eq("email", email);

    if (publicQueryError) throw publicQueryError;

    // Create a diagnostic report
    const diagnosticReport = {
      userExists: {
        inAuthUsers: !!existingAuthUser,
        inPublicUsers: existingPublicUsers && existingPublicUsers.length > 0,
      },
      authUserDetails: existingAuthUser
        ? {
            id: existingAuthUser.id,
            email: existingAuthUser.email,
            created_at: existingAuthUser.created_at,
            user_metadata: existingAuthUser.user_metadata,
          }
        : null,
      publicUserDetails:
        existingPublicUsers && existingPublicUsers.length > 0
          ? existingPublicUsers[0]
          : null,
      databaseStructure: {},
    };

    // Check database structure
    const { data: tableInfo, error: tableError } = await supabaseAdmin.rpc(
      "pgSQL",
      {
        query: `
          SELECT 
            column_name, 
            data_type, 
            is_nullable 
          FROM 
            information_schema.columns 
          WHERE 
            table_schema = 'public' AND 
            table_name = 'users'
          ORDER BY 
            ordinal_position;
        `,
      },
    );

    if (tableError) throw tableError;
    diagnosticReport.databaseStructure = { usersTable: tableInfo };

    // Check trigger existence
    const { data: triggerInfo, error: triggerError } = await supabaseAdmin.rpc(
      "pgSQL",
      {
        query: `
          SELECT 
            trigger_name, 
            event_manipulation, 
            action_statement 
          FROM 
            information_schema.triggers 
          WHERE 
            event_object_schema = 'auth' AND 
            event_object_table = 'users';
        `,
      },
    );

    if (triggerError) throw triggerError;
    diagnosticReport.databaseStructure.triggers = triggerInfo;

    return new Response(
      JSON.stringify({
        success: true,
        diagnosticReport,
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
