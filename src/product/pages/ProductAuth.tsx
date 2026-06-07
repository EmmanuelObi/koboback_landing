import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../ui/AuthLayout";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { cn, eyebrowClass, pageDescClass, pageTitleClass } from "../ui/tokens";

type Tab = "signin" | "signup";

function postAuthPath(onboardingComplete: boolean) {
  return onboardingComplete ? "/product/dashboard" : "/product/onboarding";
}

export default function ProductAuth() {
  const { user, signIn, signUp, isConfigured, loading, onboardingComplete } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromState = (location.state as { from?: { pathname: string } })?.from
    ?.pathname;
  const defaultDest = postAuthPath(onboardingComplete);

  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const dest =
        fromState && fromState !== "/product" ? fromState : defaultDest;
      navigate(dest, { replace: true });
    }
  }, [user, loading, navigate, fromState, defaultDest]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    setSignupSuccess(false);

    const message =
      tab === "signup"
        ? await signUp(email, password, termsAccepted)
        : await signIn(email, password);

    setSubmitting(false);

    if (message) {
      setError(message);
      return;
    }

    if (tab === "signup") {
      setSignupSuccess(true);
      setTab("signin");
      return;
    }

    navigate(fromState && fromState !== "/product" ? fromState : defaultDest, {
      replace: true,
    });
  };

  return (
    <AuthLayout>
      <p className={cn(eyebrowClass, "mb-3")}>
        {tab === "signin" ? "Welcome back" : "Get started"}
      </p>
      <h1 className={pageTitleClass}>
        {tab === "signin" ? "Sign in to KoboBack" : "Create your account"}
      </h1>
      <p className={cn(pageDescClass, "mt-2 mb-8")}>
        Upload statements, track audits, and recover unfair bank fees.
      </p>

      <div className="flex mb-6 border-b border-slate-200">
        {(["signin", "signup"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              setError(null);
              setSignupSuccess(false);
            }}
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

      {signupSuccess && (
        <p className="mb-4 text-[13px] text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2.5">
          Account created. Check your email if confirmation is required, then
          sign in to complete your profile.
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
          />
        </div>
        <div>
          <label className="block mb-1.5 text-[13px] font-medium text-slate-700">
            Password
          </label>
          <Input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
        </div>

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
          ) : (
            <>
              Create account <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

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
