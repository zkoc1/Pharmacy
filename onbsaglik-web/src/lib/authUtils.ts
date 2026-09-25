/**
 * Kullanıcı Kimlik Doğrulama & Oturum Yardımcıları.
 * NextAuth oturumu, Admin oturumu ve oturum sürelerini (timeout) güvenle yönetir.
 */

// Oturum Süreleri
export const ADMIN_SESSION_HOURS = 24; // Admin oturumu 24 saat geçerlidir
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
 * Admin oturumunu 24 saatlik son kullanma tarihiyle birlikte kaydeder.
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
 * İstemci oturumu ile sunucu çerezi senkronizasyonu:
 * LocalStorage boşsa veya temizlendiyse sunucudan çerez durumunu (/api/admin/auth) sorgular.
 * Çerez geçerliyse oturumu otomatik re-hydrate eder (kurtarır).
 */
export async function restoreAdminSessionIfNeeded(): Promise<AdminSessionData | null> {
  if (typeof window === "undefined") return null;

  const local = getValidAdminSession();
  if (local) return local;

  try {
    const res = await fetch("/api/admin/auth");
    if (res.ok) {
      const data = await res.json();
      if (data.authenticated && data.user) {
        setAdminSession(data.user);
        return getValidAdminSession();
      }
    }
  } catch (err) {
    console.error("Admin oturumu geri yükleme hatası:", err);
  }
  return null;
}

/**
 * Sayfa ilk yüklendiğinde oturumu doğrular.
 * Oturum yoksa login sayfasına yönlendirir.
 */
export async function ensureAdminAuth(): Promise<boolean> {
  const session = await restoreAdminSessionIfNeeded();
  if (!session) {
    if (typeof window !== "undefined") {
      window.location.href = "/admin/giris?expired=1";
    }
    return false;
  }
  return true;
}

/**
 * Admin oturumunu sonlandırır ve çerezleri sunucudan siler.
 */
export async function logoutAdmin() {
  try {
    await fetch("/api/admin/auth", { method: "DELETE" });
  } catch {}
  clearAdminSession();
  if (typeof window !== "undefined") {
    window.location.href = "/admin/giris";
  }
}

/**
 * Admin oturumunu yerel depolamadan temizler.
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
