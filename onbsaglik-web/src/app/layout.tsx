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

// Site geneli meta veriler — Google Arama Motoru ve Satın Alma Odaklı SEO
export const metadata: Metadata = {
  metadataBase: new URL("https://www.onbsaglik.com.tr"),
  title: {
    default: "OnbSağlık | Orijinal Eczane Ürünleri, Vitamin & Kozmetik Satın Al",
    template: "%s | OnbSağlık",
  },
  description:
    "Orijinal eczane güvencesiyle vitamin, besin takviyeleri, güneş kremi, saç dökülmesi ve cilt bakım ürünlerini en uygun fiyatlarla satın alın. Bioxcin, Alopexy, Minoxil, Ocean, Dermoskin, Bioderma ve 500+ ürün OnbSağlık'ta!",
  keywords: [
    "online eczane",
    "eczane satın al",
    "bioxcin satın al",
    "alopexy 5 sprey",
    "minoxil eczane",
    "ocean balık yağı satın al",
    "dermoskin satın al",
    "vitamin satın al",
    "takviye edici gıda",
    "saç dökülmesi şampuanı",
    "güneş kremi en ucuz",
    "cilt bakımı",
    "onbsaglik",
    "orijinal ecza deposu",
    "hızlı kargo eczane"
  ],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://www.onbsaglik.com.tr",
    siteName: "OnbSağlık",
    title: "OnbSağlık | Orijinal Eczane Ürünleri, Vitamin & Kozmetik Satın Al",
    description:
      "Orijinal eczane güvencesiyle vitamin, besin takviyeleri, güneş kremi, saç ve cilt bakım ürünlerini en uygun fiyatlarla güvenle satın alın.",
  },
  twitter: {
    card: "summary_large_image",
    title: "OnbSağlık | Orijinal Eczane Ürünleri & Kozmetik",
    description: "En uygun fiyatlı orijinal eczane ürünleri, aynı gün kargo avantajıyla OnbSağlık'ta.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "https://www.onbsaglik.com.tr",
  },
  verification: {
    google: "googlef78446fc680a2d1e",
  },
};

import SessionWrapper from "@/components/providers/SessionWrapper";
import MetaPixel from "@/components/analytics/MetaPixel";

const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Pharmacy",
      "@id": "https://www.onbsaglik.com.tr/#pharmacy",
      "name": "OnbSağlık",
      "url": "https://www.onbsaglik.com.tr",
      "logo": "https://www.onbsaglik.com.tr/logo.png",
      "image": "https://www.onbsaglik.com.tr/hero-banner.jpg",
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
      "@id": "https://www.onbsaglik.com.tr/#website",
      "url": "https://www.onbsaglik.com.tr",
      "name": "OnbSağlık",
      "description": "Vitamin, Takviye ve Dermokozmetik E-Ticaret Sitesi",
      "publisher": { "@id": "https://www.onbsaglik.com.tr/#pharmacy" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://www.onbsaglik.com.tr/ara?q={search_term_string}"
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
