/**
 * KoboBack Landing Page
 * Design system: Stripe / Linear inspired — minimal, restrained, production-grade.
 * Palette: slate-950 (primary) · slate-500 (secondary) · blue-600 (single accent CTA)
 * Backgrounds: white / slate-50 alternating
 * No gradients · No glassmorphism · No mixed accent colors
 */

import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Upload,
  Search,
  FileText,
  Coins,
  ShieldCheck,
  Lock,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Menu,
  X,
  ChevronRight,
  Banknote,
  Clock,
  BadgeCheck,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";

/* ─────────────────────────────────────────────────────────
   MOTION VARIANTS — subtle, fast, no bounce
───────────────────────────────────────────────────────── */
const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

/* ─────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────── */
const problems = [
  {
    icon: AlertTriangle,
    title: "Charges you never approved",
    desc: "SMS fees, card maintenance, and mystery deductions quietly appear on your statement month after month.",
  },
  {
    icon: TrendingDown,
    title: "Failed transfers that were never refunded",
    desc: "Your account was debited. The transfer failed. The bank never returned the money.",
  },
  {
    icon: Coins,
    title: "Small amounts nobody bothers to chase",
    desc: "₦150 here. ₦300 there. Too small to notice individually, until you add up a year's worth.",
  },
];

const steps = [
  {
    icon: Upload,
    number: "01",
    title: "Upload your bank statement",
    desc: "Export a PDF from your bank app. No login, no bank integration, no extra accounts.",
  },
  {
    icon: Search,
    number: "02",
    title: "AI scans for errors",
    desc: "Our engine checks every transaction against known patterns of bank errors and unreversed debits.",
  },
  {
    icon: FileText,
    number: "03",
    title: "See what you may be owed",
    desc: "A clear, itemised report shows you exactly which transactions look wrong and the total at stake.",
  },
  {
    icon: Banknote,
    number: "04",
    title: "We help you recover it",
    desc: "KoboBack guides you through the dispute process. We charge a fee only when you actually recover money.",
  },
];

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "Built for consumers, not banks",
    desc: "Every tool in this space is sold to banks. KoboBack works exclusively for account holders.",
  },
  {
    icon: Lock,
    title: "Your data stays private",
    desc: "Statements are encrypted in transit and at rest. We never sell or share your data. Delete anytime.",
  },
  {
    icon: Banknote,
    title: "Transparent pricing",
    desc: "Scan for free. Pay ₦2,000 for a full audit report. Opt into managed recovery for 20% of what we get back — nothing more.",
  },
  {
    icon: BadgeCheck,
    title: "Full transparency",
    desc: "You see exactly what we flagged, why it was flagged, and how we arrived at the recovery estimate.",
  },
];

const differentiators = [
  {
    icon: Clock,
    title: "Finds past errors, not just future ones",
    desc: "We scan historical statements. Errors from months ago are still recoverable in most cases.",
  },
  {
    icon: CheckCircle2,
    title: "No bank login required",
    desc: "Just upload a PDF. No risky third-party access to your bank account is ever needed.",
  },
  {
    icon: Search,
    title: "Works even if you never complained before",
    desc: "You don't need an existing dispute. KoboBack can identify and initiate the process from scratch.",
  },
];

const testimonials = [
  {
    initials: "BA",
    name: "Blessing A.",
    role: "Teacher · Lagos",
    quote:
      "I uploaded six months of statements and found ₦4,700 in charges I had never noticed. I genuinely had no idea.",
  },
  {
    initials: "CO",
    name: "Chidi O.",
    role: "Freelancer · Abuja",
    quote:
      "A transfer failed in January and the refund never came. KoboBack helped me understand exactly what happened and how to dispute it.",
  },
  {
    initials: "FB",
    name: "Funmilayo B.",
    role: "Business owner · Ibadan",
    quote:
      "I always suspected my bank was deducting more than it should. Now I have a report that proves it line by line.",
  },
];

const faqs = [
  {
    q: "Is my bank statement data safe?",
    a: "Yes. All uploads are encrypted using TLS in transit and AES-256 at rest. We never sell or share your data with third parties. You can request permanent deletion at any time.",
  },
  {
    q: "How does KoboBack make money?",
    a: "Scanning is free. A full audit report costs ₦2,000 — you get a detailed breakdown of every error and a dispute letter. If you want us to handle the recovery process for you, we charge 20% of the amount successfully recovered. No recovery, no fee on that tier.",
  },
  {
    q: "What if no errors are found in my statement?",
    a: "That's a good outcome. It means your bank has treated you fairly on this statement. You owe us nothing and we'll tell you clearly.",
  },
  {
    q: "Do you work with the banks?",
    a: "No. KoboBack is entirely independent. We are not affiliated with, endorsed by, or partnered with any Nigerian bank. We represent account holders only.",
  },
  {
    q: "Which banks and statement types do you support?",
    a: "We currently support PDF statements from all major Nigerian commercial banks. Additional formats and institutions are being added regularly.",
  },
];

/* ─────────────────────────────────────────────────────────
   FAQ ACCORDION
───────────────────────────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 last:border-none">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-[15px] font-medium text-slate-900 group-hover:text-blue-600 transition-colors pr-6">
          {q}
        </span>
        <ChevronRight
          className={`h-4 w-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
            open ? "rotate-90" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-[15px] text-slate-500 leading-relaxed pb-5 pr-8">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   STAT ROW ITEM
───────────────────────────────────────────────────────── */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-2xl font-bold text-slate-950 tracking-tight">
        {value}
      </span>
      <span className="text-[13px] text-slate-500 leading-snug">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────────────────── */
export default function App() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "#how-it-works", label: "How it works" },
    { href: "#trust", label: "Why trust us" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      {/* ══════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════ */}
      <header className="fixed inset-x-0 top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-[1100px] mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <a
            href="/"
            className="text-[15px] font-semibold text-slate-950 tracking-tight"
          >
            KoboBack
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <Link
            to="/waitlist"
            className="hidden md:inline-flex items-center gap-1.5 h-8 px-4 rounded-md bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 transition-colors"
          >
            Join waitlist
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="overflow-hidden border-t border-slate-100 bg-white md:hidden"
            >
              <div className="px-6 py-4 flex flex-col gap-1">
                {navLinks.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="py-2.5 text-[14px] text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {l.label}
                  </a>
                ))}
                <Link
                  to="/waitlist"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 inline-flex items-center justify-center h-9 px-4 rounded-md bg-blue-600 text-white text-[13px] font-medium"
                >
                  Join waitlist
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ══════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="pt-32 pb-24 md:pt-40 md:pb-32 bg-white border-b border-slate-200"
      >
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="max-w-[1100px] mx-auto px-6"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            className="max-w-[680px]"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-8 px-3 py-1 rounded-full border border-slate-200 bg-slate-50">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              <span className="text-[12px] font-medium text-slate-500 tracking-wide">
                AI-powered bank error detection · Nigeria
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-[40px] md:text-[52px] font-bold text-slate-950 leading-[1.12] tracking-[-0.02em]">
              Your bank may owe you money.
              <br />
              <span className="text-slate-400">
                Most people never find out.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="mt-6 text-[17px] text-slate-500 leading-relaxed max-w-[520px]">
              KoboBack scans your bank statement using AI to detect hidden
              charges, failed transaction refunds, and billing errors — then
              helps you understand and recover what you're owed.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-start gap-3">
              <Link
                to="/waitlist"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-md bg-blue-600 text-white text-[14px] font-medium hover:bg-blue-700 transition-colors"
              >
                Join the waitlist <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-md border border-slate-200 text-slate-600 text-[14px] font-medium hover:border-slate-300 hover:text-slate-900 transition-colors"
              >
                See how it works
              </a>
            </div>

            {/* Trust line */}
            <p className="mt-8 text-[12px] text-slate-400">
              Private by default · No bank login required · Free to scan
              · Paid audit & recovery options available
            </p>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <div className="mt-20 flex justify-center">
          <a href="#problem" aria-label="Scroll down">
            <ChevronDown className="h-5 w-5 text-slate-300 animate-bounce" />
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════ */}
      <section className="bg-slate-50 border-b border-slate-200 py-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="max-w-[1100px] mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-0 sm:divide-x sm:divide-slate-200"
        >
          <div className="sm:pr-10">
            <Stat
              value="₦Billions"
              label="Lost to bank errors in Nigeria every year"
            />
          </div>
          <div className="sm:px-10">
            <Stat
              value="9 in 10"
              label="Affected customers never receive a refund"
            />
          </div>
          <div className="sm:pl-10">
            <Stat
              value="₦2,000"
              label="For a full audit — or 20% fee on managed recovery"
            />
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          PROBLEM SECTION
      ══════════════════════════════════════════════ */}
      <section
        id="problem"
        className="py-24 bg-white border-b border-slate-200"
      >
        <div className="max-w-[1100px] mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fade}
            custom={0}
            className="max-w-[520px] mb-14"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 mb-4">
              The problem
            </p>
            <h2 className="text-[30px] md:text-[36px] font-bold text-slate-950 leading-[1.2] tracking-[-0.02em]">
              Banks make mistakes.
              <br />
              You're the one absorbing the cost.
            </h2>
            <p className="mt-4 text-[15px] text-slate-500 leading-relaxed">
              It happens quietly. Small deductions. Failed refunds. Charges with
              no explanation. Most people never notice, and banks aren't going
              to raise the issue themselves.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {problems.map((p, i) => (
              <motion.div
                key={p.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fade}
                custom={i}
                className="p-6 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
              >
                <div className="mb-4 h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                  <p.icon className="h-4 w-4 text-slate-500" />
                </div>
                <h3 className="text-[15px] font-semibold text-slate-900 mb-2">
                  {p.title}
                </h3>
                <p className="text-[14px] text-slate-500 leading-relaxed">
                  {p.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Pull quote */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-16 border-l-2 border-slate-200 pl-6 max-w-[600px]"
          >
            <p className="text-[17px] text-slate-600 leading-relaxed italic">
              "The average Nigerian bank customer has at least one unresolved
              billing error on their statement. They simply don't know it yet."
            </p>
            <p className="mt-3 text-[12px] text-slate-400">
              Based on industry analysis of retail banking patterns in Nigeria
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════ */}
      <section
        id="how-it-works"
        className="py-24 bg-slate-50 border-b border-slate-200"
      >
        <div className="max-w-[1100px] mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fade}
            custom={0}
            className="max-w-[480px] mb-14"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 mb-4">
              How it works
            </p>
            <h2 className="text-[30px] md:text-[36px] font-bold text-slate-950 leading-[1.2] tracking-[-0.02em]">
              Four steps to get your money back
            </h2>
            <p className="mt-4 text-[15px] text-slate-500 leading-relaxed">
              No technical knowledge needed. No account linking. Just your bank
              statement PDF.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.number}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fade}
                custom={i}
                className="relative"
              >
                {/* Connector (desktop) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-4 left-[calc(100%+12px)] w-[calc(100%-24px)] h-px bg-slate-200 z-10" />
                )}
                <div className="p-6 rounded-xl border border-slate-200 bg-white h-full hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between mb-5">
                    <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                      <s.icon className="h-4 w-4 text-slate-500" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-300 tracking-widest">
                      {s.number}
                    </span>
                  </div>
                  <h3 className="text-[14px] font-semibold text-slate-900 mb-2">
                    {s.title}
                  </h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          WHY TRUST US
      ══════════════════════════════════════════════ */}
      <section id="trust" className="py-24 bg-white border-b border-slate-200">
        <div className="max-w-[1100px] mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fade}
            custom={0}
            className="max-w-[480px] mb-14"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 mb-4">
              Why trust us
            </p>
            <h2 className="text-[30px] md:text-[36px] font-bold text-slate-950 leading-[1.2] tracking-[-0.02em]">
              We work for you.
              <br />
              Not the financial institution.
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {trustPoints.map((t, i) => (
              <motion.div
                key={t.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fade}
                custom={i}
              >
                <div className="mb-4 h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                  <t.icon className="h-4 w-4 text-slate-500" />
                </div>
                <h3 className="text-[14px] font-semibold text-slate-900 mb-2">
                  {t.title}
                </h3>
                <p className="text-[13px] text-slate-500 leading-relaxed">
                  {t.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          UNIQUE ANGLE / DIFFERENTIATOR
      ══════════════════════════════════════════════ */}
      <section className="py-24 bg-slate-950 border-b border-slate-800">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="lg:grid lg:grid-cols-[1fr_1fr] lg:gap-16 lg:items-start">
            {/* Left */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fade}
              custom={0}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500 mb-4">
                What makes us different
              </p>
              <h2 className="text-[30px] md:text-[36px] font-bold text-white leading-[1.2] tracking-[-0.02em]">
                Your financial watchdog.
                <br />
                <span className="text-slate-400">
                  Not just another fintech app.
                </span>
              </h2>
              <p className="mt-5 text-[15px] text-slate-400 leading-relaxed max-w-[420px]">
                Most tools only monitor transactions going forward. KoboBack
                looks backward into your history to find errors that have
                already happened, ones you may have absorbed months ago without
                knowing.
              </p>
              <Link
                to="/waitlist"
                className="mt-8 inline-flex items-center gap-2 h-10 px-5 rounded-md bg-white text-slate-900 text-[13px] font-medium hover:bg-slate-100 transition-colors"
              >
                Join the waitlist <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            {/* Right — differentiator list */}
            <div className="mt-12 lg:mt-0 space-y-px">
              {differentiators.map((d, i) => (
                <motion.div
                  key={d.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fade}
                  custom={i}
                  className="flex items-start gap-4 p-5 border border-slate-800 rounded-xl mb-3 last:mb-0 hover:border-slate-700 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5 h-8 w-8 rounded-md bg-slate-800 flex items-center justify-center">
                    <d.icon className="h-4 w-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-white">
                      {d.title}
                    </p>
                    <p className="mt-1 text-[13px] text-slate-500 leading-relaxed">
                      {d.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════ */}
      <section className="py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-[1100px] mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fade}
            custom={0}
            className="mb-14"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 mb-4">
              What people are saying
            </p>
            <h2 className="text-[30px] md:text-[36px] font-bold text-slate-950 leading-[1.2] tracking-[-0.02em] max-w-[480px]">
              They thought their money was just gone.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fade}
                custom={i}
                className="p-6 rounded-xl border border-slate-200 bg-white"
              >
                <p className="text-[15px] text-slate-600 leading-relaxed mb-6">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-900">
                      {t.name}
                    </p>
                    <p className="text-[12px] text-slate-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PRICING
      ══════════════════════════════════════════════ */}
      <section id="pricing" className="py-24 bg-white border-b border-slate-200">
        <div className="max-w-[1100px] mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fade}
            custom={0}
            className="max-w-[480px] mb-14"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 mb-4">
              Pricing
            </p>
            <h2 className="text-[30px] md:text-[36px] font-bold text-slate-950 leading-[1.2] tracking-[-0.02em]">
              Simple, transparent pricing.
              <br />
              <span className="text-slate-400">Pay only for what you need.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Tier 1 — Free scan */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fade}
              custom={0}
              className="p-7 rounded-xl border border-slate-200 bg-white flex flex-col"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 mb-5">
                Free
              </p>
              <p className="text-[36px] font-bold text-slate-950 tracking-tight leading-none mb-1">
                ₦0
              </p>
              <p className="text-[13px] text-slate-400 mb-6">Always free</p>
              <p className="text-[15px] font-semibold text-slate-900 mb-2">
                Statement scan
              </p>
              <p className="text-[13px] text-slate-500 leading-relaxed mb-8">
                Upload your bank statement and get a high-level summary of
                potential errors — how many were found and what type they are.
                No cost, no card required.
              </p>
              <ul className="mt-auto space-y-2.5">
                {[
                  "AI-powered error detection",
                  'Summary report (e.g. "3 errors found")',
                  "No bank login required",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-slate-500">
                    <CheckCircle2 className="h-4 w-4 text-slate-300 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/waitlist"
                className="mt-8 inline-flex items-center justify-center h-10 px-4 rounded-md border border-slate-200 text-slate-700 text-[13px] font-medium hover:border-slate-300 hover:text-slate-900 transition-colors"
              >
                Get early access
              </Link>
            </motion.div>

            {/* Tier 2 — Full audit */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fade}
              custom={1}
              className="p-7 rounded-xl border-2 border-blue-600 bg-white flex flex-col relative"
            >
              <span className="absolute top-5 right-5 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                Most popular
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-blue-600 mb-5">
                Full audit
              </p>
              <p className="text-[36px] font-bold text-slate-950 tracking-tight leading-none mb-1">
                ₦2,000
              </p>
              <p className="text-[13px] text-slate-400 mb-6">One-time, per statement</p>
              <p className="text-[15px] font-semibold text-slate-900 mb-2">
                Detailed audit report
              </p>
              <p className="text-[13px] text-slate-500 leading-relaxed mb-8">
                A full breakdown of every flagged transaction — exact amounts,
                dates, error types, and a ready-to-send dispute letter for your
                bank.
              </p>
              <ul className="mt-auto space-y-2.5">
                {[
                  "Everything in Free",
                  "Itemised error breakdown",
                  "Dispute letter generated",
                  "Priority support",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/waitlist"
                className="mt-8 inline-flex items-center justify-center h-10 px-4 rounded-md bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 transition-colors"
              >
                Join the waitlist
              </Link>
            </motion.div>

            {/* Tier 3 — Recovery */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fade}
              custom={2}
              className="p-7 rounded-xl border border-slate-200 bg-white flex flex-col"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 mb-5">
                Recovery
              </p>
              <p className="text-[36px] font-bold text-slate-950 tracking-tight leading-none mb-1">
                20%
              </p>
              <p className="text-[13px] text-slate-400 mb-6">Of recovered amount only</p>
              <p className="text-[15px] font-semibold text-slate-900 mb-2">
                Managed recovery
              </p>
              <p className="text-[13px] text-slate-500 leading-relaxed mb-8">
                We handle the dispute process with your bank end-to-end. You
                only pay if we successfully recover your money — no recovery,
                no fee.
              </p>
              <ul className="mt-auto space-y-2.5">
                {[
                  "Everything in Full audit",
                  "We file the dispute for you",
                  "Bank follow-up & escalation",
                  "Success-only fee",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-slate-500">
                    <CheckCircle2 className="h-4 w-4 text-slate-300 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/waitlist"
                className="mt-8 inline-flex items-center justify-center h-10 px-4 rounded-md border border-slate-200 text-slate-700 text-[13px] font-medium hover:border-slate-300 hover:text-slate-900 transition-colors"
              >
                Get early access
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          WAITLIST CTA
      ══════════════════════════════════════════════ */}
      <section className="py-24 bg-white border-b border-slate-200">
        <div className="max-w-[1100px] mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fade}
            custom={0}
            className="max-w-[560px]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 mb-4">
              Early access
            </p>
            <h2 className="text-[30px] md:text-[40px] font-bold text-slate-950 leading-[1.15] tracking-[-0.02em]">
              Stop leaving your money
              <br />
              with the bank.
            </h2>
            <p className="mt-4 text-[15px] text-slate-500 leading-relaxed">
              Join the waitlist. Early members get priority access, a free
              first statement scan, and preferred rates on audit and recovery.
            </p>

            <Link
              to="/waitlist"
              className="mt-8 inline-flex items-center gap-2 h-11 px-5 rounded-md bg-blue-600 text-white text-[14px] font-medium hover:bg-blue-700 transition-colors"
            >
              Join the waitlist <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="mt-8 flex flex-wrap gap-4">
              {[
                "Free scan included",
                "No card required to start",
                "Encrypted & private",
              ].map((b) => (
                <span
                  key={b}
                  className="flex items-center gap-1.5 text-[12px] text-slate-500"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                  {b}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════ */}
      <section id="faq" className="py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-16">
            {/* Left label */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fade}
              custom={0}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 mb-4">
                FAQ
              </p>
              <h2 className="text-[24px] font-bold text-slate-950 leading-[1.25] tracking-[-0.02em]">
                Common questions, answered honestly.
              </h2>
              <p className="mt-4 text-[14px] text-slate-500 leading-relaxed">
                Anything else?{" "}
                <a
                  href="mailto:hello@koboback.com"
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Email us.
                </a>
              </p>
            </motion.div>

            {/* Right accordion */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fade}
              custom={1}
              className="mt-10 lg:mt-0"
            >
              {faqs.map((f) => (
                <FAQItem key={f.q} q={f.q} a={f.a} />
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer className="bg-white py-12">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            {/* Brand + tagline */}
            <div>
              <p className="text-[14px] font-semibold text-slate-950">
                KoboBack
              </p>
              <p className="mt-1 text-[13px] text-slate-400 max-w-[280px] leading-relaxed">
                The consumer financial watchdog for Nigeria. We find money your
                bank took that you didn't know about.
              </p>
            </div>

            {/* Nav columns */}
            <div className="flex gap-12 text-[13px]">
              <div className="flex flex-col gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Product
                </p>
                <a
                  href="#how-it-works"
                  className="text-slate-500 hover:text-slate-900 transition-colors"
                >
                  How it works
                </a>
                <a
                  href="#trust"
                  className="text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Why trust us
                </a>
                <Link
                  to="/waitlist"
                  className="text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Join waitlist
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Legal
                </p>
                <Link
                  to="/privacy"
                  className="text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Privacy policy
                </Link>
                <Link
                  to="/terms"
                  className="text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Terms of service
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-slate-400">
            <p>
              &copy; {new Date().getFullYear()} KoboBack. All rights reserved.
            </p>
            <p>Not affiliated with any bank or financial institution.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
