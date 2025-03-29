import React from "react";
import { Routes, Route, Navigate, useRoutes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "../supabase/auth";
import { RouteGuard } from "@/components/ui/route-guard";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { NotFound } from "@/components/ui/not-found";

// Pages
import Home from "@/components/pages/home";
import Dashboard from "@/components/pages/dashboard";
import Success from "@/components/pages/success";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";

// Admin
import AdminDashboard from "@/components/admin/AdminDashboard";
import AddModelForm from "@/components/admin/AddModelForm";
import EditModelForm from "@/components/admin/EditModelForm";

// Import tempo routes for storyboards
import routes from "tempo-routes";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        {/* For the tempo routes */}
        {import.meta.env.VITE_TEMPO && useRoutes(routes)}

        <Routes>
          <Route path="/" element={<Home />} />

          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <RouteGuard>
                <LoginForm />
              </RouteGuard>
            }
          />
          <Route
            path="/signup"
            element={
              <RouteGuard>
                <SignUpForm />
              </RouteGuard>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <RouteGuard requireAuth>
                <Dashboard />
              </RouteGuard>
            }
          />
          <Route
            path="/success"
            element={
              <RouteGuard requireAuth>
                <Success />
              </RouteGuard>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/models"
            element={
              <RouteGuard requireAuth requireAdmin>
                <AdminDashboard />
              </RouteGuard>
            }
          />
          <Route
            path="/admin/models/add"
            element={
              <RouteGuard requireAuth requireAdmin>
                <AddModelForm />
              </RouteGuard>
            }
          />
          <Route
            path="/admin/models/edit/:id"
            element={
              <RouteGuard requireAuth requireAdmin>
                <EditModelForm />
              </RouteGuard>
            }
          />

          {/* Add this before the catchall route for tempo */}
          {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        <Toaster />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
