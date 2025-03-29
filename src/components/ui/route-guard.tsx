import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";
import { LoadingScreen } from "./loading-spinner";

interface RouteGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export function RouteGuard({
  children,
  requireAuth = false,
  requireAdmin = false,
}: RouteGuardProps) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for auth to initialize
    if (!loading) {
      setIsChecking(false);
    }
  }, [loading]);

  if (isChecking) {
    return <LoadingScreen text="Checking authentication..." />;
  }

  // If auth is required and user is not logged in, redirect to login
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If admin access is required and user is not an admin, redirect to dashboard
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is logged in and tries to access login/signup pages, redirect to dashboard
  if (
    user &&
    !requireAuth &&
    (location.pathname === "/login" || location.pathname === "/signup")
  ) {
    return <Navigate to={isAdmin ? "/admin/models" : "/dashboard"} replace />;
  }

  return <>{children}</>;
}
