"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Filter,
  Download,
  Plus,
  Square,
  CheckSquare,
  AlertCircle,
  Truck,
  Eye,
  Calendar,
} from "lucide-react";
import { useOrderStore, OrderRecord, OrderStatus } from "@/stores/orderStore";
import { formatPrice } from "@/lib/products";
import CargoLabelPrint from "@/components/admin/CargoLabelPrint";
import InvoiceModal from "@/components/admin/InvoiceModal";

const TABS = [
  { id: "all", label: "Tüm Siparişler" },
  { id: "Ödeme Bekliyor", label: "Ödeme Bekleyen" },
  { id: "Hazırlanıyor", label: "İşleme Alınanlar" },
  { id: "Kargoda", label: "Taşıma Durumunda" },
  { id: "Teslim Edildi", label: "Teslim Edilen" },
  { id: "İptal Edildi", label: "İptal / İade" },
];

export default function AdminSiparislerTrendyol() {
  const router = useRouter();
  const {
    orders,
    updateOrderStatus,
    bulkUpdateStatus,
    fetchOrders,
  } = useOrderStore();

  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Modals
  const [cargoLabelOrder, setCargoLabelOrder] = useState<OrderRecord | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<OrderRecord | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState("all");
  const [searchNo, setSearchNo] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [searchBarcode, setSearchBarcode] = useState("");
  const [searchTracking, setSearchTracking] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
        fetchOrders();
      } else {
        router.replace("/admin/giris");
      }
    } catch {
      router.replace("/admin/giris");
    }
  }, [router, fetchOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (activeTab !== "all" && o.status !== activeTab) return false;
      if (searchNo && !o.id.includes(searchNo)) return false;
      if (searchCustomer && !o.customerName.toLowerCase().includes(searchCustomer.toLowerCase())) return false;
      if (searchTracking && !o.trackingNumber?.includes(searchTracking)) return false;
      
      // Barkod araması
      if (searchBarcode) {
        const hasItem = o.items.some(i => i.id.toString().includes(searchBarcode) || i.name.toLowerCase().includes(searchBarcode.toLowerCase()));
        if (!hasItem) return false;
      }
      return true;
    });
  }, [orders, activeTab, searchNo, searchCustomer, searchBarcode, searchTracking]);

  const handleSelectAll = () => {
    if (selectedIds.length === filteredOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map(o => o.id));
    }
  };

  const handleToggle = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkAction = (status: OrderStatus) => {
    if (!selectedIds.length) return;
    bulkUpdateStatus(selectedIds, status);
    setSelectedIds([]);
  };

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans pb-16 text-sm">
      {/* Modals */}
      {cargoLabelOrder && (
        <CargoLabelPrint order={cargoLabelOrder} onClose={() => setCargoLabelOrder(null)} />
      )}
      {invoiceOrder && (
        <InvoiceModal 
          order={invoiceOrder} 
          onClose={() => setInvoiceOrder(null)} 
          onInvoiceCreated={() => {
            updateOrderStatus(invoiceOrder.id, "Kargoda", "Fatura oluşturuldu ve kargoya verildi.");
            setInvoiceOrder(null);
          }} 
        />
      )}

      {/* TABS (Trendyol Style) */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container-custom max-w-full px-6 flex items-end gap-6 overflow-x-auto">
          {TABS.map(tab => {
            const count = tab.id === "all" ? orders.length : orders.filter(o => o.status === tab.id).length;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center pb-2 px-2 border-b-2 transition-colors whitespace-nowrap ${isActive ? "border-[#f27a1a] text-[#f27a1a]" : "border-transparent text-gray-500 hover:text-gray-800"}`}
              >
                <span className="font-bold mb-1">{tab.label}</span>
                <span className={`text-[11px] font-bold ${isActive ? "text-[#f27a1a]" : "text-gray-400"}`}>
                  {count} Sipariş
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="container-custom max-w-full px-6 py-6 space-y-4">
        
        {/* FILTERS (Trendyol Style) */}
        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-[11px] text-gray-500 font-bold block mb-1">Müşteri Adı</label>
              <input type="text" value={searchCustomer} onChange={(e) => setSearchCustomer(e.target.value)} className="w-full border border-gray-300 rounded p-2 text-xs focus:border-[#f27a1a] focus:ring-1 focus:ring-[#f27a1a] outline-none" />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 font-bold block mb-1">Sipariş No</label>
              <input type="text" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="w-full border border-gray-300 rounded p-2 text-xs focus:border-[#f27a1a] focus:ring-1 focus:ring-[#f27a1a] outline-none" />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 font-bold block mb-1">Barkod / Ürün Adı</label>
              <input type="text" value={searchBarcode} onChange={(e) => setSearchBarcode(e.target.value)} className="w-full border border-gray-300 rounded p-2 text-xs focus:border-[#f27a1a] focus:ring-1 focus:ring-[#f27a1a] outline-none" />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 font-bold block mb-1">Kargo Kodu</label>
              <input type="text" value={searchTracking} onChange={(e) => setSearchTracking(e.target.value)} className="w-full border border-gray-300 rounded p-2 text-xs focus:border-[#f27a1a] focus:ring-1 focus:ring-[#f27a1a] outline-none" />
            </div>
            <div className="flex items-end gap-2">
              <button onClick={() => { setSearchCustomer(""); setSearchNo(""); setSearchBarcode(""); setSearchTracking(""); }} className="flex-1 border border-gray-300 text-gray-600 font-bold py-2 rounded text-xs hover:bg-gray-50">Temizle</button>
              <button className="flex-1 bg-[#333] text-white font-bold py-2 rounded text-xs hover:bg-black">Filtrele</button>
            </div>
          </div>
        </div>

        {/* TABLE CONTROLS */}
        <div className="flex justify-between items-center bg-white p-3 rounded-t-md border border-b-0 border-gray-200">
          <div className="flex gap-2">
            <select className="border border-gray-300 rounded p-1.5 text-xs text-gray-700 bg-gray-50 font-bold outline-none">
              <option>Toplu İşlemler</option>
              <option value="hazirlaniyor">Seçilenleri İşleme Al</option>
              <option value="kargoda">Seçilenleri Kargoya Ver</option>
            </select>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-gray-500">Filtreleme Sonuçları: Toplam <strong className="text-gray-800">{filteredOrders.length}</strong> sipariş bilgisi</span>
            <button className="flex items-center gap-1 border border-gray-300 rounded px-3 py-1.5 text-gray-600 font-bold hover:bg-gray-50">
              <Download size={14} /> Excel İle İndir
            </button>
          </div>
        </div>

        {/* TABLE (Trendyol Style) */}
        <div className="bg-white border border-gray-200 rounded-b-md overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8f8f8] text-gray-600 border-b border-gray-200">
              <tr>
                <th className="p-3 w-10 text-center">
                  <button onClick={handleSelectAll} className="text-gray-400 hover:text-[#f27a1a]">
                    {selectedIds.length > 0 && selectedIds.length === filteredOrders.length ? <CheckSquare size={16} className="text-[#f27a1a]" /> : <Square size={16} />}
                  </button>
                </th>
                <th className="p-3 font-bold">Sipariş Bilgileri <Filter size={12} className="inline ml-1 text-gray-400" /></th>
                <th className="p-3 font-bold w-48">Alıcı</th>
                <th className="p-3 font-bold w-72">Bilgiler</th>
                <th className="p-3 font-bold">Birim Fiyat</th>
                <th className="p-3 font-bold">Kargo <Filter size={12} className="inline ml-1 text-gray-400" /></th>
                <th className="p-3 font-bold">Fatura <Filter size={12} className="inline ml-1 text-gray-400" /></th>
                <th className="p-3 font-bold text-center">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-gray-500 font-medium">Arama kriterlerine uygun sipariş bulunamadı.</td>
                </tr>
              ) : (
                filteredOrders.map(ord => {
                  const isSelected = selectedIds.includes(ord.id);
                  
                  return (
                    <tr key={ord.id} className={`hover:bg-gray-50 ${isSelected ? "bg-orange-50/30" : ""}`}>
                      <td className="p-3 text-center align-top">
                        <button onClick={() => handleToggle(ord.id)} className="text-gray-400 hover:text-[#f27a1a]">
                          {isSelected ? <CheckSquare size={16} className="text-[#f27a1a]" /> : <Square size={16} />}
                        </button>
                      </td>
                      
                      {/* Sipariş Bilgileri */}
                      <td className="p-3 align-top space-y-1 text-gray-600">
                        <div className="font-bold text-[#f27a1a] flex items-center gap-1">
                          <span className="text-[10px]">📦</span> #{ord.id}
                        </div>
                        <div>Sipariş Tarihi: <span className="font-bold">{ord.date.split(" ")[0]} {ord.date.split(" ")[1]}</span></div>
                        <div className="text-[10px] text-gray-400">Ödeme: {ord.paymentMethod}</div>
                        {ord.status === "Hazırlanıyor" && (
                          <div className="text-[#f27a1a] font-bold text-[11px] mt-2">Kalan Süre: <br/>0 gün 02 saat 05 dakika</div>
                        )}
                      </td>
                      
                      {/* Alıcı */}
                      <td className="p-3 align-top">
                        <div className="flex items-start gap-2">
                          <div className="text-yellow-500 mt-0.5">★</div>
                          <div>
                            <div className="font-bold text-gray-800">{ord.customerName}</div>
                            <div className="text-[10px] text-[#f27a1a] font-bold mb-1">OnbSağlık Plus'lı</div>
                            <div className="text-[10px] text-gray-500 line-clamp-3">{ord.deliveryAddress}</div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Bilgiler (Ürünler) */}
                      <td className="p-3 align-top">
                        <div className="space-y-3">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex gap-2">
                              <div className="w-12 h-12 border rounded bg-white p-1 flex-shrink-0 relative">
                                <Image src={item.image || "/placeholder.png"} alt={item.name} fill className="object-contain" unoptimized />
                                <div className="absolute -top-2 -left-2 bg-blue-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-white">
                                  {item.quantity}
                                </div>
                              </div>
                              <div className="text-[11px] text-gray-600">
                                <div className="font-bold text-blue-600 line-clamp-2 hover:underline cursor-pointer">{item.name}</div>
                                <div><span className="text-gray-400">Stok Kodu:</span> ONB-{item.id}</div>
                                <div><span className="text-gray-400">Barkod:</span> {item.id}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      
                      {/* Birim Fiyat */}
                      <td className="p-3 align-top font-bold text-gray-700">
                        {formatPrice(ord.total)}
                      </td>
                      
                      {/* Kargo */}
                      <td className="p-3 align-top">
                        <div className="flex flex-col items-center justify-center space-y-1">
                          <div className="font-bold text-blue-800 text-sm flex items-center gap-1">
                            <Truck size={16} /> {ord.carrier.split(" ")[0]}
                          </div>
                          <div className="font-bold text-gray-700">{ord.trackingNumber || "-"}</div>
                          <div className="text-[10px] text-gray-400">Anlaşmalı kargo</div>
                        </div>
                      </td>
                      
                      {/* Fatura */}
                      <td className="p-3 align-top text-center space-y-1.5">
                        <div className="text-gray-500">Satış Tutarı: <br/><strong className="text-gray-800">{formatPrice(ord.total)}</strong></div>
                        {ord.status === "Kargoda" || ord.status === "Teslim Edildi" ? (
                          <div className="text-emerald-600 font-bold text-[10px] flex justify-center items-center gap-1"><CheckSquare size={12}/> Fatura Kesildi</div>
                        ) : (
                          <div className="text-red-500 font-bold text-[10px] flex justify-center items-center gap-1"><AlertCircle size={12}/> Fatura Bekleniyor</div>
                        )}
                        <select 
                          onChange={(e) => { if(e.target.value === "fatura") setInvoiceOrder(ord); e.target.value = ""; }}
                          className="w-full border border-gray-300 rounded p-1 text-[10px] text-gray-700 outline-none hover:border-gray-400 cursor-pointer"
                        >
                          <option value="">Fatura İşlemleri ▾</option>
                          <option value="fatura">Fatura Oluştur</option>
                        </select>
                      </td>
                      
                      {/* Durum / İşlemler */}
                      <td className="p-3 align-top space-y-2">
                        <button 
                          onClick={() => setCargoLabelOrder(ord)}
                          className="w-full border border-orange-200 text-orange-600 hover:bg-orange-50 font-bold text-[10px] py-1.5 rounded transition-colors"
                        >
                          Kargo Etiketini A4 Yazdır
                        </button>
                        <button className="w-full border border-orange-200 text-orange-600 hover:bg-orange-50 font-bold text-[10px] py-1.5 rounded transition-colors">
                          Kargo Etiketini Sticker Yazdır
                        </button>
                        
                        <div className="relative group">
                          <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[11px] py-1.5 rounded transition-colors flex items-center justify-center gap-1">
                            İşlemler ▾
                          </button>
                          
                          {/* İşlemler Dropdown */}
                          <div className="absolute right-0 top-8 w-48 bg-white border shadow-lg rounded z-10 hidden group-hover:block text-left text-xs text-gray-700 overflow-hidden">
                            {ord.status === "Ödeme Bekliyor" && (
                              <button onClick={() => updateOrderStatus(ord.id, "Hazırlanıyor")} className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b">İşleme Al</button>
                            )}
                            {ord.status === "Hazırlanıyor" && (
                              <button onClick={() => updateOrderStatus(ord.id, "Kargoda")} className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b text-blue-600 font-bold">Kargoya Ver</button>
                            )}
                            {ord.status === "Kargoda" && (
                              <button onClick={() => updateOrderStatus(ord.id, "Teslim Edildi")} className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b text-emerald-600 font-bold">Teslim Edildi İşaretle</button>
                            )}
                            <button className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b">Başka Kargo Firması İle Gönder</button>
                            <button onClick={() => updateOrderStatus(ord.id, "İptal Edildi")} className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 border-b">İptal Et</button>
                            <button className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b">Mesafeli Satış Sözleşmesi</button>
                            <button className="w-full text-left px-3 py-2 hover:bg-gray-50">Ön Bilgilendirme Formu</button>
                          </div>
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
  );
}
