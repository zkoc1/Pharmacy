/**
 * Admin layout — Header içermez, kendi navigasyonu var.
 * Admin sayfaları için ayrı bir layout şablonu.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Paneli | OnbSağlık",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // Admin paneli için header/footer gizlenir
    <div style={{ fontFamily: "Inter, sans-serif" }}>{children}</div>
  );
}
