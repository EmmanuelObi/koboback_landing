/** KoboBack brand palette — single source of truth for web and PDF. */

export const brandHex = {
  DEFAULT: "#108C50",
  light: "#3AD48A",
  muted: "#EAF5F0",
  dark: "#0C693C",
} as const;

export const brandRgb = {
  DEFAULT: [16, 140, 80] as const,
  light: [58, 212, 138] as const,
  muted: [234, 245, 240] as const,
  dark: [12, 105, 60] as const,
  onBrand: [255, 255, 255] as const,
  onBrandSubtle: [239, 245, 242] as const,
} as const;

/** Tailwind class shortcuts for consistent usage. */
export const brandClass = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  primaryText: "text-brand hover:text-brand-dark",
  lightBg: "bg-brand-muted",
  lightText: "text-brand-dark",
  ring: "focus:ring-brand/20 focus:border-brand",
} as const;
