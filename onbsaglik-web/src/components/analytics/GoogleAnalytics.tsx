"use client";

import Script from "next/script";

/**
 * Google Analytics 4 (GA4) & Google Ads Dönüşüm Takip Bileşeni
 * Ortam değişkenlerinden NEXT_PUBLIC_GA_MEASUREMENT_ID (örn: G-XXXXXXXXXX)
 * veya NEXT_PUBLIC_GOOGLE_ADS_ID (örn: AW-XXXXXXXXXX) tanımlandığında otomatik devreye girer.
 */
export default function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const primaryId = gaId || adsId;

  if (!primaryId) return null;

  return (
    <>
      <Script
        id="google-gtag-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`}
      />
      <Script
        id="google-gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            ${gaId ? `gtag('config', '${gaId}', { page_path: window.location.pathname });` : ""}
            ${adsId ? `gtag('config', '${adsId}');` : ""}
          `,
        }}
      />
    </>
  );
}
