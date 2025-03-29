import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./button";
import { useAuth } from "../../../supabase/auth";
import { Sheet, SheetContent, SheetTrigger } from "./sheet";
import { Menu, X } from "lucide-react";

export function MobileNav() {
  const { user, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between border-b border-gray-100 py-4">
            <Link
              to="/"
              className="font-semibold text-xl text-gray-900"
              onClick={() => setOpen(false)}
            >
              Model Management
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label="Close Menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex flex-col gap-2 py-6">
            <Link
              to="/"
              className="px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setOpen(false)}
            >
              Home
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin/models"
                    className="px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mt-2"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          <div className="mt-auto border-t border-gray-100 pt-6 pb-4">
            <p className="text-sm text-gray-500 px-4">
              © {new Date().getFullYear()} Model Management
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
