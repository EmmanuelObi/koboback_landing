/** Detect browsers where <input type="file"> is often broken on Android. */

export type UploadBrowserInfo = {
  isAndroid: boolean;
  /** True Chrome for Android (not WebView / in-app). */
  isRealChrome: boolean;
  /** In-app WebView / embedded browser that commonly breaks file picks */
  restricted: boolean;
  appName: string | null;
};

const IN_APP_RULES: Array<{ re: RegExp; name: string }> = [
  { re: /WABusiness|WAToA|WA4A|WhatsApp/i, name: "WhatsApp" },
  { re: /FBAN|FBAV|FB_IAB|FB4A/i, name: "Facebook" },
  { re: /Instagram/i, name: "Instagram" },
  { re: /LinkedInApp/i, name: "LinkedIn" },
  { re: /Twitter/i, name: "X / Twitter" },
  { re: /GSA\//i, name: "Google App" },
  { re: /Line\//i, name: "LINE" },
  { re: /MicroMessenger|WeChat/i, name: "WeChat" },
  { re: /TikTok|musical_ly|BytedanceWebview/i, name: "TikTok" },
  { re: /Snapchat/i, name: "Snapchat" },
  { re: /Telegram/i, name: "Telegram" },
];

export function getUploadBrowserInfo(): UploadBrowserInfo {
  if (typeof navigator === "undefined") {
    return {
      isAndroid: false,
      isRealChrome: false,
      restricted: false,
      appName: null,
    };
  }

  const ua = navigator.userAgent || "";
  const isAndroid = /Android/i.test(ua);
  const isWebView = /;\s*wv\)/i.test(ua);

  for (const rule of IN_APP_RULES) {
    if (rule.re.test(ua)) {
      return {
        isAndroid,
        isRealChrome: false,
        restricted: true,
        appName: rule.name,
      };
    }
  }

  if (isAndroid && isWebView) {
    return {
      isAndroid,
      isRealChrome: false,
      restricted: true,
      appName: "in-app browser",
    };
  }

  const isRealChrome =
    isAndroid &&
    /Chrome\//i.test(ua) &&
    !/Edg\//i.test(ua) &&
    !/OPR\//i.test(ua) &&
    !/SamsungBrowser/i.test(ua) &&
    !isWebView;

  return { isAndroid, isRealChrome, restricted: false, appName: null };
}

/** Best-effort open current page in Chrome on Android. */
export function openInChrome(url: string = window.location.href): void {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    const hostAndPath = `${parsed.host}${parsed.pathname}${parsed.search}${parsed.hash}`;
    const intent = `intent://${hostAndPath}#Intent;scheme=${parsed.protocol.replace(":", "")};package=com.android.chrome;end`;
    window.location.href = intent;
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
