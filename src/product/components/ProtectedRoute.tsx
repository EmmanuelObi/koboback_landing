import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLoadingScreen from "../ui/AuthLoadingScreen";

export default function ProtectedRoute({
  children,
  requireOnboarding = true,
}: {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}) {
  const {
    user,
    loading,
    isConfigured,
    profile,
    profileLoading,
    onboardingComplete,
  } = useAuth();
  const location = useLocation();
  const isOnboardingRoute = location.pathname === "/product/onboarding";

  // Only block on the initial auth/profile load. A profile refresh (common when
  // Android returns from the file picker) must NOT unmount the page — that
  // destroys in-progress file selection / upload state.
  if (loading) {
    return <AuthLoadingScreen message="Loading your workspace…" />;
  }
  if (isConfigured && user && profileLoading && !profile) {
    return <AuthLoadingScreen message="Loading your workspace…" />;
  }

  if (!isConfigured) {
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to="/product" state={{ from: location }} replace />;
  }

  if (requireOnboarding && !onboardingComplete && !isOnboardingRoute) {
    return <Navigate to="/product/onboarding" replace />;
  }

  if (onboardingComplete && isOnboardingRoute) {
    return <Navigate to="/product/statements" replace />;
  }

  return <>{children}</>;
}
