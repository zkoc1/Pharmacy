/**
 * Ürün detay istemci bileşeni.
 * Galeri, sepete ekle, miktar seçimi ve OnbSağlık Combo Teklif kutusunu yönetir.
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { ShoppingCart, Heart, Minus, Plus, Shield, Truck, Package, Gift, Zap, Check } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/products";
import { useCartStore } from "@/stores/cartStore";
import { useCampaignStore } from "@/stores/campaignStore";
import { useFavoritesStore } from "@/stores/favoritesStore";
import LoginModal from "@/components/ui/LoginModal";
import AddToCartModal from "@/components/ui/AddToCartModal";

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

  const { addItem } = useCartStore();
  const { getProductCampaign } = useCampaignStore();
  const { toggleFavorite, items: favItems } = useFavoritesStore();

  const isFavorite = favItems.some((i) => i.id === product.id);
  const activeCampaign = getProductCampaign(product.id);
  const isOutOfStock = product.stock === 0;

  useEffect(() => {
    import("@/data/products.json").then((m) => setAllProducts(m.default as Product[]));
  }, []);

  const checkIsLoggedIn = () => {
    return !!session || !!localStorage.getItem("user_session");
  };

  const increaseQty = () => setQuantity((q) => Math.min(q + 1, product.stock || 99));
  const decreaseQty = () => setQuantity((q) => Math.max(q - 1, 1));

  const handleAddToCart = () => {
    if (!checkIsLoggedIn()) {
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
    if (!checkIsLoggedIn()) {
      setShowLoginModal(true);
      return;
    }
    toggleFavorite(product);
  };

  const handleAddComboToCart = () => {
    if (!checkIsLoggedIn()) {
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

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Sol: Görsel Galerisi */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center">
            {discountRate > 0 && (
              <span className="absolute top-4 left-4 z-10 bg-rose-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-md shadow-sm">
                %{discountRate} İndirim
              </span>
            )}
            <button
              onClick={handleToggleFavorite}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/90 hover:bg-white shadow-md transition-all cursor-pointer"
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
            <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase mb-1 block">
              {product.brand}
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 leading-snug mb-4">
              {product.name}
            </h1>

            {/* Fiyat Alanı */}
            <div className="flex items-baseline gap-3 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <span className="text-3xl font-extrabold text-emerald-600">{formatPrice(product.price)}</span>
              {product.marketPrice && product.marketPrice > product.price && (
                <span className="text-base text-gray-400 line-through">{formatPrice(product.marketPrice)}</span>
              )}
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
