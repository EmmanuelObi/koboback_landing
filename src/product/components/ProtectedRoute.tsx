import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
  requireOnboarding = true,
}: {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}) {
  const { user, loading, isConfigured, profileLoading, onboardingComplete } =
    useAuth();
  const location = useLocation();
  const isOnboardingRoute = location.pathname === "/product/onboarding";

  if (loading || (isConfigured && user && profileLoading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        <p className="text-[13px] text-slate-500">Loading…</p>
      </div>
    );
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
    return <Navigate to="/product/dashboard" replace />;
  }

  return <>{children}</>;
}
