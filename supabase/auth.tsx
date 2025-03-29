import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    isAdmin?: boolean,
  ) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Function to check if a user is an admin
  const checkAdminStatus = async (user: User | null) => {
    if (!user) {
      setIsAdmin(false);
      return false;
    }

    // Check if user has admin role in metadata
    // You can customize this logic based on your admin criteria
    const isUserAdmin = !!user.user_metadata?.is_admin || false;
    setIsAdmin(isUserAdmin);
    return isUserAdmin;
  };

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      await checkAdminStatus(currentUser);
      setLoading(false);
    });

    // Listen for changes on auth state (signed in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      await checkAdminStatus(currentUser);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, fullName, isAdmin = false) => {
    try {
      // First ensure database is properly set up
      try {
        await supabase.functions.invoke("supabase-functions-complete-setup");
      } catch (setupError) {
        console.warn("Setup check failed, continuing with signup", setupError);
      }

      // Log the signup attempt for debugging
      console.log("Attempting signup with:", { email, fullName, isAdmin });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            name: fullName.split(" ")[0], // Add name field
            is_admin: isAdmin ? true : false, // Ensure boolean value for is_admin
          },
        },
      });

      if (error) {
        console.error("Supabase auth.signUp error:", error);
        throw error;
      }

      console.log("Signup successful, user data:", data);

      // The user profile in public.users table will be created automatically by the trigger
      // We don't need to manually create it here anymore

      // As a fallback, try to create the user record directly if needed
      try {
        if (!data.user?.id) {
          console.warn(
            "No user ID returned from signup, skipping fallback creation",
          );
          return data;
        }

        console.log("Attempting fallback user creation with ID:", data.user.id);

        const { error: insertError } = await supabase.from("users").upsert(
          {
            id: data.user.id,
            user_id: data.user.id,
            email: email,
            name: fullName.split(" ")[0],
            full_name: fullName,
            is_admin: isAdmin,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );

        if (insertError) {
          console.warn("Fallback user creation had an error:", insertError);
        } else {
          console.log("Fallback user creation successful");
        }
      } catch (fallbackError) {
        console.warn("Fallback user creation failed:", fallbackError);
      }

      return data;
    } catch (error) {
      console.error("SignUp error:", error);
      throw error;
    }
  };

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Export as a variable reference for better HMR compatibility
const useAuthHook = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { useAuthHook as useAuth };
