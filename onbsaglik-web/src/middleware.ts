/**
 * Next.js Edge Middleware — Güvenlik, Sunucu Yetkilendirmesi & Rate Limiting.
 * 23 Madde Güvenlik Standartları:
 * - Madde 3: İzin kurallarını yaz (RBAC)
 * - Madde 4: Yetkiyi sunucuda tut (Server-side Route Guard)
 * - Madde 5: Girişe sınır koy (IP-based Rate Limiter)
 * - Madde 18: Admin'e rol koy
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Basit ve performanslı In-Memory Rate Limiter (Edge uyumlu)
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // Periyodik hafıza temizliği (bellek sızıntısını önler)
  if (rateLimitMap.size > 5000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (val.resetAt < now) rateLimitMap.delete(key);
    }
  }

  if (!record || record.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";

  // =========================================================================
  // 1. RATE LIMITING (Madde 5: Girişe Sınır Koy)
  // =========================================================================
  const isAuthRoute =
    pathname.startsWith("/api/auth") ||
    pathname === "/admin/giris" ||
    pathname === "/api/admin/auth" ||
    pathname === "/hesabim/giris";

  if (isAuthRoute && request.method === "POST") {
    // Auth rotalarında IP başına 1 dakikada en fazla 5 istek (Brute-force koruması)
    const allowed = checkRateLimit(`auth_${ip}`, 5, 60 * 1000);
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({
          error: "Çok fazla giriş denemesi yapıldı. Güvenliğiniz için lütfen 1 dakika sonra tekrar deneyin.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      );
    }
  }

  const isCheckoutRoute = pathname.startsWith("/api/checkout");
  if (isCheckoutRoute && request.method === "POST") {
    // Ödeme oluşturma rotalarında dakikada en fazla 10 istek
    const allowed = checkRateLimit(`checkout_${ip}`, 10, 60 * 1000);
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: "İşlem sınırına ulaşıldı. Lütfen biraz bekleyin." }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } }
      );
    }
  }

  // =========================================================================
  // 2. SUNUCU TARAFLI ADMİN PANELİ KORUMASI (Madde 3, 4, 18)
  // =========================================================================
  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/giris";
  const isAdminApi = pathname.startsWith("/api/admin") && pathname !== "/api/admin/auth";

  if (isAdminPage || isAdminApi) {
    const adminToken = request.cookies.get("admin_token")?.value;

    let isValidAdmin = false;
    let userRole = "none";

    if (adminToken) {
      try {
        // Token formatı: base64(email:role:timestamp)
        const decoded = atob(adminToken);
        const parts = decoded.split(":");
        if (parts.length >= 3) {
          const [email, role, timeStr] = parts;
          const timestamp = parseInt(timeStr, 10);
          // Token 7 gün geçerli olsun
          const isExpired = Date.now() - timestamp > 7 * 24 * 60 * 60 * 1000;
          if (!isExpired && (role === "super_admin" || role === "admin")) {
            isValidAdmin = true;
            userRole = role;
          }
        }
      } catch (err) {
        console.error("Middleware decode error:", err);
        isValidAdmin = false;
      }
    }

    // Yetkisiz Admin Sayfası Erişimi -> Sunucuda Anında Giriş Sayfasına Yönlendir
    if (isAdminPage && !isValidAdmin) {
      const loginUrl = new URL("/admin/giris", request.url);
      loginUrl.searchParams.set("unauthorized", "1");
      return NextResponse.redirect(loginUrl);
    }

    // Yetkisiz Admin API Erişimi -> 401 Unauthorized Dön
    if (isAdminApi && !isValidAdmin) {
      return new NextResponse(
        JSON.stringify({ error: "Yetkisiz erişim. Yönetici oturumu gereklidir." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/auth/:path*",
    "/api/checkout/:path*",
    "/hesabim/giris",
  ],
};
