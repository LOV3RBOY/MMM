import { supabase } from "../../supabase/supabase";

export async function fixDatabasePolicies() {
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-fix-rls-policies",
    );

    if (error) {
      console.error("Error fixing database policies:", error);
      return { success: false, error };
    }

    console.log("Database policies fixed successfully:", data);
    return { success: true, data };
  } catch (err) {
    console.error("Exception when fixing database policies:", err);
    return { success: false, error: err };
  }
}
