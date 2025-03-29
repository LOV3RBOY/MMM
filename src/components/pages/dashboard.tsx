import React, { useState, useEffect } from "react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import DashboardGrid from "../dashboard/DashboardGrid";
import TaskBoard from "../dashboard/TaskBoard";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Function to trigger loading state for demonstration
  const handleRefresh = () => {
    setLoading(true);
    // Reset loading after 2 seconds
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const navItems = [
    {
      icon: <Users size={20} />,
      label: "Models",
      isActive: true,
      href: "/admin/models",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <TopNavigation />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        <Sidebar items={navItems} />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 pt-4 pb-2 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Model Management Dashboard
            </h1>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate("/admin/models")}
                className="bg-gray-800 hover:bg-gray-900 text-white rounded-full px-4 h-9 shadow-sm transition-colors flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Manage Models
              </Button>
              <Button
                onClick={handleRefresh}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 h-9 shadow-sm transition-colors flex items-center gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                {loading ? "Loading..." : "Refresh Dashboard"}
              </Button>
            </div>
          </div>
          <div
            className={cn(
              "container mx-auto p-6 space-y-8",
              "transition-all duration-300 ease-in-out",
            )}
          >
            <DashboardGrid isLoading={loading} />
            <TaskBoard isLoading={loading} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
