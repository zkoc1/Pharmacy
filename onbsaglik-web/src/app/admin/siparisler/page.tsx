/**
 * İleri Seviye Sipariş Yönetim Merkezi (OMS) — /admin/siparisler
 * Finansal KPI'lar, Detaylı Filtreleme, Toplu İşlemler, Sipariş Timeline/Audit Log,
 * Termal/A4 Kargo Çıkış Etiketi Yazdırma, Resmi E-Arşiv Fatura Fişi Yazdırma,
 * Manuel Sipariş Oluşturma ve CSV/Excel Dışa Aktarma.
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  ArrowLeft,
  ChevronRight,
  Filter,
  CreditCard,
  Printer,
  FileText,
  Download,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Building,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  AlertCircle,
  CheckSquare,
  Square,
  QrCode,
  Tag,
  Eye,
  X,
  Sparkles,
} from "lucide-react";
import {
  useOrderStore,
  OrderRecord,
  OrderStatus,
  OrderItem,
  OrderTimelineItem,
} from "@/stores/orderStore";
import { formatPrice, getAllProducts } from "@/lib/products";
import { ALL_81_PROVINCES } from "@/lib/turkeyLocations";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  "Ödeme Bekliyor": {
    label: "Ödeme Bekliyor",
    color: "#b45309",
    bg: "#fef3c7",
    border: "#fcd34d",
    icon: <Clock size={14} />,
  },
  "Mail Order Bekliyor": {
    label: "Mail Order Bekliyor",
    color: "#c2410c",
    bg: "#ffedd5",
    border: "#fdba74",
    icon: <CreditCard size={14} />,
  },
  Hazırlanıyor: {
    label: "Hazırlanıyor",
    color: "#1d4ed8",
    bg: "#dbeafe",
    border: "#93c5fd",
    icon: <ShoppingBag size={14} />,
  },
  Kargoda: {
    label: "Kargoda",
    color: "#6d28d9",
    bg: "#ede9fe",
    border: "#c4b5fd",
    icon: <Truck size={14} />,
  },
  "Teslim Edildi": {
    label: "Teslim Edildi",
    color: "#047857",
    bg: "#d1fae5",
    border: "#6ee7b7",
    icon: <CheckCircle size={14} />,
  },
  "İptal Edildi": {
    label: "İptal Edildi",
    color: "#b91c1c",
    bg: "#fee2e2",
    border: "#fca5a5",
    icon: <XCircle size={14} />,
  },
};

const ALL_STATUSES: OrderStatus[] = [
  "Ödeme Bekliyor",
  "Mail Order Bekliyor",
  "Hazırlanıyor",
  "Kargoda",
  "Teslim Edildi",
  "İptal Edildi",
];

const CARRIER_LIST = [
  "Kolay Gelsin",
  "HepsiJet",
  "PTT Kargo",
  "DHL Kargo",
  "Sürat Kargo",
  "Aras Kargo",
  "Yurtiçi Kargo",
];

export default function AdminSiparisler() {
  const router = useRouter();
  const {
    orders,
    updateOrderStatus,
    bulkUpdateStatus,
    updateTrackingNumber,
    updateAdminNote,
    deleteOrder,
    addOrder,
  } = useOrderStore();

  const [isAuthorized, setIsAuthorized] = useState(false);

  // Filtre State'leri
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [carrierFilter, setCarrierFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");

  // Çoklu Seçim State'i
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Modallar ve Aktif Sipariş
  const [activeDrawerOrder, setActiveDrawerOrder] = useState<OrderRecord | null>(null);
  const [printLabelOrder, setPrintLabelOrder] = useState<OrderRecord | null>(null);
  const [printInvoiceOrder, setPrintInvoiceOrder] = useState<OrderRecord | null>(null);
  const [showManualOrderModal, setShowManualOrderModal] = useState(false);

  // Bildirim Mesajı
  const [toastMsg, setToastMsg] = useState("");

  // Kargo Takip ve Not Düzenleme
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [adminNoteInput, setAdminNoteInput] = useState("");

  // Manuel Sipariş Form State
  const allCatalogProducts = useMemo(() => getAllProducts(), []);
  const [manualForm, setManualForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    city: "İstanbul",
    district: "Kadıköy",
    fullAddress: "",
    carrier: "Kolay Gelsin",
    paymentMethod: "Havale / EFT",
    status: "Hazırlanıyor" as OrderStatus,
    selectedProducts: [] as { product: (typeof allCatalogProducts)[0]; quantity: number }[],
  });
  const [productSearchTerm, setProductSearchTerm] = useState("");

  // Yetki Kontrolü
  useEffect(() => {
    const raw = localStorage.getItem("admin_session");
    if (!raw) {
      router.replace("/admin/giris");
      return;
    }
    try {
      const p = JSON.parse(raw);
      if (p.role === "super_admin" || p.role === "admin") {
        setIsAuthorized(true);
      } else {
        router.replace("/admin/giris");
      }
    } catch {
      router.replace("/admin/giris");
    }
  }, [router]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // Filtreleme Mantığı
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Metin Arama
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        (o.invoiceNo && o.invoiceNo.toLowerCase().includes(q)) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q));

      // Durum Filtresi
      const matchStatus = statusFilter === "all" || o.status === statusFilter;

      // Kargo Filtresi
      const matchCarrier = carrierFilter === "all" || o.carrier === carrierFilter;

      // Ödeme Filtresi
      const matchPayment = paymentFilter === "all" || o.paymentMethod === paymentFilter;

      return matchSearch && matchStatus && matchCarrier && matchPayment;
    });
  }, [orders, search, statusFilter, carrierFilter, paymentFilter]);

  // Finansal KPI Hesaplamaları
  const kpi = useMemo(() => {
    const totalRev = orders.reduce((acc, o) => (o.status !== "İptal Edildi" ? acc + o.total : acc), 0);
    const countPending = orders.filter(
      (o) => o.status === "Ödeme Bekliyor" || o.status === "Mail Order Bekliyor"
    ).length;
    const countProcessing = orders.filter((o) => o.status === "Hazırlanıyor").length;
    const countShipped = orders.filter((o) => o.status === "Kargoda").length;
    const countDelivered = orders.filter((o) => o.status === "Teslim Edildi").length;
    const aov = orders.length > 0 ? totalRev / orders.length : 0;

    return {
      totalRevenue: totalRev,
      totalOrders: orders.length,
      pending: countPending,
      processing: countProcessing,
      shipped: countShipped,
      delivered: countDelivered,
      aov,
    };
  }, [orders]);

  // Çoklu Seçim Fonksiyonları
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(filteredOrders.map((o) => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleToggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toplu Durum Güncelleme
  const handleBulkStatusChange = (newStatus: OrderStatus) => {
    if (selectedOrderIds.length === 0) return;
    bulkUpdateStatus(selectedOrderIds, newStatus);
    showToast(`✅ Seçilen ${selectedOrderIds.length} sipariş "${newStatus}" olarak güncellendi.`);
    setSelectedOrderIds([]);
  };

  // CSV / Excel Dışa Aktarma
  const handleExportCSV = () => {
    const exportData = selectedOrderIds.length > 0
      ? orders.filter((o) => selectedOrderIds.includes(o.id))
      : filteredOrders;

    if (exportData.length === 0) {
      alert("Dışa aktarılacak sipariş bulunamadı.");
      return;
    }

    const headers = [
      "Siparis No",
      "Fatura No",
      "Tarih",
      "Musteri Adi",
      "E-Posta",
      "Telefon",
      "Teslimat Adresi",
      "Kargo Firmasi",
      "Kargo Takip No",
      "Odeme Yontemi",
      "Durum",
      "Toplam Tutar (TL)",
      "Urun Kalemleri",
    ];

    const rows = exportData.map((o) => [
      `"${o.id}"`,
      `"${o.invoiceNo || ""}"`,
      `"${o.date}"`,
      `"${o.customerName}"`,
      `"${o.customerEmail}"`,
      `"${o.customerPhone}"`,
      `"${o.deliveryAddress.replace(/"/g, '""')}"`,
      `"${o.carrier}"`,
      `"${o.trackingNumber || ""}"`,
      `"${o.paymentMethod}"`,
      `"${o.status}"`,
      o.total.toFixed(2),
      `"${o.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}"`,
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `OnbSaglik_Siparisler_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("📥 Sipariş listesi Excel/CSV formatında indirildi.");
  };

  // Otomatik Kargo Takip Numarası Oluşturma
  const handleGenerateTracking = (order: OrderRecord) => {
    const prefix = order.carrier.includes("Kolay")
      ? "KG"
      : order.carrier.includes("Hepsi")
      ? "HJ"
      : order.carrier.includes("PTT")
      ? "PTT"
      : order.carrier.includes("DHL")
      ? "DHL"
      : "TR";
    const randomCode = `${prefix}${Math.floor(100000000 + Math.random() * 900000000)}`;

    updateTrackingNumber(order.id, randomCode);
    if (order.status === "Hazırlanıyor") {
      updateOrderStatus(order.id, "Kargoda", `Kargo takip numarası atandı: ${randomCode}`);
    }
    showToast(`📦 ${order.id} için takip no üretildi: ${randomCode}`);
  };

  // Manuel Sipariş Ekleme
  const handleAddManualOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualForm.selectedProducts.length === 0) {
      alert("Lütfen siparişe en az bir ürün ekleyiniz.");
      return;
    }
    if (!manualForm.customerName.trim() || !manualForm.fullAddress.trim()) {
      alert("Lütfen müşteri adı ve adresini eksiksiz giriniz.");
      return;
    }

    const orderTotal = manualForm.selectedProducts.reduce(
      (sum, p) => sum + p.product.price * p.quantity,
      0
    );

    const newRecord = addOrder({
      customerName: manualForm.customerName,
      customerEmail: manualForm.customerEmail || "manuel@onbsaglik.com",
      customerPhone: manualForm.customerPhone || "05555555555",
      deliveryAddress: `${manualForm.city} / ${manualForm.district} - ${manualForm.fullAddress}`,
      carrier: manualForm.carrier,
      paymentMethod: manualForm.paymentMethod,
      status: manualForm.status,
      total: orderTotal,
      items: manualForm.selectedProducts.map((p) => ({
        id: p.product.id,
        slug: p.product.slug,
        name: p.product.name,
        brand: p.product.brand,
        price: p.product.price,
        quantity: p.quantity,
        image: p.product.images?.[0] || "/placeholder.png",
      })),
    });

    setShowManualOrderModal(false);
    setManualForm({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      city: "İstanbul",
      district: "Kadıköy",
      fullAddress: "",
      carrier: "Kolay Gelsin",
      paymentMethod: "Havale / EFT",
      status: "Hazırlanıyor",
      selectedProducts: [],
    });
    showToast(`🎉 #${newRecord.id} numaralı manuel sipariş başarıyla oluşturuldu!`);
  };

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      {/* Toast Bildirimi */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-[9999] bg-gray-900 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Sparkles size={16} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Üst Yönetici Başlığı */}
      <header className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white px-6 py-5 shadow-lg">
        <div className="container-custom max-w-7xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-2xl transition-all flex items-center gap-1 text-xs font-bold"
            >
              <ArrowLeft size={16} /> Panel
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border border-emerald-500/30">
                  Enterprise OMS
                </span>
                <h1 className="text-lg font-black tracking-tight">Sipariş Yönetim Merkezi</h1>
              </div>
              <p className="text-xs text-emerald-200/70 font-medium">
                OnbSağlık sipariş operasyonları, kargo etiketleme ve e-Arşiv fatura kontrolü
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowManualOrderModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={15} /> + Manuel Sipariş Ekle
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={15} /> Excel / CSV Aktar
            </button>
          </div>
        </div>
      </header>

      <div className="container-custom max-w-7xl py-8 space-y-6">
        {/* 1. Finansal & Operasyonel KPI Metrik Kartları */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase">Toplam Ciro</span>
            <p className="text-lg font-black text-emerald-700">{formatPrice(kpi.totalRevenue)}</p>
            <span className="text-[10px] text-gray-400 block font-semibold">{kpi.totalOrders} Sipariş</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase">Ortalama Sepet (AOV)</span>
            <p className="text-lg font-black text-gray-900">{formatPrice(kpi.aov)}</p>
            <span className="text-[10px] text-emerald-600 block font-semibold">Sipariş Başı</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-amber-600 uppercase">Ödeme Bekleyen</span>
            <p className="text-lg font-black text-amber-600">{kpi.pending}</p>
            <span className="text-[10px] text-gray-400 block font-semibold">Mail Order & EFT</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-blue-600 uppercase">Hazırlanıyor</span>
            <p className="text-lg font-black text-blue-600">{kpi.processing}</p>
            <span className="text-[10px] text-gray-400 block font-semibold">Paketleme Sırasında</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-purple-600 uppercase">Kargoda</span>
            <p className="text-lg font-black text-purple-600">{kpi.shipped}</p>
            <span className="text-[10px] text-gray-400 block font-semibold">Taşımada</span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase">Teslim Edildi</span>
            <p className="text-lg font-black text-emerald-600">{kpi.delivered}</p>
            <span className="text-[10px] text-gray-400 block font-semibold">Başarılı İşlem</span>
          </div>
        </div>

        {/* 2. Hızlı Durum Sekmeleri (Pills) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === "all"
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            Tüm Siparişler ({orders.length})
          </button>
          {ALL_STATUSES.map((st) => {
            const count = orders.filter((o) => o.status === st).length;
            const isSelected = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white text-gray-600 border hover:bg-gray-50"
                }`}
              >
                {STATUS_CONFIG[st].icon}
                {st} <span className="text-[10px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        {/* 3. Arama & Çoklu Filtreler Toolbarı */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Arama Input */}
            <div className="md:col-span-2 relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Sipariş No, Fatura No, Müşteri Adı, Telefon veya Takip No ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Kargo Filtresi */}
            <div>
              <select
                value={carrierFilter}
                onChange={(e) => setCarrierFilter(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold"
              >
                <option value="all">Tüm Kargo Firmaları</option>
                {CARRIER_LIST.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Ödeme Yöntemi Filtresi */}
            <div>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold"
              >
                <option value="all">Tüm Ödeme Yöntemleri</option>
                <option value="Kredi Kartı">Kredi Kartı</option>
                <option value="Kredi Kartı / Mail Order">Kredi Kartı / Mail Order</option>
                <option value="Havale / EFT">Havale / EFT</option>
                <option value="PayTR 3D Secure">PayTR 3D Secure</option>
              </select>
            </div>
          </div>

          {/* 4. Çoklu Seçim Barı (Seçim Varsa Açılır) */}
          {selectedOrderIds.length > 0 && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
              <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                <CheckSquare size={16} className="text-emerald-600" />
                {selectedOrderIds.length} adet sipariş seçildi
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-800">Toplu Durum Değiştir:</span>
                <button
                  onClick={() => handleBulkStatusChange("Hazırlanıyor")}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  Hazırlanıyor Yap
                </button>
                <button
                  onClick={() => handleBulkStatusChange("Kargoda")}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  Kargoya Ver
                </button>
                <button
                  onClick={() => handleBulkStatusChange("Teslim Edildi")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  Teslim Edildi Yap
                </button>
                <button
                  onClick={() => handleBulkStatusChange("İptal Edildi")}
                  className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  İptal Et
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 5. İnteraktif Sipariş Listesi Tablosu */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-gray-200 text-gray-500 font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4 w-10">
                    <button
                      type="button"
                      onClick={() =>
                        handleSelectAll(selectedOrderIds.length !== filteredOrders.length)
                      }
                      className="cursor-pointer text-gray-500"
                    >
                      {selectedOrderIds.length > 0 &&
                      selectedOrderIds.length === filteredOrders.length ? (
                        <CheckSquare size={16} className="text-emerald-600" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="p-4">Sipariş & Fatura No</th>
                  <th className="p-4">Müşteri</th>
                  <th className="p-4">Ürün Kalemleri</th>
                  <th className="p-4">Tutar & Ödeme</th>
                  <th className="p-4">Kargo & Takip No</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-gray-400 font-medium">
                      Arama kriterlerine uygun sipariş bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => {
                    const isSelected = selectedOrderIds.includes(ord.id);
                    const cfg = STATUS_CONFIG[ord.status] || STATUS_CONFIG["Hazırlanıyor"];

                    return (
                      <tr
                        key={ord.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isSelected ? "bg-emerald-50/30" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => handleToggleSelectOrder(ord.id)}
                            className="cursor-pointer text-gray-400 hover:text-emerald-600"
                          >
                            {isSelected ? (
                              <CheckSquare size={16} className="text-emerald-600" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </td>

                        {/* Sipariş No & Tarih */}
                        <td className="p-4 space-y-1">
                          <span className="font-extrabold text-gray-900 block font-mono">
                            {ord.id}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium block">
                            {ord.date}
                          </span>
                          {ord.invoiceNo && (
                            <span className="text-[10px] font-mono font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              {ord.invoiceNo}
                            </span>
                          )}
                        </td>

                        {/* Müşteri Bilgisi */}
                        <td className="p-4 space-y-0.5">
                          <span className="font-bold text-gray-900 block">{ord.customerName}</span>
                          <span className="text-[11px] text-gray-500 font-medium block">
                            {ord.customerEmail}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium block">
                            {ord.customerPhone}
                          </span>
                        </td>

                        {/* Ürün Kalemleri (Tıklanabilir Linkler) */}
                        <td className="p-4 max-w-xs space-y-1.5">
                          <div className="space-y-1">
                            {ord.items.map((it, idx) => (
                              <Link
                                key={idx}
                                href={it.slug ? `/urun/${it.slug}` : `/ara?q=${encodeURIComponent(it.name)}`}
                                target="_blank"
                                className="flex items-center gap-2 hover:text-emerald-600 transition-colors group truncate"
                              >
                                <span className="font-bold text-gray-400 bg-gray-100 text-[10px] px-1.5 py-0.5 rounded">
                                  {it.quantity}x
                                </span>
                                <span className="truncate text-gray-800 font-semibold group-hover:underline">
                                  {it.name}
                                </span>
                              </Link>
                            ))}
                          </div>
                          <span className="text-[10px] text-gray-400 font-semibold block">
                            {ord.items.length} Kalem Ürün
                          </span>
                        </td>

                        {/* Tutar & Ödeme */}
                        <td className="p-4 space-y-1">
                          <span className="font-black text-sm text-gray-900 block">
                            {formatPrice(ord.total)}
                          </span>
                          <span className="text-[10px] font-extrabold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md inline-block">
                            {ord.paymentMethod}
                          </span>
                        </td>

                        {/* Kargo & Takip No */}
                        <td className="p-4 space-y-1.5">
                          <span className="font-bold text-gray-800 flex items-center gap-1 text-[11px]">
                            <Truck size={13} className="text-gray-400" /> {ord.carrier}
                          </span>

                          {ord.trackingNumber ? (
                            <span className="font-mono text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 block truncate">
                              {ord.trackingNumber}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleGenerateTracking(ord)}
                              className="text-[10px] font-extrabold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-lg border border-purple-200 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Sparkles size={11} /> Takip No Üret
                            </button>
                          )}
                        </td>

                        {/* Durum Dropdown */}
                        <td className="p-4">
                          <select
                            value={ord.status}
                            onChange={(e) =>
                              updateOrderStatus(ord.id, e.target.value as OrderStatus)
                            }
                            style={{
                              backgroundColor: cfg.bg,
                              color: cfg.color,
                              borderColor: cfg.border,
                            }}
                            className="font-extrabold text-xs px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer"
                          >
                            {ALL_STATUSES.map((st) => (
                              <option key={st} value={st} className="bg-white text-gray-900">
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* İşlem Butonları */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Detay Çekmecesi */}
                            <button
                              onClick={() => {
                                setActiveDrawerOrder(ord);
                                setAdminNoteInput(ord.adminNote || "");
                              }}
                              className="p-2 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl text-gray-600 transition-colors cursor-pointer"
                              title="Sipariş Detayı & Timeline"
                            >
                              <Eye size={15} />
                            </button>

                            {/* Kargo Etiketi Yazdır */}
                            <button
                              onClick={() => setPrintLabelOrder(ord)}
                              className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition-colors cursor-pointer"
                              title="Kargo Çıkış Etiketi Yazdır"
                            >
                              <Truck size={15} />
                            </button>

                            {/* E-Arşiv Fatura Yazdır */}
                            <button
                              onClick={() => setPrintInvoiceOrder(ord)}
                              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors cursor-pointer"
                              title="E-Arşiv Fatura / Bilgi Fişi Yazdır"
                            >
                              <Printer size={15} />
                            </button>

                            {/* Sipariş Sil */}
                            <button
                              onClick={() => {
                                if (confirm(`${ord.id} numaralı siparişi silmek istediğinize emin misiniz?`)) {
                                  deleteOrder(ord.id);
                                  showToast(`🗑️ ${ord.id} silindi.`);
                                }
                              }}
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors cursor-pointer"
                              title="Siparişi Sil"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: SİPARİŞ DETAY & AUDIT TIMELINE ÇEKMECESİ                         */}
      {/* ========================================================================= */}
      {activeDrawerOrder && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveDrawerOrder(null);
          }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex justify-end"
        >
          <div className="bg-white w-full max-w-xl h-full shadow-2xl p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Sipariş Detayı</span>
                <h3 className="text-lg font-black text-gray-900 font-mono flex items-center gap-2">
                  {activeDrawerOrder.id}
                  {activeDrawerOrder.invoiceNo && (
                    <span className="text-xs font-normal bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                      {activeDrawerOrder.invoiceNo}
                    </span>
                  )}
                </h3>
              </div>
              <button
                onClick={() => setActiveDrawerOrder(null)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Müşteri ve Teslimat Bilgisi */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs">
              <span className="font-extrabold text-gray-900 block flex items-center gap-1.5">
                <User size={14} className="text-emerald-600" /> {activeDrawerOrder.customerName}
              </span>
              <p className="text-gray-600 flex items-center gap-1.5">
                <Mail size={13} className="text-gray-400" /> {activeDrawerOrder.customerEmail}
              </p>
              <p className="text-gray-600 flex items-center gap-1.5">
                <Phone size={13} className="text-gray-400" /> {activeDrawerOrder.customerPhone}
              </p>
              <p className="text-gray-700 flex items-start gap-1.5 pt-1 border-t">
                <MapPin size={14} className="text-rose-500 flex-shrink-0 mt-0.5" />
                <span>{activeDrawerOrder.deliveryAddress}</span>
              </p>
              {activeDrawerOrder.customerNote && (
                <div className="p-2 bg-amber-50 rounded-xl text-amber-900 font-semibold border border-amber-200">
                  💬 Müşteri Notu: "{activeDrawerOrder.customerNote}"
                </div>
              )}
            </div>

            {/* Ürün Listesi */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs text-gray-900 uppercase">Sipariş Kalemleri</h4>
              <div className="space-y-2">
                {activeDrawerOrder.items.map((it, idx) => (
                  <Link
                    key={idx}
                    href={it.slug ? `/urun/${it.slug}` : `/ara?q=${encodeURIComponent(it.name)}`}
                    target="_blank"
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-emerald-50/40 rounded-2xl border transition-all text-xs group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 flex-shrink-0 bg-white rounded-xl p-1 border">
                        <Image
                          src={it.image || "/placeholder.png"}
                          alt={it.name}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <div>
                        <span className="font-bold text-gray-400 text-[10px] uppercase block">
                          {it.brand}
                        </span>
                        <p className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                          {it.name}
                        </p>
                        <span className="text-gray-500 text-[11px]">{it.quantity} Adet x {formatPrice(it.price)}</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-emerald-700 text-sm">
                      {formatPrice(it.price * it.quantity)}
                    </span>
                  </Link>
                ))}
              </div>

              <div className="flex justify-between items-center bg-slate-100 p-3.5 rounded-2xl text-xs font-bold">
                <span>Genel Toplam</span>
                <span className="text-base font-black text-rose-600">
                  {formatPrice(activeDrawerOrder.total)}
                </span>
              </div>
            </div>

            {/* Sipariş Yaşam Döngüsü (Audit Timeline) */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs text-gray-900 uppercase flex items-center gap-1.5">
                <Clock size={14} className="text-blue-600" /> Sipariş Yaşam Döngüsü & Günlük
              </h4>
              <div className="border-l-2 border-emerald-200 ml-3 pl-4 space-y-4 text-xs">
                {(activeDrawerOrder.timeline || [
                  { status: activeDrawerOrder.status, date: activeDrawerOrder.date, note: "Sipariş alındı" },
                ]).map((tl, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[23px] top-1 w-3 h-3 bg-emerald-500 rounded-full ring-4 ring-emerald-50" />
                    <span className="font-extrabold text-gray-900 block">{tl.status}</span>
                    <span className="text-[10px] text-gray-400 font-semibold block">{tl.date}</span>
                    {tl.note && <p className="text-gray-600 mt-0.5">{tl.note}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Yönetici Notu Ekleme */}
            <div className="space-y-2 pt-2 border-t">
              <h4 className="font-extrabold text-xs text-gray-900 uppercase">Dahili Yönetici Notu</h4>
              <textarea
                rows={2}
                placeholder="Bu siparişe özel dahili not ekleyin (Müşteri görmez)..."
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                className="w-full p-3 bg-gray-50 border rounded-2xl text-xs font-semibold"
              />
              <button
                type="button"
                onClick={() => {
                  updateAdminNote(activeDrawerOrder.id, adminNoteInput);
                  showToast("📝 Not kaydedildi.");
                }}
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer shadow"
              >
                Notu Kaydet
              </button>
            </div>

            {/* Hızlı Yazdırma Butonları */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setPrintLabelOrder(activeDrawerOrder)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow"
              >
                <Truck size={15} /> Kargo Etiketi Yazdır
              </button>
              <button
                onClick={() => setPrintInvoiceOrder(activeDrawerOrder)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow"
              >
                <Printer size={15} /> E-Arşiv Fatura Yazdır
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TERMAL / A4 BARKODLU KARGO ÇIKIŞ ETİKETİ (PRINTABLE)             */}
      {/* ========================================================================= */}
      {printLabelOrder && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setPrintLabelOrder(null);
          }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                <Truck className="text-purple-600" /> Kargo Taşıma Etiketi Önizleme
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-purple-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Printer size={14} /> YAZDIR
                </button>
                <button
                  onClick={() => setPrintLabelOrder(null)}
                  className="p-2 bg-gray-100 rounded-xl text-gray-500 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Termal Kargo Etiketi Şablonu */}
            <div className="border-2 border-black p-5 rounded-2xl bg-white text-black space-y-4 font-mono">
              <div className="flex justify-between items-start border-b-2 border-black pb-3">
                <div>
                  <h2 className="text-lg font-black tracking-wider">ONBSAĞLIK</h2>
                  <p className="text-[10px]">www.onbsaglik.com</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black uppercase border-2 border-black px-2 py-0.5 rounded">
                    {printLabelOrder.carrier}
                  </span>
                  <p className="text-[10px] mt-1 font-bold">Öncelikli E-Ticaret Gönderisi</p>
                </div>
              </div>

              {/* Barkod Alanı */}
              <div className="text-center py-2 bg-gray-50 border border-black rounded-lg">
                <div className="text-2xl font-black tracking-widest font-mono select-none">
                  ||| | |||| || | ||||| ||| |||| | ||
                </div>
                <p className="text-xs font-bold mt-1">
                  {printLabelOrder.trackingNumber || `TR${printLabelOrder.id.replace(/\D/g, "")}99`}
                </p>
              </div>

              {/* Alıcı & Gönderici */}
              <div className="grid grid-cols-2 gap-3 text-xs border-b-2 border-black pb-3">
                <div>
                  <span className="font-bold text-[10px] uppercase block underline">GÖNDERİCİ:</span>
                  <p className="font-bold">OnbSağlık A.Ş.</p>
                  <p className="text-[10px]">Kocasinan / Kayseri</p>
                  <p className="text-[10px]">Tel: 0850 300 00 00</p>
                </div>
                <div>
                  <span className="font-bold text-[10px] uppercase block underline">ALICI:</span>
                  <p className="font-black text-sm">{printLabelOrder.customerName}</p>
                  <p className="text-[11px] font-bold mt-0.5">{printLabelOrder.deliveryAddress}</p>
                  <p className="text-[11px] font-bold mt-1">Tel: {printLabelOrder.customerPhone}</p>
                </div>
              </div>

              {/* Paket İçeriği Özeti */}
              <div className="text-[11px]">
                <span className="font-bold uppercase block mb-1">Paket İçeriği ({printLabelOrder.items.length} Kalem):</span>
                <p className="text-[10px] text-gray-700 leading-tight">
                  {printLabelOrder.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                </p>
              </div>

              <div className="flex justify-between items-center border-t-2 border-black pt-2 text-xs font-black">
                <span>Sipariş No: {printLabelOrder.id}</span>
                <span>Tarih: {printLabelOrder.date}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: RESMİ E-ARŞİV FATURA / BİLGİ FİŞİ (PRINTABLE)                    */}
      {/* ========================================================================= */}
      {printInvoiceOrder && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setPrintInvoiceOrder(null);
          }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                <Printer className="text-blue-600" /> E-Arşiv Fatura / Bilgi Fişi
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-blue-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Printer size={14} /> YAZDIR
                </button>
                <button
                  onClick={() => setPrintInvoiceOrder(null)}
                  className="p-2 bg-gray-100 rounded-xl text-gray-500 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Fatura Şablonu */}
            <div className="border border-gray-300 p-8 rounded-2xl bg-white text-gray-900 space-y-6 text-xs">
              {/* Başlık & Şirket Bilgisi */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h2 className="text-lg font-black text-emerald-800 tracking-tight">
                    ONBSAĞLIK İNTERNET MAĞAZACILIK A.Ş.
                  </h2>
                  <p className="text-[11px] text-gray-600 mt-1">
                    Gevher Nesibe Mah. İstasyon Cad. No: 18 Melikgazi / KAYSERİ
                  </p>
                  <p className="text-[11px] text-gray-600">
                    VKN: 6410948291 | Vergi Dairesi: Mimarsinan VD.
                  </p>
                  <p className="text-[11px] text-gray-600">Mersis: 0641094829100001</p>
                </div>
                <div className="text-right space-y-1">
                  <span className="font-black text-sm text-blue-700 border border-blue-300 bg-blue-50 px-2 py-0.5 rounded">
                    E-ARŞİV FATURA
                  </span>
                  <p className="font-mono font-bold text-xs mt-1">
                    Fatura No: {printInvoiceOrder.invoiceNo || "ONB2026000001"}
                  </p>
                  <p className="text-[11px] text-gray-500">Tarih: {printInvoiceOrder.date}</p>
                </div>
              </div>

              {/* Müşteri Bilgileri */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-gray-100 text-xs">
                <div>
                  <span className="font-bold text-gray-400 text-[10px] uppercase block">
                    SAYIN (MÜŞTERİ):
                  </span>
                  <p className="font-bold text-gray-900 mt-0.5">{printInvoiceOrder.customerName}</p>
                  <p className="text-gray-600 mt-0.5">{printInvoiceOrder.deliveryAddress}</p>
                  <p className="text-gray-600 mt-0.5">Tel: {printInvoiceOrder.customerPhone}</p>
                </div>
                <div className="text-right space-y-0.5">
                  <span className="font-bold text-gray-400 text-[10px] uppercase block">
                    SİPARİŞ DETAYI:
                  </span>
                  <p className="font-mono font-bold">Sipariş No: {printInvoiceOrder.id}</p>
                  <p className="text-gray-600">Ödeme: {printInvoiceOrder.paymentMethod}</p>
                  <p className="text-gray-600">Kargo: {printInvoiceOrder.carrier}</p>
                </div>
              </div>

              {/* Ürün Tablosu & KDV Ayrıştırması */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-gray-700 font-extrabold uppercase text-[10px] border-b">
                    <th className="p-2">Sıra</th>
                    <th className="p-2">Ürün / Hizmet</th>
                    <th className="p-2 text-center">Miktar</th>
                    <th className="p-2 text-right">Birim Fiyat</th>
                    <th className="p-2 text-center">KDV (%)</th>
                    <th className="p-2 text-right">Toplam Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {printInvoiceOrder.items.map((it, idx) => {
                    const lineTotal = it.price * it.quantity;
                    return (
                      <tr key={idx}>
                        <td className="p-2 text-gray-400">{idx + 1}</td>
                        <td className="p-2 font-semibold text-gray-900">{it.name}</td>
                        <td className="p-2 text-center font-bold">{it.quantity} Adet</td>
                        <td className="p-2 text-right font-mono">{formatPrice(it.price)}</td>
                        <td className="p-2 text-center font-bold text-gray-500">%10</td>
                        <td className="p-2 text-right font-mono font-bold">{formatPrice(lineTotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Alt Yekün & Matrah */}
              <div className="flex justify-between items-end border-t pt-4">
                <div className="text-[10px] text-gray-400 space-y-1">
                  <p>Bu satış 213 sayılı V.U.K. hükümlerine göre e-Arşiv olarak düzenlenmiştir.</p>
                  <p>İrsaliye yerine geçer.</p>
                </div>

                <div className="w-60 space-y-1.5 text-xs text-right">
                  <div className="flex justify-between text-gray-600">
                    <span>Ara Toplam (Matrah):</span>
                    <span className="font-mono">
                      {formatPrice(printInvoiceOrder.total / 1.1)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Hesaplanan KDV (%10):</span>
                    <span className="font-mono">
                      {formatPrice(printInvoiceOrder.total - printInvoiceOrder.total / 1.1)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-emerald-800 border-t pt-1">
                    <span>Ödenecek Tutar:</span>
                    <span className="font-mono">{formatPrice(printInvoiceOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: MANUEL SİPARİŞ OLUŞTURMA FORMU                                  */}
      {/* ========================================================================= */}
      {showManualOrderModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowManualOrderModal(false);
          }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                <Plus className="text-emerald-600" /> Yeni Manuel Sipariş Girişi
              </h3>
              <button
                onClick={() => setShowManualOrderModal(false)}
                className="p-1.5 bg-gray-100 rounded-xl text-gray-500 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddManualOrder} className="space-y-4 text-xs">
              {/* Müşteri Bilgileri */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Müşteri Adı Soyadı *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ad Soyad"
                    value={manualForm.customerName}
                    onChange={(e) => setManualForm({ ...manualForm, customerName: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">E-Posta</label>
                  <input
                    type="email"
                    placeholder="musteri@gmail.com"
                    value={manualForm.customerEmail}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, customerEmail: e.target.value })
                    }
                    className="w-full p-2.5 bg-gray-50 border rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Telefon *</label>
                  <input
                    type="tel"
                    required
                    placeholder="05XX XXX XX XX"
                    value={manualForm.customerPhone}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, customerPhone: e.target.value })
                    }
                    className="w-full p-2.5 bg-gray-50 border rounded-xl font-semibold"
                  />
                </div>
              </div>

              {/* Konum & Adres */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">İl *</label>
                  <select
                    value={manualForm.city}
                    onChange={(e) => setManualForm({ ...manualForm, city: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border rounded-xl font-semibold"
                  >
                    {ALL_81_PROVINCES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">İlçe</label>
                  <input
                    type="text"
                    placeholder="İlçe"
                    value={manualForm.district}
                    onChange={(e) => setManualForm({ ...manualForm, district: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Kargo Firması</label>
                  <select
                    value={manualForm.carrier}
                    onChange={(e) => setManualForm({ ...manualForm, carrier: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border rounded-xl font-semibold"
                  >
                    {CARRIER_LIST.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Açık Adres *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Mahalle, Cadde, Sokak, No..."
                  value={manualForm.fullAddress}
                  onChange={(e) => setManualForm({ ...manualForm, fullAddress: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border rounded-xl font-semibold"
                />
              </div>

              {/* Ürün Seçici */}
              <div className="space-y-2 border-t pt-3">
                <label className="block font-bold text-gray-900">Siparişe Eklenecek Ürünler</label>
                <input
                  type="text"
                  placeholder="Ürün kataloğunda ara (İsim veya marka)..."
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  className="w-full p-2 border rounded-xl bg-gray-50 text-xs"
                />

                {productSearchTerm && (
                  <div className="max-h-40 overflow-y-auto border rounded-xl bg-white p-2 space-y-1">
                    {allCatalogProducts
                      .filter((p) =>
                        p.name.toLowerCase().includes(productSearchTerm.toLowerCase())
                      )
                      .slice(0, 5)
                      .map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg text-xs"
                        >
                          <span className="truncate font-semibold max-w-sm">
                            {p.name} ({formatPrice(p.price)})
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setManualForm((prev) => ({
                                ...prev,
                                selectedProducts: [
                                  ...prev.selectedProducts,
                                  { product: p, quantity: 1 },
                                ],
                              }));
                              setProductSearchTerm("");
                            }}
                            className="bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] cursor-pointer"
                          >
                            + Ekle
                          </button>
                        </div>
                      ))}
                  </div>
                )}

                {/* Seçili Ürünler */}
                <div className="space-y-1.5 pt-1">
                  {manualForm.selectedProducts.map((sp, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-slate-50 border rounded-xl text-xs"
                    >
                      <span className="font-semibold truncate max-w-xs">{sp.product.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-600">
                          {formatPrice(sp.product.price * sp.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setManualForm((prev) => ({
                              ...prev,
                              selectedProducts: prev.selectedProducts.filter((_, i) => i !== idx),
                            }))
                          }
                          className="text-red-500 hover:bg-red-50 p-1 rounded"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-sm font-black text-rose-600">
                  Toplam Tutar:{" "}
                  {formatPrice(
                    manualForm.selectedProducts.reduce(
                      (sum, p) => sum + p.product.price * p.quantity,
                      0
                    )
                  )}
                </span>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 rounded-2xl shadow-md cursor-pointer"
                >
                  Siparişi Kaydet & Onayla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
