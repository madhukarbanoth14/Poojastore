"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { captureAttribution, trackPageView } from "@/lib/analytics";

export function Analytics({
  gaMeasurementId,
  metaPixelId,
}: {
  gaMeasurementId?: string;
  metaPixelId?: string;
}) {
  const path = usePathname();
  const gaId = gaMeasurementId?.trim() ?? "";
  const pixelId = metaPixelId?.trim() ?? "";

  useEffect(() => {
    captureAttribution();
    if (!gaId && !pixelId) return;
    const query = typeof window !== "undefined" ? window.location.search : "";
    let tries = 0;
    const id = window.setInterval(() => {
      tries += 1;
      const ready = Boolean(window.gtag || window.fbq);
      if (ready || tries > 25) {
        window.clearInterval(id);
        trackPageView(`${path}${query}`);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [path, gaId, pixelId]);

  if (!gaId && !pixelId) return null;

  return (
    <>
      {gaId ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ps-ga4" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', { send_page_view: false, anonymize_ip: true });
            `}
          </Script>
        </>
      ) : null}
      {pixelId ? (
        <Script id="ps-meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
          `}
        </Script>
      ) : null}
    </>
  );
}
