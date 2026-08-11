import type { NextConfig } from "next";

// onbsaglik.com Next.js yapılandırması
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
        hostname: "cdn.onbsaglik.com",
      },
    ],
  },
};

export default nextConfig;
