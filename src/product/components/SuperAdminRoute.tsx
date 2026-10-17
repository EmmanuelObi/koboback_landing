import { useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLoadingScreen from "../ui/AuthLoadingScreen";

/** Gate for the unlisted /product/super-ops console. No nav entry links here. */
export default function SuperAdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSuperAdmin, loading, rolesLoading, isConfigured, user } = useAuth();
  const authorizedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!rolesLoading && isSuperAdmin && user) {
      authorizedUserIdRef.current = user.id;
    }
  }, [isSuperAdmin, rolesLoading, user]);

  const isRefreshingAuthorizedUser =
    rolesLoading &&
    isSuperAdmin &&
    user?.id === authorizedUserIdRef.current;

  // Keep an already-authorized console mounted during background role checks.
  // Unmounting here would discard any in-progress page state on token refresh.
  if (loading || (rolesLoading && !isRefreshingAuthorizedUser)) {
    return <AuthLoadingScreen message="Checking access…" />;
  }

  if (isConfigured && !user) {
    return <Navigate to="/product" replace />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/product/dashboard" replace />;
  }

  return <>{children}</>;
}
