/**
 * Root layout — tüm sayfaları saran ana şablon.
 * Google Fonts, metadata ve global bileşenleri buraya ekliyoruz.
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Inter fontu — 400, 500, 600, 700 ağırlıkları
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Site geneli meta veriler — SEO için kritik
export const metadata: Metadata = {
  title: {
    default: "OnbSağlık | Vitamin, Takviye ve Kozmetik Ürünler",
    template: "%s | OnbSağlık",
  },
  description:
    "Vitamin, takviye besin, güneş kremi, saç ve cilt bakım ürünlerini güvenle satın alın. Ocean, Dermoskin, Nutraxin, Bioxcin ve daha fazlası.",
  keywords: [
    "vitamin",
    "takviye",
    "güneş kremi",
    "saç bakımı",
    "cilt bakımı",
    "kozmetik",
    "onbsaglik",
    "online eczane",
  ],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://onbsaglik.com",
    siteName: "OnbSağlık",
    title: "OnbSağlık | Vitamin, Takviye ve Kozmetik Ürünler",
    description:
      "Vitamin, takviye besin, güneş kremi, saç ve cilt bakım ürünlerini güvenle satın alın.",
  },
  twitter: {
    card: "summary_large_image",
    title: "OnbSağlık | Vitamin, Takviye ve Kozmetik",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: "https://onbsaglik.com",
  },
};

import SessionWrapper from "@/components/providers/SessionWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={inter.variable}>
      <body>
        <SessionWrapper>
          {/* Üst navigasyon çubuğu */}
          <Header />

          {/* Sayfa içeriği */}
          <main>{children}</main>

          {/* Alt bilgi alanı */}
          <Footer />
        </SessionWrapper>
      </body>
    </html>
  );
}
