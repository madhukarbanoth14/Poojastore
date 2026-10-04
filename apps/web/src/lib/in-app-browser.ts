export function isInAppBrowser(userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent) {
  const ua = userAgent || "";
  return /Instagram|FBAN|FBAV|FB_IAB|Line\/|Twitter|WhatsApp|Snapchat|Pinterest|MicroMessenger|Bytedance|musical_ly|TikTok|; wv\)/i.test(
    ua,
  );
}

export function inAppBrowserName(userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent) {
  const ua = userAgent || "";
  if (/Instagram/i.test(ua)) return "Instagram";
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "Facebook";
  if (/WhatsApp/i.test(ua)) return "WhatsApp";
  if (/TikTok|musical_ly|Bytedance/i.test(ua)) return "TikTok";
  return "this app";
}

export function openInExternalBrowser() {
  if (typeof window === "undefined") return;
  const url = window.location.href;
  const ua = navigator.userAgent || "";
  if (/Android/i.test(ua)) {
    const parsed = new URL(url);
    window.location.href = `intent://${parsed.host}${parsed.pathname}${parsed.search}${parsed.hash}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`;
    return;
  }
  void navigator.clipboard?.writeText(url).catch(() => undefined);
}
