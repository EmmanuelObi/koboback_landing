import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "../../components/Logo";

export default function AuthLayout({
  backTo = "/",
  backLabel = "Back to home",
  children,
  wide = false,
  aside,
}: {
  backTo?: string;
  backLabel?: string;
  children: React.ReactNode;
  wide?: boolean;
  /** Optional right-rail hint (desktop). */
  aside?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-muted/40 text-slate-900 antialiased flex flex-col">
      <header className="fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200/80">
        <div className="max-w-[1100px] mx-auto px-6 h-14 flex items-center justify-between">
          <Logo to="/" size="md" />
          <Link
            to={backTo}
            className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {backLabel}
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center pt-28 pb-24 px-6">
        <div
          className={
            aside
              ? "w-full max-w-[920px] grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start"
              : wide
                ? "w-full max-w-[640px]"
                : "w-full max-w-[440px]"
          }
        >
          <div className="rounded-xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
            {children}
          </div>
          {aside && (
            <aside className="hidden lg:block rounded-xl border border-brand/15 bg-gradient-to-br from-brand-muted via-white to-white p-5">
              {aside}
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}

export function AuthFlowAside() {
  const steps = [
    { n: "1", label: "Upload", detail: "PDF, CSV, or Excel statement" },
    { n: "2", label: "Extract", detail: "We read your transactions" },
    { n: "3", label: "Audit", detail: "You start the CBN fee check" },
  ];

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-dark mb-3">
        How KoboBack works
      </p>
      <ul className="space-y-4">
        {steps.map((s) => (
          <li key={s.n} className="flex gap-3">
            <span className="h-6 w-6 rounded-full bg-brand text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
              {s.n}
            </span>
            <div>
              <p className="text-[13px] font-semibold text-slate-950">{s.label}</p>
              <p className="text-[12px] text-slate-500 mt-0.5">{s.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
