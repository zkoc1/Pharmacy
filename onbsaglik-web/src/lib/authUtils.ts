/**
 * Kullanıcı Kimlik Doğrulama & Oturum Yardımcıları.
 * NextAuth oturumu ve LocalStorage oturumunu güvenle kontrol eder.
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
    return !!(parsed && parsed.email && typeof parsed.email === "string" && parsed.email.includes("@"));
  } catch {
    return false;
  }
}

export function clearUserSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("user_session");
  localStorage.removeItem("admin_session");
}
