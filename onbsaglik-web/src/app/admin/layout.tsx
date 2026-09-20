import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Paneli | OnbSağlık",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "Inter, sans-serif", minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* Global Admin Navigation Bar */}
      <div className="bg-[#0f172a] text-white p-3 z-50 shadow-md flex items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
            ← Yönetici Paneli Anasayfa
          </Link>
          <span className="text-gray-600">|</span>
          <Link href="/admin/urunler" className="hover:text-emerald-400 transition-colors">Ürünler</Link>
          <Link href="/admin/siparisler" className="hover:text-emerald-400 transition-colors">Siparişler</Link>
          <Link href="/admin/kampanyalar" className="hover:text-emerald-400 transition-colors">Kampanyalar</Link>
          <Link href="/admin/yorumlar" className="hover:text-emerald-400 transition-colors">Yorumlar</Link>
          <Link href="/admin/sorular" className="hover:text-emerald-400 transition-colors">Soru/Cevap</Link>
        </div>
        <div>
          <Link href="/" className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
            Siteye Dön 🏠
          </Link>
        </div>
      </div>
      
      {/* Page Content */}
      <div className="admin-content-wrapper">
        {children}
      </div>
    </div>
  );
}
