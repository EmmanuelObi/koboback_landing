import { useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLoadingScreen from "../ui/AuthLoadingScreen";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading, rolesLoading, isConfigured, user } = useAuth();
  const authorizedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!rolesLoading && isAdmin && user) {
      authorizedUserIdRef.current = user.id;
    }
  }, [isAdmin, rolesLoading, user]);

  const isRefreshingAuthorizedUser =
    rolesLoading && isAdmin && user?.id === authorizedUserIdRef.current;

  // Only replace the page while resolving access for the first time. Supabase
  // also emits auth changes during token refreshes, which re-check the role.
  // If this admin was already authorized, keep the page mounted so in-progress
  // form state is not destroyed while that background check runs.
  if (loading || (rolesLoading && !isRefreshingAuthorizedUser)) {
    return <AuthLoadingScreen message="Checking admin access…" />;
  }

  if (isConfigured && !user) {
    return <Navigate to="/product" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/product/dashboard" replace />;
  }

  return <>{children}</>;
}
