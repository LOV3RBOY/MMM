import { ReactNode } from "react";
import { Link } from "react-router-dom";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-black">
      {/* Premium navigation */}
      <header className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-soft">
        <div className="max-w-[1200px] mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center">
            <Link
              to="/"
              className="font-semibold text-xl text-gray-900 hover:text-blue-600 transition-colors duration-200"
            >
              Model Management
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <Link
              to="/"
              className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/models"
              className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="max-w-md w-full px-6">
          <div className="text-center mb-10 animate-fade-in">
            <h2 className="text-4xl font-semibold tracking-tight text-gray-900">
              Model Management
            </h2>
            <p className="text-xl font-medium text-gray-500 mt-3">
              Sign in to access your account
            </p>
          </div>
          <div className="animate-slide-in">{children}</div>
        </div>
      </div>
    </div>
  );
}
