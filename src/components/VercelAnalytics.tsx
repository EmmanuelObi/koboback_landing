import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import {
  COOKIE_CONSENT_CHANGE_EVENT,
  hasAnalyticsConsent,
  type CookieConsent,
} from "../lib/cookieConsent";

/** Loads Vercel Web Analytics only after the user accepts cookies. */
export default function VercelAnalytics() {
  const [enabled, setEnabled] = useState(hasAnalyticsConsent);

  useEffect(() => {
    setEnabled(hasAnalyticsConsent());

    const onConsentChange = (event: Event) => {
      const consent = (event as CustomEvent<CookieConsent>).detail;
      setEnabled(consent === "accepted");
    };

    window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, onConsentChange);
    return () =>
      window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, onConsentChange);
  }, []);

  if (!enabled) return null;

  return <Analytics />;
}
