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
  metadataBase: new URL("https://onbsaglik.com.tr"),
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
    url: "https://onbsaglik.com.tr",
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
    canonical: "https://onbsaglik.com.tr",
  },
};

import SessionWrapper from "@/components/providers/SessionWrapper";
import MetaPixel from "@/components/analytics/MetaPixel";

const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Pharmacy",
      "@id": "https://onbsaglik.com.tr/#pharmacy",
      "name": "OnbSağlık",
      "url": "https://onbsaglik.com.tr",
      "logo": "https://onbsaglik.com.tr/logo.png",
      "image": "https://onbsaglik.com.tr/hero-banner.jpg",
      "description": "Orijinal eczane güvencesiyle vitamin, gıda takviyesi, dermokozmetik ve saç bakım ürünleri.",
      "telephone": "+905532723858",
      "priceRange": "₺₺",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Yeni Mahalle 12. Cadde No:95",
        "addressLocality": "Kocasinan",
        "addressRegion": "Kayseri",
        "postalCode": "38000",
        "addressCountry": "TR"
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          "opens": "08:30",
          "closes": "19:00"
        }
      ],
      "sameAs": [
        "https://www.instagram.com/onbsaglik"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://onbsaglik.com.tr/#website",
      "url": "https://onbsaglik.com.tr",
      "name": "OnbSağlık",
      "description": "Vitamin, Takviye ve Dermokozmetik E-Ticaret Sitesi",
      "publisher": { "@id": "https://onbsaglik.com.tr/#pharmacy" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://onbsaglik.com.tr/ara?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body>
        <MetaPixel />
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
