import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../../supabase/auth";
import { MobileNav } from "@/components/ui/mobile-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Home() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
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
            {user && (
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin/models"
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Admin
              </Link>
            )}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {user ? (
                <Button
                  onClick={() => (window.location.href = "/dashboard")}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 h-9 shadow-sm transition-colors"
                >
                  Dashboard
                </Button>
              ) : (
                <Button
                  onClick={() => (window.location.href = "/login")}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 h-9 shadow-sm transition-colors"
                >
                  Sign In
                </Button>
              )}
            </div>
          </nav>

          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Professional Model Management Platform
              </h1>
              <p className="text-xl text-gray-600">
                Streamline your modeling agency operations with our
                comprehensive management solution.
              </p>
              <div className="flex flex-wrap gap-4">
                {user ? (
                  <Button
                    onClick={() => (window.location.href = "/dashboard")}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-8 h-12 shadow-md transition-colors text-base"
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => (window.location.href = "/login")}
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-8 h-12 shadow-md transition-colors text-base"
                    >
                      Get Started
                    </Button>
                    <Button
                      onClick={() => (window.location.href = "/signup")}
                      variant="outline"
                      className="rounded-full px-8 h-12 shadow-sm transition-colors text-base"
                    >
                      Create Account
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80"
                  alt="Dashboard Preview"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features for Model Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage your modeling agency efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Model Profiles",
                description:
                  "Comprehensive profiles with all essential model information and statistics.",
                icon: "👤",
              },
              {
                title: "Booking Management",
                description:
                  "Streamlined booking process with calendar integration and status tracking.",
                icon: "📅",
              },
              {
                title: "Client Portal",
                description:
                  "Dedicated portal for clients to browse and book models for their projects.",
                icon: "🤝",
              },
              {
                title: "Analytics Dashboard",
                description:
                  "Detailed insights and reports on bookings, revenue, and model performance.",
                icon: "📊",
              },
              {
                title: "Document Management",
                description:
                  "Secure storage for contracts, releases, and other important documents.",
                icon: "📄",
              },
              {
                title: "Mobile Responsive",
                description:
                  "Access your agency dashboard from any device, anywhere, anytime.",
                icon: "📱",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-[1200px] mx-auto bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to transform your modeling agency?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of agencies already using our platform to streamline
            their operations.
          </p>
          <Button
            onClick={() =>
              (window.location.href = user ? "/dashboard" : "/signup")
            }
            className="bg-white text-blue-600 hover:bg-gray-100 rounded-full px-8 h-12 shadow-md transition-colors text-base"
          >
            {user ? "Go to Dashboard" : "Get Started for Free"}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Model Management</h3>
              <p className="text-gray-400">
                Professional platform for modeling agencies to manage their
                talent and bookings.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    API
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Contact</h4>
              <ul className="space-y-2">
                <li className="text-gray-400">
                  Email: info@modelmanagement.com
                </li>
                <li className="text-gray-400">Phone: +1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              © {new Date().getFullYear()} Model Management. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
