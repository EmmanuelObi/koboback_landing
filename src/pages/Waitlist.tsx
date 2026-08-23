import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

const AIRTABLE_BASE = import.meta.env.VITE_AIRTABLE_BASE as string;
const AIRTABLE_TABLE = import.meta.env.VITE_AIRTABLE_TABLE as string;
const AIRTABLE_TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN as string;

const LAST_NOTICED_OPTIONS = [
  { value: "this_week", label: "This week" },
  { value: "this_month", label: "This month" },
  { value: "last_3_months", label: "In the last 3 months" },
  { value: "over_6_months", label: "More than 6 months ago" },
  { value: "not_recently", label: "I haven't noticed any recently" },
];

const FREQUENCY_OPTIONS = [
  { value: "weekly_or_more", label: "Weekly or more often" },
  { value: "monthly", label: "About once a month" },
  { value: "every_few_months", label: "Every few months" },
  { value: "rarely", label: "Rarely" },
  { value: "not_sure", label: "I'm not sure" },
];

const fade = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: "easeIn" } },
};

const inputClass =
  "w-full px-4 rounded-md border border-slate-200 text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition";

interface FormData {
  name: string;
  email: string;
  whyProblem: string;
  lastNoticed: string;
  frequency: string;
  whatDone: string;
  anythingElse: string;
}

function RadioGroup({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2.5">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
            value === opt.value
              ? "border-brand bg-brand-muted"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={(e) => onChange(e.target.value)}
            className="accent-brand"
          />
          <span className="text-[14px] text-slate-700">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

export default function Waitlist() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldError, setFieldError] = useState("");

  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    whyProblem: "",
    lastNoticed: "",
    frequency: "",
    whatDone: "",
    anythingElse: "",
  });

  const set = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldError("");
  };

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!form.name.trim()) {
        setFieldError("Please enter your name.");
        return false;
      }
      if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        setFieldError("Please enter a valid email address.");
        return false;
      }
    }
    if (step === 2) {
      if (!form.whyProblem.trim()) {
        setFieldError("Please tell us why bank charges and errors matter to you.");
        return false;
      }
      if (!form.lastNoticed) {
        setFieldError("Please select when you last noticed these deductions.");
        return false;
      }
    }
    if (step === 3) {
      if (!form.frequency) {
        setFieldError("Please select how frequently you get these deductions.");
        return false;
      }
      if (!form.whatDone.trim()) {
        setFieldError("Please tell us what you've done about it so far.");
        return false;
      }
    }
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    setFieldError("");
    setStep((s) => s + 1);
  };

  const back = () => {
    setFieldError("");
    setStep((s) => s - 1);
  };

  const labelFor = (
    options: { value: string; label: string }[],
    value: string,
  ) => options.find((o) => o.value === value)?.label ?? value;

  const submit = async () => {
    if (!validateStep()) return;
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_TABLE}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${AIRTABLE_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fields: {
              Name: form.name,
              Email: form.email,
              "Why is Bank Charges and Errors a big problem for you?":
                form.whyProblem,
              "When was the last time you noticed these deductions?":
                labelFor(LAST_NOTICED_OPTIONS, form.lastNoticed),
              "How frequently do you get them?": labelFor(
                FREQUENCY_OPTIONS,
                form.frequency,
              ),
              "What have you done about it?": form.whatDone,
              "Anything else you want us to know?":
                form.anythingElse.trim() || undefined,
            },
          }),
        },
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body?.error?.message || `Request failed (${res.status})`,
        );
      }

      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  const TOTAL_STEPS = 3;

  const navButtons = (onPrimary: () => void, primaryLabel: ReactNode) => (
    <div className="mt-6 flex gap-3">
      <button
        onClick={back}
        disabled={status === "loading"}
        className="h-11 px-4 rounded-md border border-slate-200 text-slate-600 text-[14px] font-medium hover:border-slate-300 hover:text-slate-900 transition-colors flex items-center gap-1.5 disabled:opacity-50"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <button
        onClick={onPrimary}
        disabled={status === "loading"}
        className="flex-1 h-11 rounded-md bg-brand text-white text-[14px] font-medium hover:bg-brand-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {status === "loading" ? (
          <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        ) : (
          primaryLabel
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased flex flex-col">
      <header className="fixed inset-x-0 top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-[1100px] mx-auto px-6 h-14 flex items-center justify-between">
          <Logo to="/" size="md" />
          <Link
            to="/"
            className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center pt-28 pb-24 px-6">
        <div className="w-full max-w-[520px]">
          {status === "success" ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-center"
            >
              <div className="mx-auto mb-6 h-12 w-12 rounded-full bg-brand-muted flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-brand" />
              </div>
              <h1 className="text-[28px] font-bold text-slate-950 tracking-tight">
                You're on the list
                {form.name ? `, ${form.name.split(" ")[0]}` : ""}.
              </h1>
              <p className="mt-3 text-[15px] text-slate-500 leading-relaxed max-w-[380px] mx-auto">
                We'll reach out as soon as KoboBack is ready. Keep an eye on{" "}
                <span className="text-slate-700 font-medium">{form.email}</span>
                .
              </p>
              <Link
                to="/"
                className="mt-8 inline-flex items-center gap-2 h-10 px-5 rounded-md border border-slate-200 text-slate-600 text-[13px] font-medium hover:border-slate-300 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to home
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-medium text-slate-400">
                    Step {step} of {TOTAL_STEPS}
                  </span>
                  <span className="text-[12px] text-slate-400">
                    {Math.round((step / TOTAL_STEPS) * 100)}% complete
                  </span>
                </div>
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-brand rounded-full"
                    animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    variants={fade}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 mb-3">
                      Early access
                    </p>
                    <h1 className="text-[28px] md:text-[34px] font-bold text-slate-950 leading-[1.2] tracking-[-0.02em] mb-2">
                      Join the KoboBack waitlist
                    </h1>
                    <p className="text-[15px] text-slate-500 mb-8">
                      Get early access, a free first scan, and priority recovery
                      support.
                    </p>

                    <label className="block mb-1.5 text-[13px] font-medium text-slate-700">
                      Full name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="Ada Okonkwo"
                      autoFocus
                      className={`${inputClass} h-11`}
                    />

                    <label className="block mt-4 mb-1.5 text-[13px] font-medium text-slate-700">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && next()}
                      placeholder="you@example.com"
                      className={`${inputClass} h-11`}
                    />

                    {fieldError && (
                      <p className="mt-2 text-[12px] text-red-500">
                        {fieldError}
                      </p>
                    )}

                    <button
                      onClick={next}
                      className="mt-5 w-full h-11 rounded-md bg-brand text-white text-[14px] font-medium hover:bg-brand-dark transition-colors flex items-center justify-center gap-2"
                    >
                      Continue <ArrowRight className="h-4 w-4" />
                    </button>

                    <p className="mt-4 text-[12px] text-slate-400 text-center">
                      By joining, you agree to our{" "}
                      <Link
                        to="/terms"
                        className="text-slate-600 underline underline-offset-2 hover:text-slate-900"
                      >
                        Terms
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/privacy"
                        className="text-slate-600 underline underline-offset-2 hover:text-slate-900"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    variants={fade}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <h2 className="text-[26px] md:text-[30px] font-bold text-slate-950 leading-[1.2] tracking-[-0.02em] mb-1">
                      Your experience
                    </h2>
                    <p className="text-[14px] text-slate-500 mb-8">
                      Help us understand the problem you're facing.
                    </p>

                    <label className="block mb-1.5 text-[13px] font-medium text-slate-700">
                      Why is Bank Charges and Errors a big problem for you?
                    </label>
                    <textarea
                      value={form.whyProblem}
                      onChange={(e) => set("whyProblem", e.target.value)}
                      placeholder="Tell us how unexpected charges or errors have affected you…"
                      rows={4}
                      className={`${inputClass} py-3 resize-none`}
                    />

                    <fieldset className="mt-6">
                      <legend className="text-[13px] font-medium text-slate-700 mb-3">
                        When was the last time you noticed these deductions?
                      </legend>
                      <RadioGroup
                        name="lastNoticed"
                        value={form.lastNoticed}
                        options={LAST_NOTICED_OPTIONS}
                        onChange={(v) => set("lastNoticed", v)}
                      />
                    </fieldset>

                    {fieldError && (
                      <p className="mt-3 text-[12px] text-red-500">
                        {fieldError}
                      </p>
                    )}

                    {navButtons(
                      next,
                      <>
                        Continue <ArrowRight className="h-4 w-4" />
                      </>,
                    )}
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    variants={fade}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <h2 className="text-[26px] md:text-[30px] font-bold text-slate-950 leading-[1.2] tracking-[-0.02em] mb-1">
                      Almost done
                    </h2>
                    <p className="text-[14px] text-slate-500 mb-8">
                      A few more details and you're on the list.
                    </p>

                    <fieldset className="mb-6">
                      <legend className="text-[13px] font-medium text-slate-700 mb-3">
                        How frequently do you get them?
                      </legend>
                      <RadioGroup
                        name="frequency"
                        value={form.frequency}
                        options={FREQUENCY_OPTIONS}
                        onChange={(v) => set("frequency", v)}
                      />
                    </fieldset>

                    <label className="block mb-1.5 text-[13px] font-medium text-slate-700">
                      What have you done about it?
                    </label>
                    <textarea
                      value={form.whatDone}
                      onChange={(e) => set("whatDone", e.target.value)}
                      placeholder="e.g. visited a branch, called customer care, ignored it…"
                      rows={3}
                      className={`${inputClass} py-3 resize-none mb-6`}
                    />

                    <label className="block mb-1.5 text-[13px] font-medium text-slate-700">
                      Anything else you want us to know?{" "}
                      <span className="font-normal text-slate-400">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      value={form.anythingElse}
                      onChange={(e) => set("anythingElse", e.target.value)}
                      placeholder="Anything we should keep in mind…"
                      rows={3}
                      className={`${inputClass} py-3 resize-none`}
                    />

                    {fieldError && (
                      <p className="mt-3 text-[12px] text-red-500">
                        {fieldError}
                      </p>
                    )}

                    {status === "error" && (
                      <p className="mt-3 text-[12px] text-red-500">
                        {errorMessage}
                      </p>
                    )}

                    {navButtons(
                      submit,
                      <>
                        Join the waitlist <ArrowRight className="h-4 w-4" />
                      </>,
                    )}

                    <p className="mt-4 text-[12px] text-slate-400 text-center">
                      No spam. No sharing. Unsubscribe anytime.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
