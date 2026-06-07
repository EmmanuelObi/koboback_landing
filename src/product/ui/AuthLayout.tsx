import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "../../components/Logo";

export default function AuthLayout({
  backTo = "/",
  backLabel = "Back to home",
  children,
  wide = false,
}: {
  backTo?: string;
  backLabel?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased flex flex-col">
      <header className="fixed inset-x-0 top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-[1100px] mx-auto px-6 h-14 flex items-center justify-between">
          <Logo to="/product/dashboard" size="md" />
          <Link
            to={backTo}
            className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {backLabel}
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center pt-28 pb-24 px-6">
        <div className={wide ? "w-full max-w-[640px]" : "w-full max-w-[520px]"}>
          {children}
        </div>
      </main>
    </div>
  );
}
