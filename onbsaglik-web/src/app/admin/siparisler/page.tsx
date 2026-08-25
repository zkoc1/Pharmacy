/**
 * Admin Sipariş Yönetim Paneli — /admin/siparisler
 * Tüm siparişleri listeler, durum günceller, kargo takip no girer.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package, Truck, CheckCircle, Clock, XCircle, Search, ArrowLeft,
  ChevronDown, ChevronUp, Eye, Hash, StickyNote, Filter,
} from "lucide-react";
import { useOrderStore, OrderRecord, OrderStatus } from "@/stores/orderStore";
import { formatPrice } from "@/lib/products";

const STATUS_CONFIG: Record<OrderStatus, { color: string; bg: string; icon: React.ReactNode }> = {
  "Ödeme Bekliyor": { color: "#f59e0b", bg: "#fef3c7", icon: <Clock size={14} /> },
  "Hazırlanıyor":   { color: "#3b82f6", bg: "#dbeafe", icon: <Package size={14} /> },
  "Kargoda":        { color: "#8b5cf6", bg: "#ede9fe", icon: <Truck size={14} /> },
  "Teslim Edildi":  { color: "#10b981", bg: "#d1fae5", icon: <CheckCircle size={14} /> },
  "İptal Edildi":   { color: "#ef4444", bg: "#fee2e2", icon: <XCircle size={14} /> },
};

const ALL_STATUSES: OrderStatus[] = ["Ödeme Bekliyor", "Hazırlanıyor", "Kargoda", "Teslim Edildi", "İptal Edildi"];

export default function AdminSiparisler() {
  const router = useRouter();
  const { orders, updateOrderStatus, updateTrackingNumber, updateAdminNote } = useOrderStore();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editTrack, setEditTrack] = useState<Record<string, string>>({});
  const [editNote, setEditNote] = useState<Record<string, string>>({});
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("admin_session");
    if (!raw) { router.replace("/admin/giris"); return; }
    try {
      const p = JSON.parse(raw);
      if (p.role === "super_admin" || p.role === "admin") setIsAuthorized(true);
      else router.replace("/admin/giris");
    } catch { router.replace("/admin/giris"); }
  }, [router]);

  const filtered = orders.filter((o) => {
    const matchSearch = !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    setSaveMsg(`✅ Sipariş ${orderId} durumu "${newStatus}" olarak güncellendi.`);
    setTimeout(() => setSaveMsg(""), 2500);
  };

  const handleSaveTracking = (orderId: string) => {
    updateTrackingNumber(orderId, editTrack[orderId] || "");
    setSaveMsg(`📦 Kargo takip no kaydedildi: ${editTrack[orderId]}`);
    setTimeout(() => setSaveMsg(""), 2500);
  };

  const handleSaveNote = (orderId: string) => {
    updateAdminNote(orderId, editNote[orderId] || "");
    setSaveMsg(`📝 Not kaydedildi.`);
    setTimeout(() => setSaveMsg(""), 2000);
  };

  const stats = {
    total: orders.length,
    hazirlaniyor: orders.filter((o) => o.status === "Hazırlanıyor").length,
    kargoda: orders.filter((o) => o.status === "Kargoda").length,
    teslim: orders.filter((o) => o.status === "Teslim Edildi").length,
  };

  if (!isAuthorized) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <header style={{ background: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)", color: "white", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/admin" style={{ color: "white", display: "flex" }}><ArrowLeft size={20} /></Link>
          <div>
            <h1 style={{ fontSize: "18px", fontWeight: 800, margin: 0 }}>📦 Sipariş Yönetimi</h1>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", margin: 0 }}>Toplam {stats.total} sipariş</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Link href="/admin" className="bg-white/20 hover:bg-white/30 text-white font-bold px-3 py-1.5 rounded-xl text-xs">Ürün Yönetimi</Link>
          <Link href="/admin/kampanyalar" className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-3 py-1.5 rounded-xl text-xs">Kampanyalar</Link>
        </div>
      </header>

      <div className="container-custom py-6 space-y-6">
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Toplam Sipariş", value: stats.total, color: "#1e293b", bg: "#f1f5f9" },
            { label: "Hazırlanıyor", value: stats.hazirlaniyor, color: "#3b82f6", bg: "#dbeafe" },
            { label: "Kargoda", value: stats.kargoda, color: "#8b5cf6", bg: "#ede9fe" },
            { label: "Teslim Edildi", value: stats.teslim, color: "#10b981", bg: "#d1fae5" },
          ].map((s) => (
            <div key={s.label} style={{ background: s.bg, borderRadius: "16px", padding: "16px 20px", border: `2px solid ${s.color}20` }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</p>
              <p style={{ fontSize: "28px", fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Bildirim */}
        {saveMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs p-3 rounded-xl">{saveMsg}</div>
        )}

        {/* Arama & Filtre */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Sipariş no, müşteri adı veya e-posta ara..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border rounded-xl text-xs font-semibold"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-3 py-2.5 bg-white border rounded-xl text-xs font-bold"
            >
              <option value="all">Tüm Durumlar</option>
              {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Sipariş Listesi */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm font-bold">Sipariş bulunamadı.</div>
          ) : (
            filtered.map((order) => {
              const cfg = STATUS_CONFIG[order.status];
              const isExpanded = expandedId === order.id;

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Özet Satırı */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div>
                        <span className="text-xs font-extrabold text-gray-900 block">{order.id}</span>
                        <span className="text-[10px] text-gray-400 font-semibold">{order.date}</span>
                      </div>
                      <div className="hidden sm:block min-w-0">
                        <span className="text-xs font-bold text-gray-800 block truncate">{order.customerName}</span>
                        <span className="text-[10px] text-gray-400 font-semibold">{order.customerEmail}</span>
                      </div>
                      <div className="hidden md:block">
                        <span className="text-xs font-bold text-gray-400">{order.items.length} ürün</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm font-extrabold text-gray-900">{formatPrice(order.total)}</span>
                      <span
                        style={{ background: cfg.bg, color: cfg.color, padding: "4px 10px", borderRadius: "999px", fontSize: "10px", fontWeight: 800, display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        {cfg.icon} {order.status}
                      </span>
                      {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </div>

                  {/* Detay Paneli */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-5 py-5 bg-gray-50/50 space-y-5">
                      {/* Müşteri Bilgileri */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="font-bold text-gray-400 block mb-1">MÜŞTERİ</span>
                          <span className="font-bold text-gray-800 block">{order.customerName}</span>
                          <span className="text-gray-500">{order.customerEmail}</span>
                          <span className="text-gray-500 block">{order.customerPhone}</span>
                        </div>
                        <div>
                          <span className="font-bold text-gray-400 block mb-1">TESLİMAT ADRESİ</span>
                          <span className="font-bold text-gray-800">{order.deliveryAddress}</span>
                        </div>
                        <div>
                          <span className="font-bold text-gray-400 block mb-1">ÖDEME & KARGO</span>
                          <span className="font-bold text-gray-800 block">{order.paymentMethod}</span>
                          <span className="text-gray-500">{order.carrier}</span>
                        </div>
                      </div>

                      {/* Ürünler Tablosu */}
                      <div>
                        <span className="text-xs font-bold text-gray-400 mb-2 block">ÜRÜNLER</span>
                        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between px-4 py-2.5 text-xs">
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-gray-400 font-bold w-5">{item.quantity}x</span>
                                <div className="min-w-0">
                                  <span className="font-bold text-gray-400 block text-[10px] uppercase">{item.brand}</span>
                                  <span className="font-bold text-gray-800 block truncate">{item.name}</span>
                                </div>
                              </div>
                              <span className="font-extrabold text-gray-900 flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Admin İşlemleri */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Durum Güncelle */}
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">Sipariş Durumu</label>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                            className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-bold"
                          >
                            {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>

                        {/* Kargo Takip No */}
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">Kargo Takip No</label>
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={editTrack[order.id] ?? order.trackingNumber}
                              onChange={(e) => setEditTrack({ ...editTrack, [order.id]: e.target.value })}
                              placeholder="Takip numarası girin"
                              className="flex-1 px-3 py-2 bg-white border rounded-xl text-xs font-semibold"
                            />
                            <button onClick={() => handleSaveTracking(order.id)} className="bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700">Kaydet</button>
                          </div>
                        </div>

                        {/* Admin Notu */}
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase">Admin Notu</label>
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={editNote[order.id] ?? order.adminNote}
                              onChange={(e) => setEditNote({ ...editNote, [order.id]: e.target.value })}
                              placeholder="İç not ekle..."
                              className="flex-1 px-3 py-2 bg-white border rounded-xl text-xs font-semibold"
                            />
                            <button onClick={() => handleSaveNote(order.id)} className="bg-gray-600 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-gray-700">Kaydet</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
