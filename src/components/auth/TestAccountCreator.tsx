import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../../supabase/supabase";
import { useNavigate } from "react-router-dom";

export default function TestAccountCreator() {
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const createTestAccount = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-test-account-creation",
      );

      if (error) throw error;

      setCredentials({
        email: data.credentials.email,
        password: data.credentials.password,
      });

      toast({
        title: "Test Account Created",
        description: `Email: ${data.credentials.email}\nPassword: ${data.credentials.password}`,
      });
    } catch (error: any) {
      console.error("Error creating test account:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create test account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithTestAccount = async () => {
    if (!credentials) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      toast({
        title: "Login Successful",
        description: "You are now logged in with the test account",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error logging in with test account:", error);
      toast({
        title: "Login Error",
        description: error.message || "Failed to login with test account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-sm border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-center">
          Test Account Creator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 text-center">
          This tool creates a test account with admin privileges and
          automatically confirms the email.
        </p>

        {credentials ? (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-medium text-blue-800 mb-2">
              Test Account Credentials
            </h3>
            <p className="text-sm mb-1">
              <span className="font-medium">Email:</span> {credentials.email}
            </p>
            <p className="text-sm">
              <span className="font-medium">Password:</span>{" "}
              {credentials.password}
            </p>
          </div>
        ) : null}

        <div className="flex flex-col gap-3">
          <Button
            onClick={createTestAccount}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Creating Account...
              </>
            ) : (
              "Create Test Account"
            )}
          </Button>

          {credentials && (
            <Button
              onClick={loginWithTestAccount}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Logging in...
                </>
              ) : (
                "Login with Test Account"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
