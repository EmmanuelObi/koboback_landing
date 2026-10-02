import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLoadingScreen from "../ui/AuthLoadingScreen";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading, rolesLoading, isConfigured, user } = useAuth();

  if (loading || rolesLoading) {
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
