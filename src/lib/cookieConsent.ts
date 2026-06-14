export type CookieConsent = "accepted" | "rejected";

const STORAGE_KEY = "koboback_cookie_consent";

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
  } catch {
    // Ignore quota / private-mode errors.
  }
}

export function hasAnalyticsConsent(): boolean {
  return getCookieConsent() === "accepted";
}
