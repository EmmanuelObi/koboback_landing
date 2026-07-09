export type CookieConsent = "accepted" | "rejected";

const STORAGE_KEY = "koboback_cookie_consent";
export const COOKIE_CONSENT_CHANGE_EVENT = "koboback:cookie-consent-change";

/** Routes where the cookie banner is shown before consent is stored. */
export const PUBLIC_COOKIE_BANNER_PATHS = [
  "/",
  "/privacy",
  "/terms",
  "/waitlist",
] as const;

export function isPublicCookieBannerPath(pathname: string): boolean {
  return PUBLIC_COOKIE_BANNER_PATHS.includes(
    pathname as (typeof PUBLIC_COOKIE_BANNER_PATHS)[number],
  );
}

export function getCookieConsent(): CookieConsent | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "accepted" || value === "rejected") return value;
    return null;
  } catch {
    return null;
  }
}

export function setCookieConsent(consent: CookieConsent): void {
  try {
    localStorage.setItem(STORAGE_KEY, consent);
    window.dispatchEvent(
      new CustomEvent(COOKIE_CONSENT_CHANGE_EVENT, { detail: consent }),
    );
  } catch {
    // Ignore quota / private-mode errors.
  }
}

export function hasAnalyticsConsent(): boolean {
  return getCookieConsent() === "accepted";
}
