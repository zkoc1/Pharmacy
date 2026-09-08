"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Plus, Search, Edit2, Trash2, CheckCircle, 
  XCircle, Package, TrendingUp, Filter, Eye, EyeOff 
} from "lucide-react";
import { useAdminProductStore } from "@/stores/adminProductStore";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/products";

export default function AdminUrunlerPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const { products, setInitialProducts, addProduct, updateProduct, deleteProduct, toggleStatus } = useAdminProductStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft">("all");
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Add Form State
  const [newProd, setNewProd] = useState({
    name: "",
    brand: "",
    category: "",
    price: "",
    marketPrice: "",
    stock: "100",
    image: "",
    barcode: ""
  });

  // Edit Form State
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editMarketPrice, setEditMarketPrice] = useState("");

  // Notification
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    const rawSession = localStorage.getItem("admin_session");
    if (!rawSession) {
      router.replace("/admin/giris");
      return;
    }
    try {
      const parsed = JSON.parse(rawSession);
      if (parsed.role === "super_admin" || parsed.role === "admin") {
        setIsAuthorized(true);
      } else {
        router.replace("/admin/giris");
        return;
      }
    } catch {
      router.replace("/admin/giris");
      return;
    }

    // Initialize products from JSON if store is empty
    import("@/data/products.json").then((m) => {
      setInitialProducts(m.default as Product[]);
    });
  }, [router, setInitialProducts]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || (p.barcode && p.barcode.includes(q));
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct({
      name: newProd.name,
      slug: newProd.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      brand: newProd.brand || "OnbSağlık",
      brandSlug: (newProd.brand || "OnbSağlık").toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: newProd.category,
      categorySlug: newProd.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      price: parseFloat(newProd.price) || 0,
      marketPrice: parseFloat(newProd.marketPrice) || 0,
      stock: parseInt(newProd.stock) || 0,
      vatRate: 10,
      images: newProd.image ? [newProd.image] : [],
      barcode: newProd.barcode,
      status: "active",
      description: "Yeni eklenen ürün açıklaması.",
      desi: 1,
      trendyolLink: ""
    });
    
    setShowAddModal(false);
    showToast("✅ Ürün başarıyla eklendi!");
    setNewProd({ name: "", brand: "", category: "", price: "", marketPrice: "", stock: "100", image: "", barcode: "" });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    updateProduct(editingProduct.id, {
      price: parseFloat(editPrice) || editingProduct.price,
      marketPrice: parseFloat(editMarketPrice) || editingProduct.marketPrice,
      stock: parseInt(editStock) || editingProduct.stock
    });
    
    setEditingProduct(null);
    showToast("✅ Ürün güncellendi!");
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`"${name}" ürününü silmek istediğinize emin misiniz?`)) {
      deleteProduct(id);
      showToast("🗑️ Ürün silindi.");
    }
  };

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      {/* Toast Bildirimi */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-[9999] bg-gray-900 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4">
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-sky-950 via-sky-900 to-indigo-950 text-white px-6 py-5 shadow-lg">
        <div className="container-custom max-w-7xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-2xl transition-all flex items-center gap-1 text-xs font-bold">
              <ArrowLeft size={16} /> Panel
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-sky-500/20 text-sky-300 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border border-sky-500/30">
                  PIM Sistemi
                </span>
                <h1 className="text-lg font-black tracking-tight">Ürün ve Stok Yönetimi</h1>
              </div>
              <p className="text-xs text-sky-200/70 font-medium">Katalog kontrolü, fiyatlandırma ve envanter yönetimi</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-sky-500 hover:bg-sky-400 text-gray-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus size={15} /> Yeni Ürün Ekle
            </button>
          </div>
        </div>
      </header>

      <div className="container-custom max-w-7xl py-8 space-y-6">
        
        {/* İstatistikler */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl"><Package size={20} /></div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Toplam Ürün</span>
              <p className="text-xl font-black text-gray-900">{products.length}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle size={20} /></div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Yayında (Aktif)</span>
              <p className="text-xl font-black text-emerald-600">{products.filter(p => p.status === "active").length}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><EyeOff size={20} /></div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Taslak / Gizli</span>
              <p className="text-xl font-black text-amber-600">{products.filter(p => p.status === "draft").length}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl"><TrendingUp size={20} /></div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Tükenen Stok</span>
              <p className="text-xl font-black text-red-600">{products.filter(p => p.stock <= 0).length}</p>
            </div>
          </div>
        </div>

        {/* Araç Çubuğu */}
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Ürün Adı, Marka veya Barkod Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="flex bg-gray-100 p-1 rounded-2xl w-full md:w-auto">
            {(["all", "active", "draft"] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st ? "bg-white text-sky-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {st === "all" ? "Tümü" : st === "active" ? "Yayındakiler" : "Taslaklar"}
              </button>
            ))}
          </div>
        </div>

        {/* Tablo */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-gray-100 text-gray-500 font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4 w-16">Görsel</th>
                  <th className="p-4">Ürün Bilgisi</th>
                  <th className="p-4">Kategori / Marka</th>
                  <th className="p-4">Fiyat</th>
                  <th className="p-4">Stok</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-gray-400 font-medium">Ürün bulunamadı.</td>
                  </tr>
                ) : (
                  filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="w-10 h-10 rounded-lg border border-gray-100 overflow-hidden bg-white flex items-center justify-center">
                          {p.images && p.images.length > 0 ? (
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain p-1" />
                          ) : (
                            <Package size={20} className="text-gray-300" />
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-extrabold text-gray-900 line-clamp-1">{p.name}</div>
                        {p.barcode && <div className="text-[10px] text-gray-400 font-mono mt-0.5">Barkod: {p.barcode}</div>}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-700">{p.category}</div>
                        <div className="text-[10px] text-gray-500 font-semibold">{p.brand}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-black text-sky-700">{formatPrice(p.price)}</div>
                        {p.marketPrice > p.price && (
                          <div className="text-[10px] text-gray-400 line-through">{formatPrice(p.marketPrice)}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                          p.stock > 10 ? "bg-emerald-50 text-emerald-700" : 
                          p.stock > 0 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                        }`}>
                          {p.stock} Adet
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => { toggleStatus(p.id); showToast(`Durum değiştirildi: ${p.status === 'active' ? 'Taslak' : 'Aktif'}`); }}
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 w-fit transition-colors ${
                            p.status === "active" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {p.status === "active" ? <Eye size={12}/> : <EyeOff size={12}/>}
                          {p.status === "active" ? "Yayında" : "Taslak"}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setEditPrice(String(p.price));
                              setEditMarketPrice(String(p.marketPrice || ""));
                              setEditStock(String(p.stock));
                            }}
                            className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* YENİ ÜRÜN EKLEME MODALİ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50">
              <h3 className="font-black text-lg text-gray-900 flex items-center gap-2">
                <Plus className="text-sky-600" /> Yeni Ürün Ekle
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Ürün Adı *</label>
                  <input required type="text" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none" placeholder="Örn: Solgar Vitamin C 1000 mg" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Kategori *</label>
                  <select required value={newProd.category} onChange={e => setNewProd({...newProd, category: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none">
                    <option value="">Kategori Seçin</option>
                    <option value="Vitamin & Takviye">Vitamin & Takviye</option>
                    <option value="Güneş Bakımı">Güneş Bakımı</option>
                    <option value="Cilt Bakımı">Cilt Bakımı</option>
                    <option value="Saç Bakımı">Saç Bakımı</option>
                    <option value="Anne & Bebek">Anne & Bebek</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Marka</label>
                  <input type="text" value={newProd.brand} onChange={e => setNewProd({...newProd, brand: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none" placeholder="Örn: Solgar" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Satış Fiyatı (TL) *</label>
                  <input required type="number" step="0.01" value={newProd.price} onChange={e => setNewProd({...newProd, price: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none" placeholder="0.00" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Piyasa Fiyatı (TL - Üstü Çizili)</label>
                  <input type="number" step="0.01" value={newProd.marketPrice} onChange={e => setNewProd({...newProd, marketPrice: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none" placeholder="0.00" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Stok Miktarı *</label>
                  <input required type="number" value={newProd.stock} onChange={e => setNewProd({...newProd, stock: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Barkod No</label>
                  <input type="text" value={newProd.barcode} onChange={e => setNewProd({...newProd, barcode: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none" placeholder="869..." />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Görsel URL (İsteğe Bağlı)</label>
                  <input type="url" value={newProd.image} onChange={e => setNewProd({...newProd, image: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none" placeholder="https://..." />
                </div>
              </div>
              
              <div className="pt-4 border-t mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                  İptal
                </button>
                <button type="submit" className="px-6 py-2.5 text-xs font-black text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors shadow-md">
                  ÜRÜNÜ KAYDET
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HIZLI DÜZENLEME MODALİ */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="p-5 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-black text-gray-900 text-sm flex items-center gap-2"><Edit2 size={16} className="text-sky-600"/> Stok ve Fiyat Güncelle</h3>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              <p className="text-xs font-bold text-gray-500 line-clamp-2">{editingProduct.name}</p>
              
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Satış Fiyatı</label>
                <input required type="number" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-sky-500 outline-none" />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Piyasa Fiyatı</label>
                <input type="number" step="0.01" value={editMarketPrice} onChange={e => setEditMarketPrice(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-sky-500 outline-none" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Stok Miktarı</label>
                <input required type="number" value={editStock} onChange={e => setEditStock(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-sky-500 outline-none" />
              </div>

              <div className="pt-2 flex gap-2">
                <button type="submit" className="flex-1 px-4 py-2.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-md">
                  KAYDET
                </button>
                <button type="button" onClick={() => setEditingProduct(null)} className="px-4 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
