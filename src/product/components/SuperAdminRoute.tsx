import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLoadingScreen from "../ui/AuthLoadingScreen";

/** Gate for the unlisted /product/super-ops console. No nav entry links here. */
export default function SuperAdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSuperAdmin, loading, isConfigured, user } = useAuth();

  if (loading) {
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
