import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthLayout, { AuthFlowAside } from "../ui/AuthLayout";
import AuthLoadingScreen from "../ui/AuthLoadingScreen";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { cn, eyebrowClass, pageDescClass, pageTitleClass } from "../ui/tokens";

type Tab = "signin" | "signup" | "reset";

function postAuthPath(onboardingComplete: boolean) {
  return onboardingComplete ? "/product/statements" : "/product/onboarding";
}

export default function ProductAuth() {
  const {
    user,
    signIn,
    signUp,
    resetPasswordForEmail,
    isConfigured,
    loading,
    onboardingComplete,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromState = (location.state as { from?: { pathname: string } })?.from
    ?.pathname;
  const defaultDest = postAuthPath(onboardingComplete);

  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const dest =
        fromState && fromState !== "/product" ? fromState : defaultDest;
      navigate(dest, { replace: true });
    }
  }, [user, loading, navigate, fromState, defaultDest]);

  if (loading) {
    return <AuthLoadingScreen message="Checking your session…" />;
  }

  if (!loading && user) {
    const dest =
      fromState && fromState !== "/product" ? fromState : defaultDest;
    return <Navigate to={dest} replace />;
  }

  if (!isConfigured) {
    return (
      <AuthLayout>
        <div className="text-center">
          <p className={cn(eyebrowClass, "mb-3")}>Product</p>
          <h1 className={pageTitleClass}>Continue without sign-in</h1>
          <p className={cn(pageDescClass, "mt-3 mb-8")}>
            Auth is not configured in this environment. You can use the audit
            tool directly.
          </p>
          <Link to="/product/statements">
            <Button>Go to statements</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  const switchTab = (next: Tab) => {
    setTab(next);
    setError(null);
    setInfo(null);
    setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    if (tab === "reset") {
      const message = await resetPasswordForEmail(email.trim());
      setSubmitting(false);
      if (message) {
        setError(message);
        return;
      }
      setInfo(
        `If an account exists for ${email.trim()}, we sent a reset link. Check your inbox.`,
      );
      return;
    }

    if (tab === "signup") {
      const result = await signUp(email.trim(), password, termsAccepted);
      setSubmitting(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.needsEmailConfirmation) {
        setInfo(
          `We sent a confirmation link to ${email.trim()}. Confirm your email, then sign in.`,
        );
        setTab("signin");
        setPassword("");
        return;
      }
      // Immediate session (confirmations disabled) — redirect via auth state
      navigate(defaultDest, { replace: true });
      return;
    }

    const message = await signIn(email.trim(), password);
    setSubmitting(false);
    if (message) {
      setError(message);
      return;
    }

    navigate(fromState && fromState !== "/product" ? fromState : defaultDest, {
      replace: true,
    });
  };

  const title =
    tab === "signin"
      ? "Sign in to KoboBack"
      : tab === "signup"
        ? "Create your account"
        : "Reset your password";

  const subtitle =
    tab === "signin"
      ? "Upload statements and check fees against CBN rules."
      : tab === "signup"
        ? "Create an account to save statements and audit reports."
        : "Enter your email and we’ll send a reset link.";

  return (
    <AuthLayout aside={<AuthFlowAside />}>
      <p className={cn(eyebrowClass, "mb-3")}>
        {tab === "signin"
          ? "Welcome back"
          : tab === "signup"
            ? "Get started"
            : "Account recovery"}
      </p>
      <h1 className={pageTitleClass}>{title}</h1>
      <p className={cn(pageDescClass, "mt-2 mb-6")}>{subtitle}</p>

      {tab !== "reset" && (
        <div className="flex mb-6 border-b border-slate-200">
          {(["signin", "signup"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => switchTab(t)}
              className={cn(
                "flex-1 pb-3 text-[13px] font-medium border-b-2 -mb-px transition",
                tab === t
                  ? "border-brand text-brand"
                  : "border-transparent text-slate-500 hover:text-slate-700",
              )}
            >
              {t === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>
      )}

      {info && (
        <p className="mb-4 text-[13px] text-brand-dark bg-brand-muted border border-brand/20 rounded-md px-3 py-2.5 leading-relaxed">
          {info}
        </p>
      )}

      {error && (
        <p className="mb-4 text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2.5">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1.5 text-[13px] font-medium text-slate-700">
            Email
          </label>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        {tab !== "reset" && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[13px] font-medium text-slate-700">
                Password
              </label>
              {tab === "signin" && (
                <button
                  type="button"
                  onClick={() => switchTab("reset")}
                  className="text-[12px] text-brand hover:text-brand-dark"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete={
                  tab === "signup" ? "new-password" : "current-password"
                }
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}

        {tab === "signup" && (
          <label className="flex items-start gap-2.5 text-[13px] text-slate-600 leading-relaxed">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 accent-brand"
              required
            />
            <span>
              I agree to the{" "}
              <Link
                to="/terms"
                className="text-slate-800 underline underline-offset-2 hover:text-slate-950"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="text-slate-800 underline underline-offset-2 hover:text-slate-950"
              >
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        )}

        <Button
          type="submit"
          fullWidth
          disabled={submitting || (tab === "signup" && !termsAccepted)}
        >
          {submitting ? (
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : tab === "signin" ? (
            <>
              Sign in <ArrowRight className="h-4 w-4" />
            </>
          ) : tab === "signup" ? (
            <>
              Create account <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>

      {tab === "reset" && (
        <button
          type="button"
          onClick={() => switchTab("signin")}
          className="mt-4 w-full text-center text-[13px] text-slate-500 hover:text-slate-800"
        >
          Back to sign in
        </button>
      )}

      <p className="mt-6 text-[12px] text-slate-400 text-center">
        Not ready yet?{" "}
        <Link
          to="/waitlist"
          className="text-slate-600 underline underline-offset-2 hover:text-slate-900"
        >
          Join the waitlist
        </Link>
      </p>
    </AuthLayout>
  );
}
