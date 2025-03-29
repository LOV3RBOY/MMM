import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const TopNavigation = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
      <div className="container mx-auto h-full flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center">
              <span className="text-white font-semibold">M</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
              ModelAgency
            </h1>
          </div>
        </div>

        <div
          className={`${isSearchOpen ? "flex absolute left-0 right-0 top-0 bg-white/95 h-16 px-4 md:px-6 items-center" : "hidden md:flex"} md:relative md:w-96 md:bg-transparent`}
        >
          {isSearchOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 md:hidden"
              onClick={() => setIsSearchOpen(false)}
            >
              <X size={20} />
            </Button>
          )}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search models, bookings..."
              className="w-full pl-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search size={20} />
          </Button>

          <Button variant="ghost" size="icon" className="relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></span>
          </Button>

          <Avatar className="h-9 w-9 border border-gray-200">
            <AvatarImage
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
              alt="User"
            />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;
