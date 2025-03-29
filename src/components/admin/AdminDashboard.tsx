import React, { useState } from "react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ModelList from "./ModelList";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>("Models");

  const navItems = [
    { icon: <Users size={20} />, label: "Models", isActive: true },
  ];

  const handleAddModel = () => {
    navigate("/admin/models/add");
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <TopNavigation />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        <Sidebar
          items={navItems}
          activeItem="Models"
          onItemClick={setActiveSection}
        />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 pt-4 pb-2 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Model Management
            </h1>
            <Button
              onClick={handleAddModel}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 h-9 shadow-sm transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Model
            </Button>
          </div>
          <div className="container mx-auto p-6 space-y-8">
            {activeSection === "Models" && <ModelList />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
