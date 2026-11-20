"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  Filter,
  Download,
  Square,
  CheckSquare,
  AlertCircle,
  Truck,
  User,
  Package,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useOrderStore, OrderRecord, OrderStatus } from "@/stores/orderStore";
import { restoreAdminSessionIfNeeded } from "@/lib/authUtils";
import { formatPrice } from "@/lib/products";
import CargoLabelPrint from "@/components/admin/CargoLabelPrint";
import CustomCarrierModal from "@/components/admin/CustomCarrierModal";
import DocumentModal from "@/components/admin/DocumentModal";
import InvoiceModal from "@/components/admin/InvoiceModal";
import BillingInfoModal from "@/components/admin/BillingInfoModal";

// Trendyol Satıcı Paneli Standart Sekmeleri
const TABS = [
  { id: "all", label: "Tüm Siparişler" },
  { id: "Yeni", label: "Yeni" },
  { id: "Hazırlanıyor", label: "İşleme Alınanlar" },
  { id: "Kargoda", label: "Taşıma Durumunda" },
  { id: "Teslim Edildi", label: "Teslim Edilen" },
  { id: "İptal / İade", label: "İptal / İade" },
  { id: "askida", label: "Askıdaki Siparişler" },
];

export default function AdminSiparislerTrendyol() {
  const router = useRouter();
  const {
    orders,
    updateOrderStatus,
    bulkUpdateStatus,
    fetchOrders,
    updateCarrier,
    updateTrackingNumber,
  } = useOrderStore();

  const [isAuthorized, setIsAuthorized] = useState(true);

  // Modals
  const [cargoLabelOrder, setCargoLabelOrder] = useState<OrderRecord | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<OrderRecord | null>(null);
  const [billingInfoOrder, setBillingInfoOrder] = useState<OrderRecord | null>(null);
  const [customCarrierOrder, setCustomCarrierOrder] = useState<OrderRecord | null>(null);
  const [documentOrder, setDocumentOrder] = useState<{
    order: OrderRecord;
    type: "magaza_karti" | "mesafeli_satis" | "on_bilgilendirme";
  } | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState("all");
  const [searchNo, setSearchNo] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [searchBarcode, setSearchBarcode] = useState("");
  const [searchTracking, setSearchTracking] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    restoreAdminSessionIfNeeded();
    fetchOrders();
  }, [fetchOrders]);

  // Ödeme Bekleyen (tamamlanmamış / terk edilmiş) sipariş kontrolü
  const isUnpaidOrder = (o: OrderRecord) =>
    o.status === "Ödeme Bekliyor" ||
    o.status === "PayTR Ödeme Bekliyor" ||
    o.status === "Mail Order Bekliyor";

  // Sekme sayıları
  const getTabCount = (tabId: string) => {
    if (tabId === "all") return orders.filter((o) => !isUnpaidOrder(o)).length;
    if (tabId === "askida") return orders.filter((o) => isUnpaidOrder(o)).length;
    return orders.filter((o) => o.status === tabId).length;
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // 1. Sekme filtreleme
      if (activeTab === "all") {
        // "Tüm Siparişler" sekmesinde ödemesi yapılmayan terk edilmiş sepetler GÖSTERİLMEZ!
        if (isUnpaidOrder(o)) return false;
      } else if (activeTab === "Yeni") {
        if (o.status !== "Yeni") return false;
      } else if (activeTab === "Hazırlanıyor") {
        if (o.status !== "Hazırlanıyor") return false;
      } else if (activeTab === "Kargoda") {
        if (o.status !== "Kargoda") return false;
      } else if (activeTab === "Teslim Edildi") {
        if (o.status !== "Teslim Edildi") return false;
      } else if (activeTab === "İptal / İade") {
        if (o.status !== "İptal / İade") return false;
      } else if (activeTab === "askida") {
        if (!isUnpaidOrder(o)) return false;
      }

      // 2. Arama filtreleri
      if (searchNo && !o.id.toLowerCase().includes(searchNo.toLowerCase())) return false;
      if (
        searchCustomer &&
        !o.customerName.toLowerCase().includes(searchCustomer.toLowerCase())
      )
        return false;
      if (searchTracking && !o.trackingNumber?.includes(searchTracking)) return false;

      // Barkod / Ürün adı araması
      if (searchBarcode) {
        const hasItem = o.items.some(
          (i) =>
            i.id.toString().includes(searchBarcode) ||
            i.name.toLowerCase().includes(searchBarcode.toLowerCase())
        );
        if (!hasItem) return false;
      }
      return true;
    });
  }, [orders, activeTab, searchNo, searchCustomer, searchBarcode, searchTracking]);

  const handleSelectAll = () => {
    if (selectedIds.length === filteredOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map((o) => o.id));
    }
  };

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (status: OrderStatus) => {
    if (!selectedIds.length) return;
    bulkUpdateStatus(selectedIds, status);
    setSelectedIds([]);
  };

  // HepsiJet ile kargoya verme işlemi (Otomatik takip no atar, kargoya geçirir)
  const handleHepsiJetShip = async (ord: OrderRecord) => {
    try {
      const trackingNo =
        ord.trackingNumber && ord.trackingNumber !== "-"
          ? ord.trackingNumber
          : `272${Math.floor(1000000000 + Math.random() * 9000000000)}`;

      await updateCarrier(ord.id, "HepsiJet");
      await updateTrackingNumber(ord.id, trackingNo);
      await updateOrderStatus(
        ord.id,
        "Kargoda",
        `HepsiJet ile kargoya verildi. Kargo Takip Kodu: ${trackingNo}`
      );

      // Otomatik etiket yazdırma seçeneği
      if (
        window.confirm(
          `✅ #${ord.id} numaralı sipariş HepsiJet takip kodu (${trackingNo}) ile "Taşıma Durumunda" sekmesine aktarıldı!\n\nKargo etiketini şimdi A5 formatında yazdırmak ister misiniz?`
        )
      ) {
        setCargoLabelOrder({
          ...ord,
          carrier: "HepsiJet",
          trackingNumber: trackingNo,
          status: "Kargoda",
        });
      }
    } catch (err) {
      console.error(err);
      window.alert("Kargo işlemi sırasında bir hata oluştu.");
    }
  };

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-16 text-sm">
      {/* Modals */}
      {cargoLabelOrder && (
        <CargoLabelPrint
          order={cargoLabelOrder}
          onClose={() => setCargoLabelOrder(null)}
        />
      )}
      {invoiceOrder && (
        <InvoiceModal
          order={invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
          onInvoiceCreated={() => {
            updateOrderStatus(invoiceOrder.id, "Kargoda", "Fatura oluşturuldu ve kargoya verildi.");
            setInvoiceOrder(null);
            window.alert("✅ EDM faturası başarıyla oluşturuldu ve kargoya iletildi!");
          }}
        />
      )}
      {billingInfoOrder && (
        <BillingInfoModal
          order={billingInfoOrder}
          onClose={() => setBillingInfoOrder(null)}
        />
      )}
      {customCarrierOrder && (
        <CustomCarrierModal
          order={customCarrierOrder}
          onClose={() => setCustomCarrierOrder(null)}
          onSubmit={async (carrier, trackingNumber) => {
            await updateCarrier(customCarrierOrder.id, carrier);
            await updateTrackingNumber(customCarrierOrder.id, trackingNumber);
            await updateOrderStatus(
              customCarrierOrder.id,
              "Kargoda",
              `${carrier} ile kargoya verildi. Takip: ${trackingNumber}`
            );
            setCustomCarrierOrder(null);
          }}
        />
      )}
      {documentOrder && (
        <DocumentModal
          order={documentOrder.order}
          type={documentOrder.type}
          onClose={() => setDocumentOrder(null)}
        />
      )}

      {/* TABS (Trendyol Style Header) */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container-custom max-w-full px-6 flex items-end gap-6 overflow-x-auto">
          {TABS.map((tab) => {
            const count = getTabCount(tab.id);
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center pb-2.5 pt-3 px-2 border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-[#f27a1a] text-[#f27a1a] font-black"
                    : "border-transparent text-gray-500 hover:text-gray-800 font-bold"
                }`}
              >
                <span className="text-xs mb-1">{tab.label}</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-orange-100 text-[#f27a1a] font-black"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {count} Paket
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="container-custom max-w-full px-6 py-6 space-y-4">
        {/* Trendyol Style Bilgilendirme Bannerı */}
        <div className="bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200/60 rounded-lg p-3 text-xs text-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-[#f27a1a] text-white font-black text-[10px] px-2 py-0.5 rounded">
              ONB AKIŞ
            </span>
            <span>
              <strong>Yeni</strong> gelen siparişleri <strong>İşleme Al</strong> butonuyla hazırlığa başlatın. Hazırlanan siparişleri tek tıkla <strong>HepsiJet</strong> kargosuna verip <strong>Taşıma Durumunda</strong> sekmesine aktarabilirsiniz.
            </span>
          </div>
          <span className="text-gray-400 text-[11px]">PayTR & HepsiJet Entegre</span>
        </div>

        {/* FILTERS (Trendyol Style) */}
        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-[11px] text-gray-500 font-bold block mb-1">
                Müşteri Adı
              </label>
              <input
                type="text"
                placeholder="Örn: Ayşe Yılmaz"
                value={searchCustomer}
                onChange={(e) => setSearchCustomer(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-xs focus:border-[#f27a1a] focus:ring-1 focus:ring-[#f27a1a] outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 font-bold block mb-1">
                Sipariş No
              </label>
              <input
                type="text"
                placeholder="Örn: ONB179..."
                value={searchNo}
                onChange={(e) => setSearchNo(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-xs focus:border-[#f27a1a] focus:ring-1 focus:ring-[#f27a1a] outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 font-bold block mb-1">
                Barkod / Ürün Adı
              </label>
              <input
                type="text"
                placeholder="Ürün adı veya kod"
                value={searchBarcode}
                onChange={(e) => setSearchBarcode(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-xs focus:border-[#f27a1a] focus:ring-1 focus:ring-[#f27a1a] outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 font-bold block mb-1">
                Kargo Takip Kodu
              </label>
              <input
                type="text"
                placeholder="Örn: 272..."
                value={searchTracking}
                onChange={(e) => setSearchTracking(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-xs focus:border-[#f27a1a] focus:ring-1 focus:ring-[#f27a1a] outline-none"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={() => {
                  setSearchCustomer("");
                  setSearchNo("");
                  setSearchBarcode("");
                  setSearchTracking("");
                }}
                className="flex-1 border border-gray-300 text-gray-600 font-bold py-2 rounded text-xs hover:bg-gray-50"
              >
                Temizle
              </button>
              <button className="flex-1 bg-[#333] text-white font-bold py-2 rounded text-xs hover:bg-black">
                Filtrele
              </button>
            </div>
          </div>
        </div>

        {/* TABLE CONTROLS */}
        <div className="flex justify-between items-center bg-white p-3 rounded-t-md border border-b-0 border-gray-200">
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkAction(e.target.value as OrderStatus);
                  e.target.value = "";
                }
              }}
              disabled={selectedIds.length === 0}
              className="border border-gray-300 rounded p-1.5 text-xs text-gray-700 bg-gray-50 font-bold outline-none disabled:opacity-50"
            >
              <option value="">Toplu İşlemler ({selectedIds.length} Seçili)</option>
              <option value="Hazırlanıyor">Seçilenleri İşleme Al</option>
              <option value="Kargoda">Seçilenleri Kargoya Ver</option>
              <option value="Teslim Edildi">Seçilenleri Teslim Edildi Yap</option>
              <option value="İptal / İade">Seçilenleri İptal Et</option>
            </select>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-gray-500">
              Filtreleme Sonuçları: Toplam{" "}
              <strong className="text-gray-800">{filteredOrders.length}</strong> sipariş bilgisi
            </span>
            <button className="flex items-center gap-1 border border-gray-300 rounded px-3 py-1.5 text-gray-600 font-bold hover:bg-gray-50">
              <Download size={14} /> Excel İle İndir
            </button>
          </div>
        </div>

        {/* TABLE (Trendyol Style) */}
        <div className="bg-white border border-gray-200 rounded-b-md min-h-[400px] overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8f8f8] text-gray-600 border-b border-gray-200">
              <tr>
                <th className="p-3 w-10 text-center">
                  <button
                    onClick={handleSelectAll}
                    className="text-gray-400 hover:text-[#f27a1a]"
                  >
                    {selectedIds.length > 0 &&
                    selectedIds.length === filteredOrders.length ? (
                      <CheckSquare size={16} className="text-[#f27a1a]" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th className="p-3 font-bold">
                  Sipariş Bilgileri <Filter size={12} className="inline ml-1 text-gray-400" />
                </th>
                <th className="p-3 font-bold w-48">Alıcı</th>
                <th className="p-3 font-bold w-72">Ürünler</th>
                <th className="p-3 font-bold">Tutar</th>
                <th className="p-3 font-bold">
                  Kargo <Filter size={12} className="inline ml-1 text-gray-400" />
                </th>
                <th className="p-3 font-bold">
                  Fatura <Filter size={12} className="inline ml-1 text-gray-400" />
                </th>
                <th className="p-3 font-bold text-center w-48">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="p-12 text-center text-gray-500 font-medium"
                  >
                    Bu sekmede görüntülenecek sipariş bulunmuyor.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const isSelected = selectedIds.includes(ord.id);

                  return (
                    <tr
                      key={ord.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        isSelected ? "bg-orange-50/40" : ""
                      }`}
                    >
                      {/* Seçim kutusu */}
                      <td className="p-3 text-center align-top">
                        <button
                          onClick={() => handleToggle(ord.id)}
                          className="text-gray-400 hover:text-[#f27a1a]"
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-[#f27a1a]" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>

                      {/* Sipariş Bilgileri */}
                      <td className="p-3 align-top space-y-1 text-gray-600">
                        <div className="font-bold text-[#f27a1a] flex items-center gap-1">
                          <span className="text-[11px]">📦</span> #{ord.id}
                        </div>
                        <div className="text-[11px]">
                          Tarih:{" "}
                          <span className="font-bold text-gray-800">
                            {ord.date.split(" ")[0]} {ord.date.split(" ")[1]}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500">
                          Ödeme: <strong className="text-gray-700">{ord.paymentMethod}</strong>
                        </div>
                      </td>

                      {/* Alıcı */}
                      <td className="p-3 align-top">
                        <div className="space-y-1">
                          <div className="font-bold text-gray-800 flex items-center gap-1.5">
                            <User size={13} className="text-gray-400 shrink-0" />
                            <span>{ord.customerName}</span>
                          </div>
                          {ord.customerPhone && (
                            <div className="text-[11px] text-gray-600 font-medium">
                              📞 {ord.customerPhone}
                            </div>
                          )}
                          {ord.customerEmail && (
                            <div className="text-[10px] text-gray-400 truncate max-w-[180px]">
                              ✉ {ord.customerEmail}
                            </div>
                          )}
                          <div className="text-[10px] text-gray-600 line-clamp-3 pt-1 border-t border-gray-100 mt-1">
                            {ord.deliveryAddress}
                          </div>
                        </div>
                      </td>

                      {/* Ürünler */}
                      <td className="p-3 align-top">
                        <div className="space-y-3">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex gap-2">
                              <div className="w-12 h-12 border rounded bg-white p-1 flex-shrink-0 relative">
                                <Image
                                  src={item.image || "/placeholder.png"}
                                  alt={item.name}
                                  fill
                                  className="object-contain"
                                  unoptimized
                                />
                                <div className="absolute -top-1.5 -left-1.5 bg-blue-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                  {item.quantity}
                                </div>
                              </div>
                              <div className="text-[11px] text-gray-600">
                                <div className="font-bold text-blue-600 line-clamp-2">
                                  {item.name}
                                </div>
                                <div className="text-[10px] text-gray-400">
                                  Stok Kodu: ONB-{item.id}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Tutar */}
                      <td className="p-3 align-top font-bold text-gray-800 text-sm">
                        {formatPrice(ord.total)}
                      </td>

                      {/* Kargo */}
                      <td className="p-3 align-top">
                        <div className="flex flex-col items-center justify-center space-y-1">
                          <div className="font-black text-[#0088cc] text-sm flex items-center gap-1">
                            <Truck size={16} /> {ord.carrier.split(" ")[0]}
                          </div>
                          <div className="font-bold text-gray-800 font-mono text-xs">
                            {ord.trackingNumber || "-"}
                          </div>
                          <div className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                            Anlaşmalı Kargo
                          </div>
                        </div>
                      </td>

                      {/* Fatura */}
                      <td className="p-3 align-top text-center space-y-1.5">
                        <div className="text-gray-500 text-[11px]">
                          Satış Tutarı: <br />
                          <strong className="text-gray-800">{formatPrice(ord.total)}</strong>
                        </div>
                        {ord.status === "Kargoda" || ord.status === "Teslim Edildi" ? (
                          <div className="text-emerald-600 font-bold text-[10px] flex justify-center items-center gap-1">
                            <CheckSquare size={12} /> Fatura Kesildi
                          </div>
                        ) : (
                          <div className="text-red-500 font-bold text-[10px] flex justify-center items-center gap-1">
                            <AlertCircle size={12} /> Fatura Bekleniyor
                          </div>
                        )}
                        <select
                          onChange={(e) => {
                            if (e.target.value === "fatura") setInvoiceOrder(ord);
                            else if (e.target.value === "bilgiler") setBillingInfoOrder(ord);
                            e.target.value = "";
                          }}
                          className="w-full border border-gray-300 rounded p-1 text-[10px] text-gray-700 outline-none hover:border-gray-400 cursor-pointer bg-white"
                        >
                          <option value="">Fatura İşlemleri ▾</option>
                          <option value="bilgiler">Fatura Bilgilerini Görüntüle</option>
                          <option value="fatura">Hızlı Fatura Oluştur (EDM)</option>
                        </select>
                      </td>

                      {/* İşlemler / Durum Yönetimi (Trendyol Mantığı) */}
                      <td className="p-3 align-top space-y-2">
                        {/* 1. DURUM: YENİ SİPARİŞ (Photo 2 gibi) */}
                        {ord.status === "Yeni" && (
                          <>
                            <button
                              onClick={() => {
                                updateOrderStatus(
                                  ord.id,
                                  "Hazırlanıyor",
                                  "Sipariş işleme alındı, depoda hazırlanıyor."
                                );
                              }}
                              className="w-full bg-[#f27a1a] hover:bg-[#e0680a] text-white font-bold text-xs py-2 px-3 rounded shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <span>⚡</span> İşleme Al
                            </button>

                            <div className="relative group">
                              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[11px] py-1.5 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer">
                                İşlemler ▾
                              </button>
                              <div className="absolute right-0 top-full pt-1 w-52 z-50 hidden group-hover:block text-left text-xs shadow-xl rounded overflow-hidden">
                                <div className="bg-white border text-gray-700 divide-y divide-gray-100">
                                  <button
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          `#${ord.id} numaralı siparişi iptal etmek istediğinize emin misiniz?`
                                        )
                                      ) {
                                        updateOrderStatus(ord.id, "İptal / İade");
                                      }
                                    }}
                                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 font-bold cursor-pointer"
                                  >
                                    ✕ İptal Et
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDocumentOrder({ order: ord, type: "magaza_karti" })
                                    }
                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                  >
                                    Mağaza Kartı Yazdır
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDocumentOrder({ order: ord, type: "mesafeli_satis" })
                                    }
                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                  >
                                    Mesafeli Satış Sözleşmesi
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDocumentOrder({ order: ord, type: "on_bilgilendirme" })
                                    }
                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                  >
                                    Ön Bilgilendirme Formu
                                  </button>
                                  <button
                                    onClick={() => setBillingInfoOrder(ord)}
                                    className="w-full text-left px-3 py-2 hover:bg-blue-50 text-blue-700 font-bold cursor-pointer"
                                  >
                                    Fatura Bilgilerini Görüntüle
                                  </button>
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {/* 2. DURUM: İŞLEME ALINANLAR (Photo 1 gibi — "İşleme Al" kalktı!) */}
                        {ord.status === "Hazırlanıyor" && (
                          <>
                            <button
                              onClick={() => handleHepsiJetShip(ord)}
                              className="w-full bg-[#0088cc] hover:bg-[#0077b3] text-white font-bold text-xs py-2 px-2.5 rounded shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Truck size={14} /> HepsiJet ile Kargoya Ver
                            </button>

                            <button
                              onClick={() => setCargoLabelOrder(ord)}
                              className="w-full border border-orange-300 text-orange-600 hover:bg-orange-50 font-bold text-[10px] py-1.5 rounded transition-colors cursor-pointer"
                            >
                              Kargo Etiketini Yazdır
                            </button>

                            <div className="relative group">
                              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[11px] py-1.5 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer">
                                İşlemler ▾
                              </button>
                              <div className="absolute right-0 top-full pt-1 w-56 z-50 hidden group-hover:block text-left text-xs shadow-xl rounded overflow-hidden">
                                <div className="bg-white border text-gray-700 divide-y divide-gray-100">
                                  <button
                                    onClick={() => setCustomCarrierOrder(ord)}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                  >
                                    Başka Kargo Firması İle Gönder
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          `#${ord.id} numaralı siparişi iptal etmek istediğinize emin misiniz?`
                                        )
                                      ) {
                                        updateOrderStatus(ord.id, "İptal / İade");
                                      }
                                    }}
                                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 font-bold cursor-pointer"
                                  >
                                    ✕ İptal Et
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDocumentOrder({ order: ord, type: "magaza_karti" })
                                    }
                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                  >
                                    Mağaza Kartı Yazdır
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDocumentOrder({ order: ord, type: "mesafeli_satis" })
                                    }
                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                  >
                                    Mesafeli Satış Sözleşmesi
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDocumentOrder({ order: ord, type: "on_bilgilendirme" })
                                    }
                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                  >
                                    Ön Bilgilendirme Formu
                                  </button>
                                  <button
                                    onClick={() => setBillingInfoOrder(ord)}
                                    className="w-full text-left px-3 py-2 hover:bg-blue-50 text-blue-700 font-bold cursor-pointer"
                                  >
                                    Fatura Bilgilerini Görüntüle
                                  </button>
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {/* 3. DURUM: TAŞIMA DURUMUNDA (Kargoda) */}
                        {ord.status === "Kargoda" && (
                          <>
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `#${ord.id} numaralı siparişi "Teslim Edildi" olarak işaretlemek istiyor musunuz?`
                                  )
                                ) {
                                  updateOrderStatus(
                                    ord.id,
                                    "Teslim Edildi",
                                    "Kargo müşteriye başarıyla teslim edildi."
                                  );
                                }
                              }}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-2 rounded shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              ✓ Teslim Edildi Yap
                            </button>

                            <button
                              onClick={() => setCargoLabelOrder(ord)}
                              className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold text-[10px] py-1.5 rounded transition-colors cursor-pointer"
                            >
                              Kargo Etiketi Yazdır
                            </button>

                            <div className="relative group">
                              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[11px] py-1.5 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer">
                                İşlemler ▾
                              </button>
                              <div className="absolute right-0 top-full pt-1 w-52 z-50 hidden group-hover:block text-left text-xs shadow-xl rounded overflow-hidden">
                                <div className="bg-white border text-gray-700 divide-y divide-gray-100">
                                  <button
                                    onClick={() => setCustomCarrierOrder(ord)}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                  >
                                    Kargo Takip No Güncelle
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          `#${ord.id} numaralı kargodaki siparişi iptal/iade etmek istiyor musunuz?`
                                        )
                                      ) {
                                        updateOrderStatus(ord.id, "İptal / İade");
                                      }
                                    }}
                                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 font-bold cursor-pointer"
                                  >
                                    İptal / İade Et
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDocumentOrder({ order: ord, type: "magaza_karti" })
                                    }
                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                  >
                                    Mağaza Kartı Yazdır
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDocumentOrder({ order: ord, type: "mesafeli_satis" })
                                    }
                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                  >
                                    Mesafeli Satış Sözleşmesi
                                  </button>
                                  <button
                                    onClick={() => setBillingInfoOrder(ord)}
                                    className="w-full text-left px-3 py-2 hover:bg-blue-50 text-blue-700 font-bold cursor-pointer"
                                  >
                                    Fatura Bilgilerini Görüntüle
                                  </button>
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {/* 4. DURUM: TESLİM EDİLDİ / İPTAL VEYA ASKI (Ödeme Bekleyen) */}
                        {(ord.status === "Teslim Edildi" ||
                          ord.status === "İptal / İade" ||
                          isUnpaidOrder(ord)) && (
                          <>
                            <div
                              className={`text-center font-bold text-[11px] py-1.5 px-2 rounded border ${
                                ord.status === "Teslim Edildi"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : ord.status === "İptal / İade"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {isUnpaidOrder(ord) ? "Ödeme Tamamlanmadı" : ord.status}
                            </div>

                            <div className="relative group">
                              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[11px] py-1.5 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer">
                                İşlemler ▾
                              </button>
                              <div className="absolute right-0 top-full pt-1 w-52 z-50 hidden group-hover:block text-left text-xs shadow-xl rounded overflow-hidden">
                                <div className="bg-white border text-gray-700 divide-y divide-gray-100">
                                  {isUnpaidOrder(ord) && (
                                    <button
                                      onClick={() =>
                                        updateOrderStatus(
                                          ord.id,
                                          "Yeni",
                                          "Yönetici tarafından manuel onaylandı."
                                        )
                                      }
                                      className="w-full text-left px-3 py-2 text-emerald-600 hover:bg-emerald-50 font-bold cursor-pointer"
                                    >
                                      ✓ Ödemeyi Onayla (Yeni Yap)
                                    </button>
                                  )}
                                  <button
                                    onClick={() =>
                                      setDocumentOrder({ order: ord, type: "magaza_karti" })
                                    }
                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                  >
                                    Mağaza Kartı Yazdır
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDocumentOrder({ order: ord, type: "mesafeli_satis" })
                                    }
                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                  >
                                    Mesafeli Satış Sözleşmesi
                                  </button>
                                  <button
                                    onClick={() => setBillingInfoOrder(ord)}
                                    className="w-full text-left px-3 py-2 hover:bg-blue-50 text-blue-700 font-bold cursor-pointer"
                                  >
                                    Fatura Bilgilerini Görüntüle
                                  </button>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
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
  );
}
