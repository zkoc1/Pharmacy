/**
 * Ürün detay istemci bileşeni.
 * Galeri, sepete ekle, miktar seçimi ve Dermoeczanem tarzı Combo Teklif kutusunu yönetir.
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ShoppingCart, Heart, Minus, Plus, Shield, Truck, Package, Gift, Zap, Check } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/products";
import { useCartStore } from "@/stores/cartStore";
import { useCampaignStore } from "@/stores/campaignStore";

interface Props {
  product: Product;
  discountRate: number;
}

export default function ProductDetailClient({ product, discountRate }: Props) {
  // Seçili görsel indeksi (galeri için)
  const [selectedImage, setSelectedImage] = useState(0);
  // Seçilen ürün miktarı
  const [quantity, setQuantity] = useState(1);
  // Favorilere eklenmiş mi?
  const [isFavorite, setIsFavorite] = useState(false);
  // Sepete ekleme geri bildirimi
  const [addedToCart, setAddedToCart] = useState(false);
  const [comboAdded, setComboAdded] = useState(false);
  // Görsel yüklenme hataları için state
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const { addItem } = useCartStore();
  const { getProductCampaign } = useCampaignStore();

  const activeCampaign = getProductCampaign(product.id);

  useEffect(() => {
    import("@/data/products.json").then((m) => setAllProducts(m.default as Product[]));
  }, []);

  // Miktarı artır (stok sınırını aşma)
  const increaseQty = () => setQuantity((q) => Math.min(q + 1, product.stock || 99));

  // Miktarı azalt (en az 1)
  const decreaseQty = () => setQuantity((q) => Math.max(q - 1, 1));

  // Sepete ekle
  const handleAddToCart = () => {
    addItem(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Combo teklifi birlikte sepete ekle
  const handleAddComboToCart = () => {
    if (!activeCampaign) return;
    addItem(product, 1);

    const comboProd = allProducts.find((p) => p.id === activeCampaign.comboProductId);
    if (comboProd) {
      const discountedCombo = {
        ...comboProd,
        price: activeCampaign.comboPrice ? activeCampaign.comboPrice : comboProd.price,
      };
      addItem(discountedCombo, 1);
    }
    setComboAdded(true);
    setTimeout(() => setComboAdded(false), 2000);
  };

  const images = product.images && product.images.length > 0 ? product.images : ["/placeholder.png"];
  const comboProduct = activeCampaign?.comboProductId ? allProducts.find((p) => p.id === activeCampaign.comboProductId) : null;

  return (
    <div className="grid gap-8" style={{ gridTemplateColumns: "1fr 1fr" }}>
      {/* Sol: Görsel galerisi */}
      <div>
        {/* Ana görsel */}
        <div
          className="card"
          style={{
            padding: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
            marginBottom: "12px",
            position: "relative",
          }}
        >
          {activeCampaign && (
            <div style={{ position: "absolute", top: "12px", left: "12px", zIndex: 10, background: "#f59e0b", color: "white", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 800, display: "flex", alignItems: "center", gap: "4px" }}>
              <Zap size={14} fill="white" /> {activeCampaign.bannerTitle || "Fırsat Kampanyası"}
            </div>
          )}

          {imgErrors[selectedImage] ? (
            <div className="flex flex-col items-center justify-center text-emerald-600/40 p-8 text-center">
              <Package size={80} className="mb-2" />
              <span className="text-sm font-semibold text-gray-500">{product.brand}</span>
              <span className="text-xs text-gray-400 mt-1">Görsel Yüklenemedi</span>
            </div>
          ) : (
            <Image
              src={images[selectedImage]}
              alt={product.name}
              width={400}
              height={400}
              style={{ objectFit: "contain", maxHeight: "360px" }}
              unoptimized
              priority
              onError={() => setImgErrors((prev) => ({ ...prev, [selectedImage]: true }))}
            />
          )}
        </div>

        {/* Küçük görsel listesi */}
        {images.length > 1 && (
          <div className="flex gap-2" style={{ overflowX: "auto", paddingBottom: "4px" }}>
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                style={{
                  flexShrink: 0,
                  width: "72px",
                  height: "72px",
                  padding: "4px",
                  border: selectedImage === i
                    ? "2px solid var(--color-primary)"
                    : "2px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  background: "white",
                  cursor: "pointer",
                  transition: "var(--transition)",
                }}
              >
                {imgErrors[i] ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Package size={24} />
                  </div>
                ) : (
                  <Image
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    width={64}
                    height={64}
                    style={{ objectFit: "contain", width: "100%", height: "100%" }}
                    unoptimized
                    onError={() => setImgErrors((prev) => ({ ...prev, [i]: true }))}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sağ: Ürün bilgileri */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Marka */}
        <div>
          <a
            href={`/marka/${product.brandSlug}`}
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--color-primary)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {product.brand}
          </a>
        </div>

        {/* Ürün adı */}
        <h1 style={{ fontSize: "22px", fontWeight: 700, lineHeight: "1.4" }}>
          {product.name}
        </h1>

        {/* Fiyat alanı */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              fontSize: "32px",
              fontWeight: 800,
              color: "var(--color-primary)",
            }}
          >
            {formatPrice(product.price)}
          </span>

          {product.marketPrice > 0 && (
            <>
              <span
                style={{
                  fontSize: "18px",
                  color: "var(--color-text-muted)",
                  textDecoration: "line-through",
                }}
              >
                {formatPrice(product.marketPrice)}
              </span>
              <span className="badge badge-discount">%{discountRate}</span>
            </>
          )}
        </div>

        {/* KDV bilgisi */}
        <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "-12px" }}>
          KDV dahil fiyattır (%{product.vatRate})
        </p>

        {/* DERMOECZANEM TARZI CANLI COMBO KAMPANYA KUTUSU */}
        {activeCampaign && activeCampaign.type === "combo" && comboProduct && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-amber-900 font-extrabold text-sm">
              <Gift className="text-amber-600" size={18} />
              {activeCampaign.comboDescription || "Birlikte Al / Combo Fırsatı!"}
            </div>

            <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-amber-200 mt-2">
              <div className="relative w-16 h-16 flex-shrink-0 bg-gray-50 rounded-lg p-1 border">
                <Image
                  src={comboProduct.images?.[0] || "/placeholder.png"}
                  alt={comboProduct.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="flex-grow min-w-0">
                <span className="text-[10px] font-bold text-amber-700 uppercase">2. Ürün Fırsatı</span>
                <p className="text-xs font-bold text-gray-800 truncate">{comboProduct.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400 line-through">{formatPrice(comboProduct.price)}</span>
                  <span className="text-sm font-extrabold text-red-600">
                    {activeCampaign.comboPrice ? formatPrice(activeCampaign.comboPrice) : formatPrice(comboProduct.price)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleAddComboToCart}
              className="w-full mt-3 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              {comboAdded ? <Check size={16} /> : <ShoppingCart size={16} />}
              {comboAdded ? "İki Ürün Sepete Eklendi! ✓" : "İki Ürünü Birlikte Sepete Ekle & Fırsatı Yakala"}
            </button>
          </div>
        )}

        {/* Stok durumu */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: product.stock > 0 ? "var(--color-primary)" : "#ef4444",
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: product.stock > 0 ? "var(--color-primary)" : "#ef4444",
            }}
          />
          {product.stock > 0 ? `Stokta var (${product.stock} adet)` : "Stokta yok"}
        </div>

        {/* Miktar seçici */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "14px", fontWeight: 600 }}>Miktar:</span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "2px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
            }}
          >
            <button
              onClick={decreaseQty}
              style={{
                padding: "8px 14px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                color: "var(--color-text-muted)",
              }}
            >
              <Minus size={16} />
            </button>
            <span style={{ padding: "8px 20px", fontWeight: 700, fontSize: "16px" }}>
              {quantity}
            </span>
            <button
              onClick={increaseQty}
              style={{
                padding: "8px 14px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                color: "var(--color-text-muted)",
              }}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Aksiyon butonları */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="btn-primary"
            style={{ flex: 1, justifyContent: "center" }}
          >
            <ShoppingCart size={18} />
            {addedToCart ? "Eklendi! ✓" : "Sepete Ekle"}
          </button>

          <button
            onClick={() => setIsFavorite(!isFavorite)}
            style={{
              padding: "12px 16px",
              border: "2px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              background: "white",
              cursor: "pointer",
              transition: "var(--transition)",
              color: isFavorite ? "#ef4444" : "var(--color-text-muted)",
            }}
          >
            <Heart size={20} fill={isFavorite ? "#ef4444" : "none"} />
          </button>
        </div>

        {/* Güvence bilgileri */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            padding: "16px",
            background: "var(--gradient-card)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
          }}
        >
          {[
            { icon: <Truck size={16} />, text: "500 TL üzeri ücretsiz kargo" },
            { icon: <Shield size={16} />, text: "Orijinal ürün garantisi" },
          ].map((item) => (
            <div
              key={item.text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                color: "var(--color-text-muted)",
              }}
            >
              <span style={{ color: "var(--color-primary)" }}>{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
