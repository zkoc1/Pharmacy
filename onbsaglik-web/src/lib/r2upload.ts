/**
 * R2 görsel yükleme yardımcısı — Tarayıcıdan presigned URL alıp doğrudan R2'ye yükler.
 * Admin panel görsel yükleme ve Trendyol görsel taşıma scripti için kullanılır.
 */

// Bu script hem tarayıcı hem Node.js ortamında çalışacak şekilde yazıldı.

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Tarayıcıdan bir File nesnesini R2'ye yükler.
 * Önce backend'den presigned URL alır, sonra doğrudan R2'ye PUT isteği gönderir.
 *
 * @param file - Yüklenecek dosya
 * @param authToken - Admin JWT token'ı
 */
export async function uploadImageToR2(
  file: File,
  authToken: string
): Promise<UploadResult> {
  try {
    // 1. Backend'den imzalı yükleme URL'si al
    const presignRes = await fetch(
      `/api/upload/presign?filename=${encodeURIComponent(file.name)}&mimetype=${encodeURIComponent(file.type)}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    if (!presignRes.ok) {
      return { success: false, error: "Yükleme izni alınamadı." };
    }

    const { url, key } = await presignRes.json() as { url: string; key: string };

    // 2. Dosyayı doğrudan R2'ye yükle (presigned URL kullanarak)
    const uploadRes = await fetch(url, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    if (!uploadRes.ok) {
      return { success: false, error: "R2'ye yükleme başarısız." };
    }

    // 3. CDN URL'sini oluştur
    const cdnUrl = `${process.env.NEXT_PUBLIC_CDN_URL ?? ""}/${key}`;
    return { success: true, url: cdnUrl };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * Next.js API route — POST /api/upload
 * Multipart form upload: görsel alıp NestJS upload servisine iletir.
 */
export async function uploadViaApi(
  file: File,
  authToken: string
): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${authToken}` },
    body: form,
  });

  if (!res.ok) return { success: false, error: "Yükleme başarısız." };
  const data = await res.json() as { url: string };
  return { success: true, url: data.url };
}
