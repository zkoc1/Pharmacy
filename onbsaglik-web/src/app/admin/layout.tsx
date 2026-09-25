import type { Metadata } from "next";
import AdminNav from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: "Admin Paneli | OnbSağlık",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "Inter, sans-serif", minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* Global Responsive Admin Navigation */}
      <AdminNav />
      
      {/* Page Content */}
      <div className="admin-content-wrapper">
        {children}
      </div>
    </div>
  );
}
