import type { NextConfig } from "next";

// onbsaglik.com.tr Next.js yapılandırması
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Trendyol ürün görselleri — geçici kaynak (Faz 2'de R2'ye taşınacak)
        protocol: "https",
        hostname: "cdn.dsmcdn.com",
      },
      {
        // Cloudflare R2 — kalıcı görsel CDN (ileride aktif edilecek)
        protocol: "https",
        hostname: "cdn.onbsaglik.com.tr",
      },
    ],
  },
  // Güvenlik Başlıkları & CORS Yapılandırması (Madde 8, 9, 10)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paytr.com https://accounts.google.com https://appleid.apple.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: cdn.dsmcdn.com cdn.onbsaglik.com.tr https://*.paytr.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "frame-src 'self' https://www.paytr.com https://accounts.google.com https://appleid.apple.com",
              "connect-src 'self' https://www.paytr.com https://api.resend.com https://accounts.google.com",
            ].join("; "),
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NODE_ENV === "production" ? "https://onbsaglik.com.tr" : "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-Requested-With",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
