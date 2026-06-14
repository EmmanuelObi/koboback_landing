import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getCookieConsent,
  isPublicCookieBannerPath,
  setCookieConsent,
  type CookieConsent,
} from "../lib/cookieConsent";

export default function CookieBanner() {
  const { pathname } = useLocation();
  const [consent, setConsent] = useState<CookieConsent | null>(() =>
    getCookieConsent(),
  );

  const visible =
    consent === null && isPublicCookieBannerPath(pathname);

  function saveChoice(choice: CookieConsent) {
    setCookieConsent(choice);
    setConsent(choice);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
          className="fixed inset-x-0 bottom-0 z-[60] p-4 sm:p-6 pointer-events-none"
        >
          <div className="pointer-events-auto max-w-[1100px] mx-auto rounded-xl border border-brand/15 bg-white shadow-lg shadow-slate-900/10 p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-[640px]">
                <p className="text-[14px] font-semibold text-slate-900">
                  Cookies Usage
                </p>
                <p className="mt-1.5 text-[13px] text-slate-500 leading-relaxed">
                  KoboBack may use strictly necessary cookies to keep the site
                  functional in the future. With your permission, we may also
                  use analytics cookies to understand how the site is used. See
                  our{" "}
                  <Link
                    to="/privacy"
                    className="text-brand hover:text-brand-dark transition-colors"
                  >
                    Privacy Policy
                  </Link>{" "}
                  for details.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => saveChoice("rejected")}
                  className="h-10 px-4 rounded-md border border-brand/20 text-slate-700 text-[13px] font-medium hover:border-brand/40 hover:text-brand-dark transition-colors"
                >
                  Reject non-essential
                </button>
                <button
                  type="button"
                  onClick={() => saveChoice("accepted")}
                  className="h-10 px-4 rounded-md bg-brand text-white text-[13px] font-medium hover:bg-brand-dark transition-colors"
                >
                  Accept all
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
