/**
 * Ürün detay istemci bileşeni.
 * Galeri, sepete ekle, miktar seçimi ve OnbSağlık Combo Teklif kutusunu yönetir.
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { ShoppingCart, Heart, Minus, Plus, Shield, Truck, Package, Gift, Zap, Check, Bell } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice, calcDiscount } from "@/lib/products";
import { useCartStore } from "@/stores/cartStore";
import { useCampaignStore } from "@/stores/campaignStore";
import { useFavoritesStore } from "@/stores/favoritesStore";
import LoginModal from "@/components/ui/LoginModal";
import AddToCartModal from "@/components/ui/AddToCartModal";
import { isUserLoggedIn } from "@/lib/authUtils";

interface Props {
  product: Product;
  discountRate: number;
}

export default function ProductDetailClient({ product, discountRate }: Props) {
  const { data: session } = useSession();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [comboAdded, setComboAdded] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAddCartModal, setShowAddCartModal] = useState(false);

  // Alarms
  const [priceAlarmTarget, setPriceAlarmTarget] = useState("");
  const [showPriceAlarmInput, setShowPriceAlarmInput] = useState(false);
  const [alarmMessage, setAlarmMessage] = useState("");

  const { addItem } = useCartStore();
  const { getProductCampaign } = useCampaignStore();
  const { toggleFavorite, items: favItems } = useFavoritesStore();

  const isFavorite = favItems.some((i) => i.id === product.id);
  const activeCampaign = getProductCampaign(product.id);
  const isOutOfStock = product.stock === 0;

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setAllProducts(data))
      .catch(console.error);
  }, []);

  const increaseQty = () => setQuantity((q) => Math.min(q + 1, product.stock || 99));
  const decreaseQty = () => setQuantity((q) => Math.max(q - 1, 1));
  const handleSetPriceAlarm = async () => {
    if (!session?.user?.email) {
      alert("Lütfen önce giriş yapın.");
      return;
    }
    if (Number(priceAlarmTarget) <= 0) return;
    
    try {
      await fetch("/api/user/alarms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "price", product_id: product.id, target_price: priceAlarmTarget })
      });
      setShowPriceAlarmInput(false);
      setAlarmMessage("Fiyat alarmı başarıyla kuruldu! (Hesabım sayfasından görebilirsiniz)"); setTimeout(() => setAlarmMessage(""), 5000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSetStockAlarm = async () => {
    if (!session?.user?.email) {
      alert("Lütfen önce giriş yapın.");
      return;
    }
    try {
      await fetch("/api/user/alarms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "stock", product_id: product.id })
      });
      setAlarmMessage("Stok alarmı başarıyla kuruldu! (Hesabım sayfasından görebilirsiniz)"); setTimeout(() => setAlarmMessage(""), 5000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddToCart = () => {
    if (!isUserLoggedIn(session?.user)) {
      setShowLoginModal(true);
      return;
    }

    if (isOutOfStock) return;
    addItem(product, quantity);
    setAddedToCart(true);
    setShowAddCartModal(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleToggleFavorite = () => {
    if (!isUserLoggedIn(session?.user)) {
      setShowLoginModal(true);
      return;
    }
    toggleFavorite(product);
  };

  const handleAddComboToCart = () => {
    if (!isUserLoggedIn(session?.user)) {
      setShowLoginModal(true);
      return;
    }

    if (!activeCampaign) return;
    addItem(product, 1);

    const comboProd = allProducts.find((p) => p.id === activeCampaign.comboProductId);
    if (comboProd && comboProd.stock > 0) {
      const discountedCombo = {
        ...comboProd,
        price: activeCampaign.comboPrice ? activeCampaign.comboPrice : comboProd.price,
      };
      addItem(discountedCombo, 1);
    }
    setComboAdded(true);
    setShowAddCartModal(true);
    setTimeout(() => setComboAdded(false), 2000);
  };

  const comboProd = activeCampaign ? allProducts.find((p) => p.id === activeCampaign.comboProductId) : null;
  const comboPrice = activeCampaign?.comboPrice ?? comboProd?.price ?? 0;
  const comboTotal = product.price + comboPrice;

  // Piyasa Değeri ve Büyük Punto Yüzde İndirimi Hesaplaması
  const effectiveMarketPrice = (product.marketPrice && product.marketPrice > product.price)
    ? product.marketPrice
    : Math.round(product.price * 1.18 * 100) / 100;
  const effectiveDiscountRate = discountRate > 0 ? discountRate : calcDiscount(product.price, effectiveMarketPrice);
  const savings = Math.max(0, effectiveMarketPrice - product.price);

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Sol: Görsel Galerisi */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center">
            {effectiveDiscountRate > 0 && (
              <div className="absolute top-4 left-4 z-10 bg-gradient-to-br from-rose-600 to-red-600 text-white px-3.5 py-2 rounded-2xl shadow-lg shadow-rose-600/30 flex flex-col items-center leading-none pointer-events-none">
                <span className="text-[10px] font-black tracking-wider uppercase opacity-90">İNDİRİM</span>
                <span className="text-2xl font-black tracking-tight mt-0.5">%{effectiveDiscountRate}</span>
              </div>
            )}

            {/* %100 Orijinal Ürün Amblemi - Sağ Üst */}
            <div 
              className="absolute top-3.5 right-3.5 z-10 w-14 h-14 sm:w-16 sm:h-16 transition-transform duration-300 hover:scale-105 pointer-events-none drop-shadow-md"
              title="%100 Orijinal Eczane Ürünü Garantisi"
            >
              <Image
                src="/orijinal-urun-badge.png"
                alt="%100 Orijinal Ürün"
                width={64}
                height={64}
                className="w-full h-full object-contain"
                unoptimized={true}
                priority
              />
            </div>

            {/* Favori Butonu - Amblemin Altında */}
            <button
              onClick={handleToggleFavorite}
              className="absolute top-20 right-4 z-10 p-2.5 rounded-full bg-white/90 hover:bg-white shadow-md transition-all cursor-pointer"
              aria-label={isFavorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
            >
              <Heart size={20} className={isFavorite ? "text-rose-500" : "text-gray-400"} fill={isFavorite ? "#f43f5e" : "none"} />
            </button>

            {imgErrors[selectedImage] || !product.images?.[selectedImage] ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400">
                <Package size={64} className="mb-2 text-emerald-600/30" />
                <span className="text-xs font-bold uppercase">{product.brand}</span>
              </div>
            ) : (
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-contain p-6"
                unoptimized
                onError={() => setImgErrors((prev) => ({ ...prev, [selectedImage]: true }))}
              />
            )}
          </div>

          {/* Küçük Resimler (Thumbnails) */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all bg-gray-50 ${
                    selectedImage === idx ? "border-emerald-600 ring-2 ring-emerald-600/20" : "border-gray-200"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-contain p-1" unoptimized />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sağ: Ürün Bilgileri ve İşlemler */}
        <div className="flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase block">
                {product.brand}
              </span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-extrabold shadow-xs">
                <Image src="/orijinal-urun-badge.png" alt="Orijinal" width={18} height={18} className="w-4 h-4 object-contain" unoptimized={true} />
                <span>%100 Orijinal Ürün Garantisi</span>
              </div>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-snug mb-4">
              {product.name}
            </h1>

            {/* Fiyat & İndirim Alanı (Büyük Punto Yüzde İndirimi) */}
            <div className="mb-6 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-50/70 via-white to-rose-50/40 border-2 border-emerald-100 shadow-sm">
              {/* Üst Satır: Piyasa Değeri ve Büyük Punto İndirim Rozeti */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Piyasa Değeri
                  </span>
                  <span className="text-base sm:text-lg font-bold text-gray-400 line-through decoration-rose-500/70 decoration-2">
                    {formatPrice(effectiveMarketPrice)}
                  </span>
                </div>

                {/* Büyük Puntoyla Yüzde İndirimi */}
                {effectiveDiscountRate > 0 && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-red-600 text-white px-4 py-2 rounded-2xl shadow-lg shadow-rose-500/25">
                    <span className="text-xs font-black tracking-wider uppercase opacity-95">İNDİRİM</span>
                    <span className="text-2xl sm:text-3xl font-black tracking-tight">
                      %{effectiveDiscountRate}
                    </span>
                  </div>
                )}
              </div>

              {/* Alt Satır: Bizim Yazdığımız Satış Fiyatı & Kazanç */}
              <div className="flex flex-wrap items-baseline justify-between gap-2 pt-3 border-t border-gray-100">
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wide">
                    Bizim Satış Fiyatımız
                  </span>
                  <span className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">
                    {formatPrice(product.price)}
                  </span>
                </div>

                {savings > 0 && (
                  <div className="self-end mb-1">
                    <span className="text-xs sm:text-sm font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-xs">
                      {formatPrice(savings)} Kazanç
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                <Shield size={13} className="text-emerald-600 shrink-0" />
                <span>Piyasa tavsiye satış fiyatı üzerinden <strong>%{effectiveDiscountRate} indirimli</strong> orijinal ürün avantajı.</span>
              </div>
            </div>

            {/* Miktar Seçici & Sepete Ekle */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-300 rounded-2xl overflow-hidden bg-gray-50">
                <button onClick={decreaseQty} className="p-3 text-gray-600 hover:bg-gray-200 transition-colors">
                  <Minus size={16} />
                </button>
                <span className="px-4 font-extrabold text-sm text-gray-900">{quantity}</span>
                <button onClick={increaseQty} className="p-3 text-gray-600 hover:bg-gray-200 transition-colors">
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3.5 px-6 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md uppercase tracking-wider ${
                  isOutOfStock
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed border"
                    : addedToCart
                    ? "bg-emerald-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {isOutOfStock ? (
                  "Stokta Yok"
                ) : addedToCart ? (
                  <>
                    <Check size={18} /> Sepete Eklendi!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} /> Sepete Ekle
                  </>
                )}
              </button>
            </div>

            {/* COMBO KAMPANYA KUTUSU */}
            {activeCampaign && activeCampaign.type === "combo" && comboProd && (
              <div className="bg-amber-50/70 border-2 border-amber-300 rounded-3xl p-5 mb-6 space-y-4">
                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wide">
                  <Zap className="fill-amber-500 text-amber-500" size={18} /> Özel Combo Fırsat Paketi
                </div>
                <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-amber-200">
                  <div className="relative w-16 h-16 flex-shrink-0 bg-gray-50 rounded-xl p-1 border">
                    <Image src={comboProd.images?.[0] || "/placeholder.png"} alt={comboProd.name} fill className="object-contain" unoptimized />
                  </div>
                  <div className="flex-grow min-w-0">
                    <span className="text-[10px] font-bold text-amber-700 block uppercase">{comboProd.brand}</span>
                    <h4 className="text-xs font-bold text-gray-800 truncate">{comboProd.name}</h4>
                    <span className="text-xs font-extrabold text-red-600 mt-0.5 block">İkinci Ürün Fiyatı: {formatPrice(comboPrice)}</span>
                  </div>
                </div>
                <button
                  onClick={handleAddComboToCart}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-3 px-4 rounded-2xl text-xs uppercase tracking-wider shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  {comboAdded ? <Check size={16} /> : <Gift size={16} />} Birlikte Sepete Ekle ({formatPrice(comboTotal)})
                </button>
              </div>
            )}

            {/* ALARMS UI */}
            <div className="flex items-center gap-3 mb-6">
              {!isOutOfStock && (
                <div className="relative">
                  <button 
                    onClick={() => setShowPriceAlarmInput(!showPriceAlarmInput)}
                    className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-emerald-600 border border-gray-200 px-4 py-2.5 rounded-xl transition-colors bg-white shadow-sm"
                  >
                    <Bell size={16} /> Fiyat Düşünce Haber Ver
                  </button>
                  {showPriceAlarmInput && (
                    <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-64 flex flex-col gap-2">
                      <label className="text-xs font-semibold text-gray-700">Hedef Fiyat (TL)</label>
                      <input 
                        type="number" 
                        value={priceAlarmTarget}
                        onChange={(e) => setPriceAlarmTarget(e.target.value)}
                        placeholder="Örn: 150"
                        className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <button 
                        onClick={handleSetPriceAlarm}
                        className="w-full bg-emerald-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-emerald-700"
                      >
                        Alarmı Kur
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {isOutOfStock && (
                <button 
                  onClick={handleSetStockAlarm}
                  className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-emerald-600 border border-gray-200 px-4 py-2.5 rounded-xl transition-colors bg-white shadow-sm"
                >
                  <Bell size={16} /> Stok Gelince Haber Ver
                </button>
              )}
            </div>

            {alarmMessage && (
              <div className="mb-6 p-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check size={16} /> {alarmMessage}
              </div>
            )}

            {/* Rozetler */}
            <div className="grid grid-cols-2 gap-3 text-xs font-bold text-gray-600 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-emerald-600" /> %100 Orijinal Ürün
              </div>
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-emerald-600" /> 500 TL Üzeri Ücretsiz Kargo
              </div>
            </div>
          </div>
        </div>
      </div>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <AddToCartModal product={product} isOpen={showAddCartModal} onClose={() => setShowAddCartModal(false)} />
    </div>
  );
}

