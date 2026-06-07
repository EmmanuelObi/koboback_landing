import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  ArrowUpRight,
  LayoutDashboard,
  Menu,
  Upload,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "../../components/Logo";
import { cn } from "../ui/tokens";

interface ProductLayoutProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  title?: string;
  description?: string;
}

const navItems = [
  { to: "/product/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/product/statements", label: "Statements", icon: Upload, end: true },
  { to: "/product/profile", label: "Profile", icon: User },
];

function NavItem({
  to,
  label,
  icon: Icon,
  end,
  onClick,
}: {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors",
          isActive
            ? "bg-slate-100 text-slate-950"
            : "text-slate-600 hover:text-slate-950 hover:bg-slate-50",
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0 opacity-70" />
      {label}
    </NavLink>
  );
}

export default function ProductLayout({
  children,
  actions,
  title,
  description,
}: ProductLayoutProps) {
  const { user, profile } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <>
      <div className="h-14 flex items-center px-5 border-b border-slate-200 shrink-0">
        <Logo to="/product/dashboard" size="md" />
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            {...item}
            onClick={() => setMobileOpen(false)}
          />
        ))}
      </nav>

      <div className="p-3 border-t border-slate-200 space-y-2 shrink-0">
        {user && (
          <div className="px-3 py-2">
            <p className="text-[13px] font-medium text-slate-950 truncate">
              {profile?.full_name ?? user.email?.split("@")[0]}
            </p>
            <p className="text-[12px] text-slate-400 truncate">{user.email}</p>
          </div>
        )}
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 rounded-md text-[12px] text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
        >
          Marketing site
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      {/* Mobile header */}
      <header className="lg:hidden fixed inset-x-0 top-0 z-40 bg-white border-b border-slate-200">
        <div className="h-14 px-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-md text-slate-600 hover:bg-slate-50"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Logo to="/product/dashboard" size="sm" />
          <div className="w-9" />
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/20"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <aside className="absolute inset-y-0 left-0 w-[260px] bg-white border-r border-slate-200 flex flex-col shadow-xl">
            <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200">
              <span className="text-[15px] font-semibold text-slate-950">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-md text-slate-600 hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-[240px] fixed inset-y-0 left-0 flex-col border-r border-slate-200 bg-white">
          {sidebar}
        </aside>

        {/* Main */}
        <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen pt-14 lg:pt-0">
          {(title || actions) && (
            <div className="border-b border-slate-200 bg-white">
              <div className="max-w-[960px] mx-auto px-6 py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {title && (
                    <h1 className="text-[18px] font-semibold text-slate-950 tracking-tight">
                      {title}
                    </h1>
                  )}
                  {description && (
                    <p className="text-[13px] text-slate-500 mt-0.5">
                      {description}
                    </p>
                  )}
                </div>
                {actions && (
                  <div className="flex items-center gap-2 shrink-0">{actions}</div>
                )}
              </div>
            </div>
          )}

          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
