/**
 * Türkiye Zaman Dilimi (Europe/Istanbul - GMT+3) Tarih & Saat Formatlayıcıları
 * Tüm sipariş, kargo, admin ve bildirim zamanlarında sunucu UTC farkını önler.
 */

export function formatTurkeyDateTime(date: string | Date | number | null | undefined): string {
  if (!date) return "";
  try {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString("tr-TR", {
      timeZone: "Europe/Istanbul",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "";
  }
}

export function formatTurkeyDate(date: string | Date | number | null | undefined): string {
  if (!date) return "";
  try {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("tr-TR", {
      timeZone: "Europe/Istanbul",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function formatTurkeyTime(date: string | Date | number | null | undefined): string {
  if (!date) return "";
  try {
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("tr-TR", {
      timeZone: "Europe/Istanbul",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}
