import { Link } from "react-router-dom";

type LogoVariant = "full" | "mark";
type LogoSize = "sm" | "md" | "lg";

const heights: Record<LogoSize, string> = {
  sm: "h-6",
  md: "h-7",
  lg: "h-8",
};

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  to?: string;
}

export default function Logo({
  variant = "full",
  size = "md",
  className = "",
  to,
}: LogoProps) {
  const src = variant === "mark" ? "/logo-mark.svg" : "/logo.svg";
  const alt = "KoboBack";
  const img = (
    <img
      src={src}
      alt={alt}
      className={`${heights[size]} w-auto ${className}`}
    />
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex shrink-0">
        {img}
      </Link>
    );
  }

  return img;
}
