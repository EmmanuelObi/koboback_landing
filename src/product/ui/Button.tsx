import { cn } from "./tokens";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-dark border border-transparent",
  secondary:
    "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:text-slate-950",
  ghost: "text-slate-600 hover:text-slate-950 hover:bg-slate-50 border border-transparent",
  danger: "bg-red-600 text-white hover:bg-red-700 border border-transparent",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
  size?: "md" | "sm";
}

export default function Button({
  variant = "primary",
  fullWidth,
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
        size === "md" ? "h-11 px-5 rounded-md text-[14px]" : "h-9 px-3.5 rounded-md text-[13px]",
        variants[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
