/**
 * LegalLayout — shared shell for Privacy Policy and Terms of Service pages.
 * Same design system as the landing page: slate palette, Inter, clean hierarchy.
 */

import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "./Logo";

interface LegalLayoutProps {
  title: string;
  effectiveDate: string;
  children: ReactNode;
}

export function LegalLayout({
  title,
  effectiveDate,
  children,
}: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      {/* ── Minimal top bar ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-[1100px] mx-auto px-6 h-14 flex items-center justify-between">
          <Logo to="/" size="md" />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>
        </div>
      </header>

      {/* ── Page header ── */}
      <div className="border-b border-slate-200 bg-slate-50 py-12">
        <div className="max-w-[720px] mx-auto px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 mb-3">
            Legal
          </p>
          <h1 className="text-[28px] md:text-[34px] font-bold text-slate-950 tracking-[-0.02em] leading-tight">
            {title}
          </h1>
          <p className="mt-3 text-[13px] text-slate-400">
            Effective date: {effectiveDate}
          </p>
        </div>
      </div>

      {/* ── Document body ── */}
      <main className="py-16">
        <div className="max-w-[720px] mx-auto px-6">
          <div className="prose-legal">{children}</div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-[720px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} KoboBack. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link
              to="/privacy"
              className="hover:text-slate-700 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="hover:text-slate-700 transition-colors"
            >
              Terms of Service
            </Link>
            <a
              href="mailto:hello@koboback.com"
              className="hover:text-slate-700 transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Prose sub-components — keep all legal typography consistent
───────────────────────────────────────────────────────── */

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-12">
      <h2 className="text-[18px] font-bold text-slate-950 tracking-[-0.01em] mb-4 pb-3 border-b border-slate-100">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function SubSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-5">
      <h3 className="text-[15px] font-semibold text-slate-800 mb-2">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function P({ children }: { children: ReactNode }) {
  return (
    <p className="text-[15px] text-slate-600 leading-[1.75]">{children}</p>
  );
}

export function Ul({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 space-y-1.5 pl-5">
      {items.map((item, i) => (
        <li
          key={i}
          className="text-[15px] text-slate-600 leading-[1.75] list-disc list-outside"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
      <p className="text-[14px] text-slate-600 leading-relaxed">{children}</p>
    </div>
  );
}
