/**
 * Favoriler sayfası — /favoriler rotası.
 * Kullanıcının favoriye eklediği ürünleri listeler.
 */
"use client";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useCartStore } from "@/stores/cartStore";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/products";

export default function FavorilerSayfasi() {
  const { items, removeFavorite, clearFavorites } = useFavoritesStore();
  const addItem = useCartStore((s) => s.addItem);

  if (items.length === 0) {
    return (
      <div className="container-custom py-20 text-center">
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', background: '#fef2f2', color: '#ef4444', borderRadius: '50%', marginBottom: '20px' }}>
          <Heart size={36} />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Favorileriniz Boş</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>Beğendiğiniz ürünlere kalp ikonu ile favori ekleyebilirsiniz.</p>
        <Link href="/urunler" className="btn-primary" style={{ display: 'inline-flex' }}>Ürünleri Keşfet</Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Favorilerim ({items.length})</h1>
        <button onClick={clearFavorites} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <Trash2 size={14} /> Tümünü Kaldır
        </button>
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        {items.map((product) => (
          <div key={product.id} className="card" style={{ padding: '16px', position: 'relative' }}>
            <button
              onClick={() => removeFavorite(product.id)}
              style={{ position: 'absolute', top: '12px', right: '12px', background: '#fef2f2', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444' }}
            >
              <Heart size={16} fill="#ef4444" />
            </button>
            <Link href={`/urun/${product.slug}`}>
              <div style={{ width: '100%', aspectRatio: '1', background: '#f8fafc', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px', position: 'relative' }}>
                <Image src={product.images?.[0] || '/placeholder.png'} alt={product.name} fill style={{ objectFit: 'contain' }} unoptimized />
              </div>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>{product.brand}</p>
              <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</p>
              <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '12px' }}>{formatPrice(product.price)}</p>
            </Link>
            <button
              onClick={() => addItem(product)}
              className="btn-primary"
              style={{ width: '100%', fontSize: '13px', padding: '8px' }}
            >
              <ShoppingCart size={14} /> Sepete Ekle
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
