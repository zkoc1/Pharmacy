"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Plus, Search, Edit2, Trash2, CheckCircle, 
  XCircle, Package, TrendingUp, Filter, Eye, EyeOff,
  Barcode, ArrowUpDown, ArrowUp, ArrowDown, Check, X, RefreshCw
} from "lucide-react";
import { useAdminProductStore } from "@/stores/adminProductStore";
import { getValidAdminSession } from "@/lib/authUtils";
import type { Product, ProductStatus } from "@/types";
import { formatPrice } from "@/lib/products";

type SortOption = 
  | "default"      // En Yeni (ID Azalan)
  | "id-asc"       // En Eski (ID Artan)
  | "name-asc"     // Alfabetik: A'dan Z'ye
  | "name-desc"    // Alfabetik: Z'den A'ya
  | "price-asc"    // Fiyat: En Düşük (Artan)
  | "price-desc"   // Fiyat: En Yüksek (Azalan)
  | "stock-asc"    // Stok: En Az (Tükenenler)
  | "stock-desc";  // Stok: En Çok

export default function AdminUrunlerPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const { products, setProducts, addProduct, updateProduct, deleteProduct, toggleStatus } = useAdminProductStore();
  
  // Arama, Filtre ve Sıralama
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "passive" | "outOfStock">("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  // Toplu Seçim & İşlem
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Satır bazlı durum değiştirme yükleniyor durumu
  const [loadingStatusId, setLoadingStatusId] = useState<number | null>(null);

  // Sayfalama
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(50);
  
  // Modallar
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Upload State
  const [uploading, setUploading] = useState(false);

  // Add Form State
  const [newProd, setNewProd] = useState<{
    name: string; brand: string; category: string; price: string; marketPrice: string;
    stock: string; images: string[]; barcode: string; status: "active" | "passive";
    longDescription: string; ingredients: string;
  }>({
    name: "",
    brand: "",
    category: "",
    price: "",
    marketPrice: "",
    stock: "100",
    images: [],
    barcode: "",
    status: "active",
    longDescription: "",
    ingredients: ""
  });

  // Edit Form State
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editMarketPrice, setEditMarketPrice] = useState("");
  const [editLongDescription, setEditLongDescription] = useState("");
  const [editIngredients, setEditIngredients] = useState("");
  const [editBarcode, setEditBarcode] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "passive">("active");

  // Bildirim Toast
  const [toastMsg, setToastMsg] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Fetch hatası:", err);
    }
  };

  useEffect(() => {
    const session = getValidAdminSession();
    if (!session) {
      router.replace("/admin/giris?expired=1");
      return;
    }
    setIsAuthorized(true);
    fetchProducts();
  }, [router, setProducts]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // İstatistik Sayaçları
  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter(p => p.status === "active").length;
    const passive = products.filter(p => p.status === "passive" || p.status === "draft").length;
    const outOfStock = products.filter(p => (Number(p.stock) || 0) <= 0).length;
    return { total, active, passive, outOfStock };
  }, [products]);

  // Arama ve Filtreleme Mantığı (Barkod + İsim + Marka + Kategori)
  const filteredProducts = useMemo(() => {
    const cleanQ = searchQuery.trim().toLowerCase();
    const digitsQ = cleanQ.replace(/[^0-9]/g, "");

    return products.filter((p) => {
      // Durum Filtresi
      const isActive = p.status === "active";
      if (statusFilter === "active" && !isActive) return false;
      if (statusFilter === "passive" && isActive) return false;
      if (statusFilter === "outOfStock" && (Number(p.stock) || 0) > 0) return false;

      // Arama Yoksa Geç
      if (!cleanQ) return true;

      // 1. Barkodla Arama (Tam veya Kısmi Eşleşme, Boşluk/Tire Temizleme)
      const pBarcode = String(p.barcode || "").trim();
      const pBarcodeLower = pBarcode.toLowerCase();
      const pBarcodeDigits = pBarcode.replace(/[^0-9]/g, "");

      const matchBarcode = pBarcode && (
        pBarcodeLower.includes(cleanQ) || 
        (digitsQ.length >= 3 && pBarcodeDigits.includes(digitsQ)) ||
        (digitsQ.length > 0 && pBarcodeDigits === digitsQ)
      );

      if (matchBarcode) return true;

      // 2. İsim & Marka & Kategori & ID ile Arama (Türkçe Karakter Uyumlu)
      const matchName = (p.name || "").toLocaleLowerCase("tr").includes(cleanQ);
      const matchBrand = (p.brand || "").toLocaleLowerCase("tr").includes(cleanQ);
      const matchCategory = (p.category || "").toLocaleLowerCase("tr").includes(cleanQ);
      const matchId = cleanQ.startsWith("#") ? String(p.id) === cleanQ.slice(1) : String(p.id) === cleanQ;

      return matchName || matchBrand || matchCategory || matchId;
    });
  }, [products, searchQuery, statusFilter]);

  // Sıralama Mantığı (Alfabetik, Fiyat Artan/Azalan, Stok, Tarih)
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case "name-asc":
        return list.sort((a, b) => (a.name || "").toLocaleLowerCase("tr").localeCompare((b.name || "").toLocaleLowerCase("tr")));
      case "name-desc":
        return list.sort((a, b) => (b.name || "").toLocaleLowerCase("tr").localeCompare((a.name || "").toLocaleLowerCase("tr")));
      case "price-asc":
        return list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
      case "price-desc":
        return list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
      case "stock-asc":
        return list.sort((a, b) => (Number(a.stock) || 0) - (Number(b.stock) || 0));
      case "stock-desc":
        return list.sort((a, b) => (Number(b.stock) || 0) - (Number(a.stock) || 0));
      case "id-asc":
        return list.sort((a, b) => a.id - b.id);
      case "default":
      default:
        return list.sort((a, b) => b.id - a.id);
    }
  }, [filteredProducts, sortBy]);

  // Sayfalama Hesabı
  const totalPages = pageSize === 0 ? 1 : Math.ceil(sortedProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    if (pageSize === 0) return sortedProducts;
    const start = (currentPage - 1) * pageSize;
    return sortedProducts.slice(start, start + pageSize);
  }, [sortedProducts, currentPage, pageSize]);

  // Arama veya filtre değiştiğinde ilk sayfaya sıfırla
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortBy]);

  // Tekil Ürün Aktife / Pasife Alma
  const toggleProductStatus = async (p: Product, forceStatus?: "active" | "passive") => {
    const currentActive = p.status === "active";
    const nextStatus: "active" | "passive" = forceStatus ?? (currentActive ? "passive" : "active");
    
    setLoadingStatusId(p.id);
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        toggleStatus(p.id, nextStatus);
        showToast(
          nextStatus === "active"
            ? `🟢 "${p.name.slice(0, 30)}..." aktif edildi ve satışa açıldı!`
            : `⚪ "${p.name.slice(0, 30)}..." pasife alındı ve satıştan kaldırıldı.`
        );
      } else {
        const err = await res.json().catch(() => ({}));
        alert("Durum güncellenemedi: " + (err.error || "Hata oluştu"));
      }
    } catch {
      alert("Bağlantı hatası oluştu.");
    } finally {
      setLoadingStatusId(null);
    }
  };

  // Toplu Aktife / Pasife Alma
  const handleBulkStatusChange = async (targetStatus: "active" | "passive") => {
    if (selectedIds.length === 0) return;
    const actionLabel = targetStatus === "active" ? "aktife almak" : "pasife almak";
    if (!confirm(`Seçili ${selectedIds.length} ürünü ${actionLabel} istediğinize emin misiniz?`)) return;

    setBulkLoading(true);
    let successCount = 0;

    for (const id of selectedIds) {
      try {
        const res = await fetch(`/api/admin/products/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: targetStatus }),
        });
        if (res.ok) {
          toggleStatus(id, targetStatus);
          successCount++;
        }
      } catch (err) {
        console.error("Toplu güncelleme hatası:", id, err);
      }
    }

    setBulkLoading(false);
    setSelectedIds([]);
    showToast(`✅ ${successCount} ürün başarıyla ${targetStatus === 'active' ? 'Aktif' : 'Pasif'} yapıldı!`);
  };

  // Checkbox Seçim Yönetimi
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedProducts.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    let uploadedUrls: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (res.ok && data.url) {
          uploadedUrls.push(data.url);
        }
      } catch (err) {
        console.error(err);
      }
    }

    setNewProd(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
    setUploading(false);
    showToast(`✅ ${uploadedUrls.length} resim başarıyla yüklendi!`);
  };

  // Yeni Ürün Kaydet
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: newProd.name.trim(),
      slug: newProd.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      brand: newProd.brand.trim() || "OnbSağlık",
      brandSlug: (newProd.brand || "OnbSağlık").toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: newProd.category,
      categorySlug: newProd.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      price: parseFloat(newProd.price) || 0,
      marketPrice: parseFloat(newProd.marketPrice) || 0,
      stock: parseInt(newProd.stock) || 0,
      vatRate: 10,
      images: newProd.images,
      barcode: newProd.barcode.trim(),
      status: newProd.status,
      longDescription: newProd.longDescription,
      ingredients: newProd.ingredients,
      desi: 1,
      trendyolLink: ""
    };

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      const data = await res.json();
      if (res.ok && data.product) {
        addProduct(data.product);
        setShowAddModal(false);
        showToast("✅ Yeni ürün başarıyla eklendi!");
        setNewProd({ 
          name: "", brand: "", category: "", price: "", marketPrice: "", 
          stock: "100", images: [], barcode: "", status: "active", 
          longDescription: "", ingredients: "" 
        });
      } else {
        alert("Hata: " + (data.error || "Ürün eklenemedi"));
      }
    } catch {
      alert("Hata oluştu.");
    }
  };

  // Ürün Güncelle
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    const parsedStock = parseInt(editStock);
    const parsedPrice = parseFloat(editPrice);
    const parsedMarket = parseFloat(editMarketPrice);

    const updates = {
      name: editName.trim() || editingProduct.name,
      price: isNaN(parsedPrice) ? editingProduct.price : parsedPrice,
      marketPrice: isNaN(parsedMarket) ? editingProduct.marketPrice : parsedMarket,
      stock: isNaN(parsedStock) ? editingProduct.stock : parsedStock,
      barcode: editBarcode.trim(),
      status: editStatus,
      longDescription: editLongDescription,
      ingredients: editIngredients,
    };

    try {
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        updateProduct(editingProduct.id, updates);
        setEditingProduct(null);
        showToast("✅ Ürün bilgileri ve durumu güncellendi!");
      } else {
        const data = await res.json().catch(() => ({}));
        alert("Güncelleme hatası: " + (data.error || "Bilinmeyen hata"));
      }
    } catch {
      alert("Güncelleme hatası.");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`"${name}" ürününü tamamen silmek istediğinize emin misiniz?`)) {
      try {
        const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
        if (res.ok) {
          deleteProduct(id);
          showToast("🗑️ Ürün veritabanından silindi.");
        }
      } catch {
        alert("Silme hatası.");
      }
    }
  };

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      {/* Toast Bildirimi */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-[9999] bg-gray-900 text-white font-extrabold text-xs px-5 py-3.5 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 flex items-center gap-2 border border-white/10">
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
              <p className="text-xs text-sky-200/70 font-medium">Katalog kontrolü, fiyatlandırma, barkod arama ve aktif/pasif yönetimi</p>
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
        
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button 
            onClick={() => setStatusFilter("all")}
            className={`p-4 rounded-3xl border text-left transition-all ${
              statusFilter === "all" ? "bg-sky-50 border-sky-300 shadow-md ring-2 ring-sky-500/20" : "bg-white border-gray-100 shadow-sm hover:border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-sky-100 text-sky-700 rounded-xl"><Package size={20} /></div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Toplam Ürün</span>
                <p className="text-xl font-black text-gray-900">{stats.total}</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => setStatusFilter("active")}
            className={`p-4 rounded-3xl border text-left transition-all ${
              statusFilter === "active" ? "bg-emerald-50 border-emerald-300 shadow-md ring-2 ring-emerald-500/20" : "bg-white border-gray-100 shadow-sm hover:border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl"><CheckCircle size={20} /></div>
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Aktif (Satışta)
                </span>
                <p className="text-xl font-black text-emerald-600">{stats.active}</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => setStatusFilter("passive")}
            className={`p-4 rounded-3xl border text-left transition-all ${
              statusFilter === "passive" ? "bg-rose-50 border-rose-300 shadow-md ring-2 ring-rose-500/20" : "bg-white border-gray-100 shadow-sm hover:border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-700 rounded-xl"><EyeOff size={20} /></div>
              <div>
                <span className="text-[10px] font-bold text-rose-600 uppercase flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Pasif (Satışa Kapalı)
                </span>
                <p className="text-xl font-black text-rose-600">{stats.passive}</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => setStatusFilter("outOfStock")}
            className={`p-4 rounded-3xl border text-left transition-all ${
              statusFilter === "outOfStock" ? "bg-amber-50 border-amber-300 shadow-md ring-2 ring-amber-500/20" : "bg-white border-gray-100 shadow-sm hover:border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-xl"><TrendingUp size={20} /></div>
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase">Tükenen Stok</span>
                <p className="text-xl font-black text-amber-600">{stats.outOfStock}</p>
              </div>
            </div>
          </button>
        </div>

        {/* Toplu İşlem Barı (Ürün seçilince görünür) */}
        {selectedIds.length > 0 && (
          <div className="bg-indigo-900 text-white p-3.5 px-6 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="bg-indigo-700 px-3 py-1 rounded-lg">
                {selectedIds.length} ürün seçildi
              </span>
              <span>Toplu durum değişikliği:</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkStatusChange("active")}
                disabled={bulkLoading}
                className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check size={14} /> Seçilenleri Aktife Al
              </button>
              <button
                onClick={() => handleBulkStatusChange("passive")}
                disabled={bulkLoading}
                className="bg-rose-500 hover:bg-rose-400 text-white font-black text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <EyeOff size={14} /> Seçilenleri Pasife Al
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3 py-2 rounded-xl transition-all"
              >
                Vazgeç
              </button>
            </div>
          </div>
        )}

        {/* Arama ve Durum Filtre Çubuğu */}
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Barkod Okuyucu Destekli Arama Çubuğu */}
          <div className="relative w-full md:w-[480px]">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-gray-400">
              <Search size={16} />
              <Barcode size={18} className="text-sky-600 hidden sm:block" />
            </div>
            <input
              type="text"
              placeholder="Barkod, Ürün Adı veya Marka Ara (Barkod okuyucu destekli)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
              className="w-full pl-12 sm:pl-16 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                title="Aramayı Temizle"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Durum Filtreleme Sekmeleri */}
          <div className="flex bg-gray-100 p-1 rounded-2xl w-full md:w-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "all" ? "bg-white text-sky-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Tümü ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                statusFilter === "active" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Aktif ({stats.active})
            </button>
            <button
              onClick={() => setStatusFilter("passive")}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                statusFilter === "passive" ? "bg-white text-rose-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Pasif ({stats.passive})
            </button>
          </div>
        </div>

        {/* ÖZEL SIRALAMA SEKME VE BUTONLARI */}
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-gray-500 uppercase tracking-wide">
            <ArrowUpDown size={15} className="text-sky-600" />
            <span>Sıralama:</span>
          </div>

          {/* Hızlı Sıralama Sekmeleri (Pill Butonlar) */}
          <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
            <button
              onClick={() => setSortBy("default")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                sortBy === "default" 
                  ? "bg-sky-600 text-white shadow-sm" 
                  : "bg-slate-100 text-gray-600 hover:bg-slate-200"
              }`}
            >
              🕒 En Yeni
            </button>
            <button
              onClick={() => setSortBy("name-asc")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                sortBy === "name-asc" 
                  ? "bg-sky-600 text-white shadow-sm" 
                  : "bg-slate-100 text-gray-600 hover:bg-slate-200"
              }`}
            >
              🔤 İsim: A → Z
            </button>
            <button
              onClick={() => setSortBy("name-desc")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                sortBy === "name-desc" 
                  ? "bg-sky-600 text-white shadow-sm" 
                  : "bg-slate-100 text-gray-600 hover:bg-slate-200"
              }`}
            >
              🔤 İsim: Z → A
            </button>
            <button
              onClick={() => setSortBy("price-asc")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                sortBy === "price-asc" 
                  ? "bg-emerald-600 text-white shadow-sm" 
                  : "bg-slate-100 text-gray-600 hover:bg-slate-200"
              }`}
            >
              💰 Fiyat: En Düşük (Artan)
            </button>
            <button
              onClick={() => setSortBy("price-desc")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                sortBy === "price-desc" 
                  ? "bg-emerald-600 text-white shadow-sm" 
                  : "bg-slate-100 text-gray-600 hover:bg-slate-200"
              }`}
            >
              💰 Fiyat: En Yüksek (Azalan)
            </button>
            <button
              onClick={() => setSortBy("stock-asc")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                sortBy === "stock-asc" 
                  ? "bg-amber-600 text-white shadow-sm" 
                  : "bg-slate-100 text-gray-600 hover:bg-slate-200"
              }`}
            >
              📦 Stok: En Az
            </button>
            <button
              onClick={() => setSortBy("stock-desc")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                sortBy === "stock-desc" 
                  ? "bg-sky-600 text-white shadow-sm" 
                  : "bg-slate-100 text-gray-600 hover:bg-slate-200"
              }`}
            >
              📦 Stok: En Çok
            </button>
          </div>

          {/* Sayfa Başına Gösterim */}
          <div className="flex items-center gap-2 self-end lg:self-center">
            <span className="text-xs text-gray-400 font-semibold">Sayfa Başı:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={0}>Tümü ({sortedProducts.length})</option>
            </select>
          </div>
        </div>

        {/* ÜRÜN TABLOSU */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-gray-100 text-gray-500 font-extrabold uppercase text-[10px] tracking-wider select-none">
                <tr>
                  <th className="p-4 w-10 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={paginatedProducts.length > 0 && paginatedProducts.every(p => selectedIds.includes(p.id))}
                      className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-4 w-16">Görsel</th>
                  <th 
                    onClick={() => setSortBy(prev => prev === "name-asc" ? "name-desc" : "name-asc")}
                    className="p-4 cursor-pointer hover:text-sky-700 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Ürün Bilgisi</span>
                      {sortBy === "name-asc" ? <ArrowUp size={12} className="text-sky-600" /> : sortBy === "name-desc" ? <ArrowDown size={12} className="text-sky-600" /> : <ArrowUpDown size={12} className="opacity-40" />}
                    </div>
                  </th>
                  <th className="p-4">Kategori / Marka</th>
                  <th 
                    onClick={() => setSortBy(prev => prev === "price-asc" ? "price-desc" : "price-asc")}
                    className="p-4 cursor-pointer hover:text-sky-700 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Fiyat</span>
                      {sortBy === "price-asc" ? <ArrowUp size={12} className="text-emerald-600" /> : sortBy === "price-desc" ? <ArrowDown size={12} className="text-emerald-600" /> : <ArrowUpDown size={12} className="opacity-40" />}
                    </div>
                  </th>
                  <th 
                    onClick={() => setSortBy(prev => prev === "stock-asc" ? "stock-desc" : "stock-asc")}
                    className="p-4 cursor-pointer hover:text-sky-700 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Stok</span>
                      {sortBy === "stock-asc" ? <ArrowUp size={12} className="text-amber-600" /> : sortBy === "stock-desc" ? <ArrowDown size={12} className="text-amber-600" /> : <ArrowUpDown size={12} className="opacity-40" />}
                    </div>
                  </th>
                  <th className="p-4 text-center">Durum (Aktif / Pasif)</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-gray-400 font-medium">
                      <Package size={40} className="mx-auto mb-2 text-gray-300" />
                      Aradığınız kriterlere uygun ürün bulunamadı.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map(p => {
                    const isActive = p.status === "active";
                    const isSelected = selectedIds.includes(p.id);
                    const isLoading = loadingStatusId === p.id;
                    const cleanQ = searchQuery.trim().toLowerCase();
                    const isBarcodeMatch = cleanQ && p.barcode && String(p.barcode).toLowerCase().includes(cleanQ);

                    return (
                      <tr 
                        key={p.id} 
                        className={`transition-colors ${
                          isSelected ? "bg-sky-50/60" : !isActive ? "bg-rose-50/20 hover:bg-rose-50/40" : "hover:bg-slate-50/50"
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(p.id)}
                            className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                          />
                        </td>

                        {/* Görsel */}
                        <td className="p-4">
                          <div className="w-12 h-12 rounded-xl border border-gray-100 overflow-hidden bg-white flex items-center justify-center shadow-xs">
                            {p.images && p.images.length > 0 ? (
                              <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain p-1" />
                            ) : (
                              <Package size={20} className="text-gray-300" />
                            )}
                          </div>
                        </td>

                        {/* Ürün Adı & Barkod */}
                        <td className="p-4 max-w-xs">
                          <div className="font-extrabold text-gray-900 line-clamp-2 leading-snug">
                            {p.name}
                          </div>
                          <div className="mt-1 flex items-center gap-2 flex-wrap">
                            {p.barcode ? (
                              <span className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${
                                isBarcodeMatch ? "bg-amber-200 text-amber-900 ring-2 ring-amber-400" : "bg-gray-100 text-gray-600"
                              }`}>
                                <Barcode size={12} />
                                {p.barcode}
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-400 font-mono italic">Barkodsuz</span>
                            )}
                            <span className="text-[10px] text-gray-400 font-mono">#{p.id}</span>
                          </div>
                        </td>

                        {/* Kategori & Marka */}
                        <td className="p-4">
                          <div className="font-bold text-gray-800">{p.category || "-"}</div>
                          <div className="text-[10px] text-gray-500 font-semibold uppercase">{p.brand || "-"}</div>
                        </td>

                        {/* Fiyat */}
                        <td className="p-4">
                          <div className="font-black text-sky-700 text-sm">{formatPrice(Number(p.price) || 0)}</div>
                          {p.marketPrice && Number(p.marketPrice) > Number(p.price) && (
                            <div className="text-[10px] text-gray-400 line-through font-semibold">
                              {formatPrice(Number(p.marketPrice))}
                            </div>
                          )}
                        </td>

                        {/* Stok */}
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black inline-block ${
                            p.stock > 10 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : 
                            p.stock > 0 ? "bg-amber-50 text-amber-700 border border-amber-200" : 
                            "bg-red-50 text-red-700 border border-red-200"
                          }`}>
                            {p.stock} Adet
                          </span>
                        </td>

                        {/* DURUM (AKTİFE AL / PASİFE AL TOGGLE BUTONU) */}
                        <td className="p-4 text-center">
                          <button
                            onClick={() => toggleProductStatus(p)}
                            disabled={isLoading}
                            className={`group relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-black transition-all shadow-xs cursor-pointer ${
                              isActive
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300"
                                : "bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300"
                            }`}
                            title={isActive ? "Tıklayarak ürünü PASİF yapın (satıştan kaldırın)" : "Tıklayarak ürünü AKTİF yapın (satışa açın)"}
                          >
                            {isLoading ? (
                              <RefreshCw size={12} className="animate-spin text-current" />
                            ) : (
                              <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-600 animate-pulse" : "bg-rose-600"}`} />
                            )}
                            <span>{isActive ? "Aktif" : "Pasif"}</span>
                            <span className="text-[9px] opacity-70 group-hover:opacity-100 font-bold underline ml-0.5">
                              {isActive ? "(Pasife Al)" : "(Aktife Al)"}
                            </span>
                          </button>
                        </td>

                        {/* İşlemler */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setEditName(p.name);
                                setEditPrice(String(p.price));
                                setEditMarketPrice(String(p.marketPrice || ""));
                                setEditStock(String(p.stock));
                                setEditBarcode(p.barcode || "");
                                setEditStatus(p.status === "active" ? "active" : "passive");
                                setEditLongDescription(p.longDescription || "");
                                setEditIngredients(p.ingredients || "");
                              }}
                              className="p-2 text-sky-600 hover:bg-sky-50 rounded-xl transition-colors"
                              title="Ürünü Düzenle"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                              title="Ürünü Sil"
                            >
                              <Trash2 size={16} />
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

          {/* Sayfalama Alt Barı */}
          {pageSize > 0 && totalPages > 1 && (
            <div className="p-4 bg-slate-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-gray-500 font-semibold">
                Toplam <strong>{sortedProducts.length}</strong> üründen{" "}
                <strong>{(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, sortedProducts.length)}</strong> arası gösteriliyor
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Önceki
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-xl font-black text-xs transition-all ${
                        currentPage === pageNum 
                          ? "bg-sky-600 text-white shadow-sm" 
                          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* YENİ ÜRÜN EKLEME MODALİ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
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
                  <label className="block text-xs font-bold text-gray-700 mb-1">Barkod No (EAN / GTIN)</label>
                  <input type="text" value={newProd.barcode} onChange={e => setNewProd({...newProd, barcode: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-sky-500 outline-none" placeholder="869..." />
                </div>

                {/* Ürün Durumu (Aktif / Pasif) */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-2">Yayın Durumu (Aktif / Pasif) *</label>
                  <div className="flex gap-4">
                    <label className={`flex-1 p-3 rounded-2xl border-2 cursor-pointer flex items-center gap-2.5 transition-all ${
                      newProd.status === "active" ? "border-emerald-500 bg-emerald-50/50 text-emerald-900" : "border-gray-200 bg-gray-50 text-gray-600"
                    }`}>
                      <input
                        type="radio"
                        name="addStatus"
                        value="active"
                        checked={newProd.status === "active"}
                        onChange={() => setNewProd({...newProd, status: "active"})}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="block font-black text-xs">🟢 Aktif (Satışta)</span>
                        <span className="text-[10px] text-gray-500">Müşteriler ürünü sitede görebilir ve satın alabilir</span>
                      </div>
                    </label>

                    <label className={`flex-1 p-3 rounded-2xl border-2 cursor-pointer flex items-center gap-2.5 transition-all ${
                      newProd.status === "passive" ? "border-rose-500 bg-rose-50/50 text-rose-900" : "border-gray-200 bg-gray-50 text-gray-600"
                    }`}>
                      <input
                        type="radio"
                        name="addStatus"
                        value="passive"
                        checked={newProd.status === "passive"}
                        onChange={() => setNewProd({...newProd, status: "passive"})}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <span className="block font-black text-xs">⚪ Pasif (Gizli)</span>
                        <span className="text-[10px] text-gray-500">Ürün müşterilere gizlenir, satışa kapatılır</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Ürün Açıklaması</label>
                  <textarea rows={3} value={newProd.longDescription} onChange={e => setNewProd({...newProd, longDescription: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none" placeholder="Ürün detaylı açıklaması..." />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Öne Çıkan Özellikler / İçindekiler</label>
                  <textarea rows={3} value={newProd.ingredients} onChange={e => setNewProd({...newProd, ingredients: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none" placeholder="Özellik 1&#10;Özellik 2&#10;Gibi alt alta yazabilirsiniz..." />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Ürün Görseli (Çoklu Seçebilirsiniz)</label>
                  <input type="file" accept="image/*" multiple onChange={handleFileUpload} disabled={uploading} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none" />
                  {uploading && <p className="text-xs text-sky-600 mt-1 font-bold animate-pulse">Resimler yükleniyor, lütfen bekleyin...</p>}
                  {newProd.images && newProd.images.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {newProd.images.map((img, idx) => (
                        <div key={idx} className="w-16 h-16 border rounded-xl overflow-hidden relative">
                          <img src={img} alt={`Önizleme ${idx + 1}`} className="object-cover w-full h-full" />
                        </div>
                      ))}
                    </div>
                  )}
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
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-black text-gray-900 text-sm flex items-center gap-2"><Edit2 size={16} className="text-sky-600"/> Ürün Bilgilerini Güncelle</h3>
              <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Ürün Adı</label>
                <input 
                  type="text" 
                  required
                  value={editName} 
                  onChange={e => setEditName(e.target.value)} 
                  placeholder="Ürün adı giriniz..."
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-sky-500 outline-none" 
                />
              </div>

              {/* Durum Seçimi (Aktif / Pasif) */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Yayın Durumu (Aktif / Pasif)</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditStatus("active")}
                    className={`flex-1 py-2 px-3 rounded-xl border-2 font-black text-xs flex items-center justify-center gap-2 transition-all ${
                      editStatus === "active" ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Aktif (Satışta)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditStatus("passive")}
                    className={`flex-1 py-2 px-3 rounded-xl border-2 font-black text-xs flex items-center justify-center gap-2 transition-all ${
                      editStatus === "passive" ? "border-rose-500 bg-rose-50 text-rose-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Pasif (Gizli)
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Barkod No (EAN / GTIN)</label>
                <input 
                  type="text" 
                  value={editBarcode} 
                  onChange={e => setEditBarcode(e.target.value)} 
                  placeholder="Örn: 8690123456789"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-sky-500 outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Satış Fiyatı (TL)</label>
                  <input required type="number" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-sky-500 outline-none" />
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Piyasa Fiyatı</label>
                  <input type="number" step="0.01" value={editMarketPrice} onChange={e => setEditMarketPrice(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-sky-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Stok Miktarı</label>
                <input required type="number" value={editStock} onChange={e => setEditStock(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-sky-500 outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Ürün Açıklaması</label>
                <textarea rows={3} value={editLongDescription} onChange={e => setEditLongDescription(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Öne Çıkan Özellikler</label>
                <textarea rows={3} value={editIngredients} onChange={e => setEditIngredients(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none" />
              </div>

              <div className="pt-2 flex gap-2">
                <button type="submit" className="flex-1 px-4 py-2.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-md">
                  GÜNCELLE VE KAYDET
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
