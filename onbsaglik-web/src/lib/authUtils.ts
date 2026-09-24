/**
 * Kullanıcı Kimlik Doğrulama & Oturum Yardımcıları.
 * NextAuth oturumu, Admin oturumu ve oturum sürelerini (timeout) güvenle yönetir.
 */

// Oturum Süreleri
export const ADMIN_SESSION_HOURS = 4; // Admin oturumu 4 saat geçerlidir
export const ADMIN_SESSION_MS = ADMIN_SESSION_HOURS * 60 * 60 * 1000;

export const USER_SESSION_HOURS = 24; // Müşteri oturumu 24 saat geçerlidir
export const USER_SESSION_MS = USER_SESSION_HOURS * 60 * 60 * 1000;

export interface AdminSessionData {
  email: string;
  role: string;
  loginAt: number;
  expiresAt: number;
}

/**
 * Admin oturumunu 4 saatlik son kullanma tarihiyle birlikte kaydeder.
 */
export function setAdminSession(user: { email: string; role?: string }) {
  if (typeof window === "undefined") return;
  const now = Date.now();
  const sessionData: AdminSessionData = {
    email: user.email,
    role: user.role || "admin",
    loginAt: now,
    expiresAt: now + ADMIN_SESSION_MS,
  };
  localStorage.setItem("admin_session", JSON.stringify(sessionData));
}

/**
 * Geçerli ve süresi dolmamış Admin oturumunu döner; süresi dolduysa otomatik temizler.
 */
export function getValidAdminSession(): AdminSessionData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("admin_session");
  if (!raw || raw === "null" || raw === "undefined") return null;

  try {
    const parsed = JSON.parse(raw) as Partial<AdminSessionData>;
    const now = Date.now();

    // Süre kontrolü: expiresAt yoksa veya şimdiki zamanı geçmişse oturumu düşür
    if (!parsed.expiresAt || now > parsed.expiresAt) {
      localStorage.removeItem("admin_session");
      return null;
    }

    if (parsed.role === "super_admin" || parsed.role === "admin") {
      return parsed as AdminSessionData;
    }

    localStorage.removeItem("admin_session");
    return null;
  } catch {
    localStorage.removeItem("admin_session");
    return null;
  }
}

/**
 * Admin oturumunu sonlandırır.
 */
export function clearAdminSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("admin_session");
}

/**
 * Normal kullanıcı oturum durumunu kontrol eder (NextAuth ve LocalStorage süre kontrolüyle).
 */
export function isUserLoggedIn(sessionUser?: { email?: string | null } | null): boolean {
  if (sessionUser && sessionUser.email && sessionUser.email.includes("@")) {
    return true;
  }
  if (typeof window === "undefined") return false;
  
  const raw = localStorage.getItem("user_session");
  if (!raw || raw === "null" || raw === "undefined" || raw === "{}") {
    return false;
  }
  
  try {
    const parsed = JSON.parse(raw);
    // Müşteri oturum süresi kontrolü
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem("user_session");
      return false;
    }
    return !!(parsed && parsed.email && typeof parsed.email === "string" && parsed.email.includes("@"));
  } catch {
    return false;
  }
}

/**
 * Müşteri oturumunu süresiyle kaydeder.
 */
export function setUserSession(user: { email: string; name?: string }) {
  if (typeof window === "undefined") return;
  const now = Date.now();
  const sessionData = {
    ...user,
    loginAt: now,
    expiresAt: now + USER_SESSION_MS,
  };
  localStorage.setItem("user_session", JSON.stringify(sessionData));
}

export function clearUserSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("user_session");
  localStorage.removeItem("admin_session");
}
