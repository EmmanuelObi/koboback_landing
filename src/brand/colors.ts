/** KoboBack brand palette — single source of truth for web and PDF. */

export const brandHex = {
  DEFAULT: "#85BB65",
  light: "#90EE90",
  muted: "#EAF6E4",
  dark: "#6FA048",
} as const;

export const brandRgb = {
  DEFAULT: [133, 187, 101] as const,
  light: [144, 238, 144] as const,
  muted: [234, 246, 228] as const,
  dark: [111, 160, 72] as const,
  onBrand: [255, 255, 255] as const,
  onBrandSubtle: [240, 250, 235] as const,
} as const;

/** Tailwind class shortcuts for consistent usage. */
export const brandClass = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  primaryText: "text-brand hover:text-brand-dark",
  lightBg: "bg-brand-muted",
  lightText: "text-brand-dark",
  ring: "focus:ring-brand/20 focus:border-brand",
} as const;
