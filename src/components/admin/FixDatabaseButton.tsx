import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { fixDatabasePolicies } from "@/utils/fixDatabase";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Database } from "lucide-react";

export default function FixDatabaseButton() {
  const [isFixing, setIsFixing] = useState(false);
  const { toast } = useToast();

  const handleFixDatabase = async () => {
    setIsFixing(true);
    try {
      const result = await fixDatabasePolicies();

      if (result.success) {
        toast({
          title: "Success",
          description: "Database policies have been fixed successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to fix database policies: ${result.error?.message || "Unknown error"}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fixing database:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fixing the database.",
        variant: "destructive",
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Button
      onClick={handleFixDatabase}
      disabled={isFixing}
      className="bg-blue-500 hover:bg-blue-600 text-white"
    >
      {isFixing ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          Fixing Database...
        </>
      ) : (
        <>
          <Database className="h-4 w-4 mr-2" />
          Fix All Supabase Setup
        </>
      )}
    </Button>
  );
}
