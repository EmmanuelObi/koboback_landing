import { motion, useScroll, useTransform } from "framer-motion";
import {
  FileSearch,
  ShieldAlert,
  BadgeInfo,
  TableProperties,
  Upload,
  Cpu,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { useRef } from "react";

/* ─── animation variants ─── */
const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: "easeOut" },
  }),
};

const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

/* ─── data ─── */
const features = [
  {
    icon: FileSearch,
    title: "Intelligent Parsing",
    desc: "Advanced OCR technology effortlessly extracts text, handwriting, and data from scanned documents.",
    color: "bg-blue-500",
  },
  {
    icon: ShieldAlert,
    title: "Flagged Transactions",
    desc: "Automatic detection of suspicious transactions so you can review anomalies directly from your dashboard.",
    color: "bg-red-500",
  },
  {
    icon: BadgeInfo,
    title: "Risk Assessment",
    desc: "Dynamically generated risk badges identify compliance gaps at a glance, giving you instant clarity.",
    color: "bg-amber-500",
  },
  {
    icon: TableProperties,
    title: "Compliance Reports",
    desc: "Generate structured compliance tables for a comprehensive overview of every auditing result.",
    color: "bg-emerald-500",
  },
];

const steps = [
  {
    icon: Upload,
    title: "Upload",
    desc: "Drop your financial documents — PDFs, images, or scans.",
  },
  {
    icon: Cpu,
    title: "Analyze",
    desc: "Our AI engine parses, sanitizes, and audits the data automatically.",
  },
  {
    icon: BarChart3,
    title: "Review",
    desc: "Browse flagged items, risk badges, and compliance tables in a clear report.",
  },
  {
    icon: CheckCircle2,
    title: "Act",
    desc: "Export findings and resolve issues with confidence.",
  },
];

/* ─── component ─── */
const App = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <span className="text-2xl font-bold tracking-tight text-blue-600">
            KoboBack
          </span>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-gray-900 transition">
              How It Works
            </a>
            <a href="#cta" className="hover:text-gray-900 transition">
              Get Started
            </a>
          </div>
          <a
            href="#cta"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-md shadow-blue-600/20"
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 pt-32 pb-24 lg:pt-44 lg:pb-36"
      >
        {/* decorative blobs */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-60 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-4 px-4 py-1 rounded-full bg-white/10 text-blue-100 text-sm font-medium backdrop-blur-sm"
          >
            AI-Powered Compliance Auditing
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight"
          >
            Automate your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-200">
              compliance audits
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-6 text-lg md:text-xl text-blue-100 max-w-2xl mx-auto"
          >
            Upload financial documents and let our AI engine parse, summarize,
            flag suspicious transactions, and deliver instant compliance reports
            — all in minutes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="#cta"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-700 font-bold text-lg hover:bg-blue-50 transition shadow-lg shadow-black/10"
            >
              Start Auditing <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-white/30 text-white font-semibold text-lg hover:bg-white/10 transition"
            >
              Learn More
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-16"
          >
            <a href="#features" aria-label="Scroll down">
              <ChevronDown className="mx-auto h-8 w-8 text-white/50 animate-bounce" />
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeIn}
            custom={0}
            className="text-center mb-16"
          >
            <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 rounded-full">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              A smarter way to audit
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Everything you need to maintain continuous compliance — without
              the manual overhead.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeIn}
                custom={i}
                className="group relative bg-gray-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100"
              >
                <div
                  className={`inline-flex items-center justify-center h-14 w-14 rounded-xl ${f.color} text-white mb-5 shadow-lg shadow-${f.color}/30`}
                >
                  <f.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeIn}
            custom={0}
            className="text-center mb-16"
          >
            <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 rounded-full">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Four steps to full compliance
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              From document upload to actionable insights — the entire workflow
              is automated.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* connector line (desktop) */}
            <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-emerald-300" />

            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={i % 2 === 0 ? slideInLeft : slideInRight}
                className="relative text-center"
              >
                <div className="relative z-10 mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-white shadow-lg border-4 border-blue-100 mb-6">
                  <s.icon className="h-10 w-10 text-blue-600" />
                </div>
                <span className="inline-block mb-1 text-xs font-bold text-blue-500 uppercase tracking-widest">
                  Step {i + 1}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {s.title}
                </h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats / Social Proof ── */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center"
          >
            {[
              { value: "10k+", label: "Documents Audited" },
              { value: "99.2%", label: "Accuracy Rate" },
              { value: "<5 min", label: "Avg Processing Time" },
              { value: "250+", label: "Companies Trust Us" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl sm:text-5xl font-extrabold">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-blue-200 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="cta" className="py-24 bg-white">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={scaleUp}
          className="max-w-3xl mx-auto text-center px-4 sm:px-6"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Ready to modernize your audits?
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
            Join hundreds of compliance teams already saving hours every week
            with KoboBack.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/25"
            >
              Get Started Free <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-lg hover:border-gray-300 hover:bg-gray-50 transition"
            >
              See Features
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-white font-bold text-lg">KoboBack</span>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} KoboBack, Inc. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
