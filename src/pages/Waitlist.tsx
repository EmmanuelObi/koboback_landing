import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

const AIRTABLE_BASE = "REDACTED_BASE";
const AIRTABLE_TABLE = "REDACTED_TABLE";
const AIRTABLE_TOKEN =
  "REDACTED_TOKEN";

const NIGERIAN_BANKS = [
  "Access Bank",
  "Citibank Nigeria",
  "Ecobank Nigeria",
  "Fidelity Bank",
  "First Bank of Nigeria",
  "First City Monument Bank (FCMB)",
  "Globus Bank",
  "Guaranty Trust Bank (GTBank)",
  "Heritage Bank",
  "Jaiz Bank",
  "Keystone Bank",
  "Kuda Bank",
  "Moniepoint",
  "OPay",
  "PalmPay",
  "Polaris Bank",
  "Providus Bank",
  "Stanbic IBTC Bank",
  "Standard Chartered Bank Nigeria",
  "Sterling Bank",
  "SunTrust Bank",
  "Titan Trust Bank",
  "Union Bank of Nigeria",
  "United Bank for Africa (UBA)",
  "Unity Bank",
  "VFD Microfinance Bank",
  "Wema Bank",
  "Zenith Bank",
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

interface FormData {
  name: string;
  email: string;
  bank: string;
  monthlyTransactions: string;
  noticedCharge: string;
  willingToPay: string;
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
    bank: "",
    monthlyTransactions: "",
    noticedCharge: "",
    willingToPay: "",
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
      if (!form.bank) {
        setFieldError("Please select your primary bank.");
        return false;
      }
      if (!form.monthlyTransactions) {
        setFieldError(
          "Please select your approximate monthly transaction count.",
        );
        return false;
      }
    }
    if (step === 3) {
      if (!form.noticedCharge) {
        setFieldError("Please answer the question about unexpected charges.");
        return false;
      }
      if (!form.willingToPay) {
        setFieldError(
          "Please let us know if you'd be willing to pay for an audit.",
        );
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
              Bank: form.bank,
              "Number of Monthly Transactions": form.monthlyTransactions,
              "Noticed any unexpected charges": form.noticedCharge,
              "Are you willing to pay 2000 Naira for an Audit":
                form.willingToPay,
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

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased flex flex-col">
      {/* Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-[1100px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="text-[15px] font-semibold text-slate-950 tracking-tight"
          >
            KoboBack
          </Link>
          <Link
            to="/"
            className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-start justify-center pt-28 pb-24 px-6">
        <div className="w-full max-w-[520px]">
          {status === "success" ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-center"
            >
              <div className="mx-auto mb-6 h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-blue-600" />
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
              {/* Progress */}
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
                    className="h-full bg-blue-600 rounded-full"
                    animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Step content */}
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
                      className="w-full h-11 px-4 rounded-md border border-slate-200 text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
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
                      className="w-full h-11 px-4 rounded-md border border-slate-200 text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                    />

                    {fieldError && (
                      <p className="mt-2 text-[12px] text-red-500">
                        {fieldError}
                      </p>
                    )}

                    <button
                      onClick={next}
                      className="mt-5 w-full h-11 rounded-md bg-blue-600 text-white text-[14px] font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
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
                      About your banking
                    </h2>
                    <p className="text-[14px] text-slate-500 mb-8">
                      This helps us prioritise the banks we analyse first.
                    </p>

                    {/* Bank select */}
                    <label className="block mb-1.5 text-[13px] font-medium text-slate-700">
                      Primary bank
                    </label>
                    <select
                      value={form.bank}
                      onChange={(e) => set("bank", e.target.value)}
                      className="w-full h-11 px-3 rounded-md border border-slate-200 text-[14px] text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition appearance-none"
                    >
                      <option value="" disabled>
                        Select your bank…
                      </option>
                      {NIGERIAN_BANKS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>

                    {/* Monthly transactions */}
                    <fieldset className="mt-6">
                      <legend className="text-[13px] font-medium text-slate-700 mb-3">
                        Approximate monthly transactions
                      </legend>
                      <div className="space-y-2.5">
                        {[
                          { value: "less_than_50", label: "Fewer than 50" },
                          { value: "50_to_200", label: "50 – 200" },
                          { value: "200_to_500", label: "200 – 500" },
                          { value: "above_500", label: "Above 500" },
                        ].map((opt) => (
                          <label
                            key={opt.value}
                            className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                              form.monthlyTransactions === opt.value
                                ? "border-blue-600 bg-blue-50"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="monthlyTransactions"
                              value={opt.value}
                              checked={form.monthlyTransactions === opt.value}
                              onChange={(e) =>
                                set("monthlyTransactions", e.target.value)
                              }
                              className="accent-blue-600"
                            />
                            <span className="text-[14px] text-slate-700">
                              {opt.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    {fieldError && (
                      <p className="mt-3 text-[12px] text-red-500">
                        {fieldError}
                      </p>
                    )}

                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={back}
                        className="h-11 px-4 rounded-md border border-slate-200 text-slate-600 text-[14px] font-medium hover:border-slate-300 hover:text-slate-900 transition-colors flex items-center gap-1.5"
                      >
                        <ArrowLeft className="h-4 w-4" /> Back
                      </button>
                      <button
                        onClick={next}
                        className="flex-1 h-11 rounded-md bg-blue-600 text-white text-[14px] font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        Continue <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
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
                      One more thing
                    </h2>
                    <p className="text-[14px] text-slate-500 mb-8">
                      Honest answers help us understand how to serve you best.
                    </p>

                    {/* Noticed unexpected charge */}
                    <fieldset className="mb-6">
                      <legend className="text-[13px] font-medium text-slate-700 mb-3">
                        Have you ever noticed an unexpected charge or deduction
                        on your bank statement?
                      </legend>
                      <div className="space-y-2.5">
                        {[
                          {
                            value: "yes",
                            label: "Yes — I've seen something suspicious",
                          },
                          {
                            value: "not_sure",
                            label: "Not sure — I don't always check",
                          },
                          { value: "no", label: "No — everything looks fine" },
                        ].map((opt) => (
                          <label
                            key={opt.value}
                            className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                              form.noticedCharge === opt.value
                                ? "border-blue-600 bg-blue-50"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="noticedCharge"
                              value={opt.value}
                              checked={form.noticedCharge === opt.value}
                              onChange={(e) =>
                                set("noticedCharge", e.target.value)
                              }
                              className="accent-blue-600"
                            />
                            <span className="text-[14px] text-slate-700">
                              {opt.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    {/* Willing to pay */}
                    <fieldset>
                      <legend className="text-[13px] font-medium text-slate-700 mb-3">
                        Would you pay ₦2,000 for a detailed AI audit of your
                        bank statement?
                      </legend>
                      <div className="space-y-2.5">
                        {[
                          {
                            value: "yes",
                            label: "Yes — that's fair for what it offers",
                          },
                          {
                            value: "maybe",
                            label: "Maybe — depends on what's found",
                          },
                          { value: "no", label: "No — I'd need it to be free" },
                        ].map((opt) => (
                          <label
                            key={opt.value}
                            className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                              form.willingToPay === opt.value
                                ? "border-blue-600 bg-blue-50"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="willingToPay"
                              value={opt.value}
                              checked={form.willingToPay === opt.value}
                              onChange={(e) =>
                                set("willingToPay", e.target.value)
                              }
                              className="accent-blue-600"
                            />
                            <span className="text-[14px] text-slate-700">
                              {opt.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

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

                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={back}
                        disabled={status === "loading"}
                        className="h-11 px-4 rounded-md border border-slate-200 text-slate-600 text-[14px] font-medium hover:border-slate-300 hover:text-slate-900 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <ArrowLeft className="h-4 w-4" /> Back
                      </button>
                      <button
                        onClick={submit}
                        disabled={status === "loading"}
                        className="flex-1 h-11 rounded-md bg-blue-600 text-white text-[14px] font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {status === "loading" ? (
                          <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        ) : (
                          <>
                            Join the waitlist <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>

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
