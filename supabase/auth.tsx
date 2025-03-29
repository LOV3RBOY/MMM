import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    isAdmin?: boolean,
  ) => Promise<void>;
  signOut: () => Promise<void>;
};

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

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    isAdmin: boolean = false,
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            is_admin: isAdmin ? true : false, // Ensure boolean value for is_admin
          },
        },
      });

      if (error) throw error;

      // Create a user profile in the public.users table
      if (data.user) {
        try {
          const { error: profileError } = await supabase.from("users").insert([
            {
              id: data.user.id,
              full_name: fullName,
              email: email,
              is_admin: isAdmin,
              created_at: new Date().toISOString(),
            },
          ]);

          if (profileError) {
            console.error("Error creating user profile:", profileError);
            // Don't throw here to allow auth signup to complete
            console.warn(
              "User created in auth but profile creation failed. User can still log in.",
            );
          }
        } catch (insertError) {
          console.error("Error inserting user profile:", insertError);
          // Don't throw here - allow auth signup to complete even if profile creation fails
          // The user can still log in, and profile can be created later
        }
      }

      return data;
    } catch (error) {
      console.error("SignUp error:", error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
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

// Fix for Fast Refresh compatibility issue
export const useAuth = /* @__PURE__ */ function useAuthFunction() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
