/**
 * Header bileşeni — Sticky header, Arama, Sepet, Kullanıcı Menüsü ve Mega Kategori Açılır Menüsü.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Heart,
  User,
  Search,
  Menu,
  X,
  Zap,
  ChevronDown,
} from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import CartDrawer from "@/components/ui/CartDrawer";

// Mega Kategori navigasyonu — Alt kategorilerle birlikte (Görsel 5 Birebir)
const NAV_CATEGORIES = [
  { name: "⚡ KAMPANYALAR", href: "/kampanyalar", highlight: true },
  {
    name: "Vitamin & Takviye",
    href: "/kategori/vitamin-ve-takviye",
    subcategories: [
      { title: "Vitaminler", items: ["C Vitamini", "D3 Vitamini", "B Kompleks", "Multivitamin", "Tüm Ürünler"] },
      { title: "Mineraller", items: ["Çinko", "Magnezyum", "Demir Takviyesi", "Kalsiyum", "Tüm Ürünler"] },
      { title: "Omega & Balık Yağı", items: ["Çocuk Balık Yağı Şurubu", "Yetişkin Omega-3", "Krill Oil", "Tüm Ürünler"] },
    ],
  },
  {
    name: "Güneş Bakımı",
    href: "/kategori/gunes-bakimi",
    subcategories: [
      { title: "Yüz Güneş Kremleri", items: ["SPF 50+ Yüz Kremi", "Renkli Güneş Kremi", "Leke Karşıtı Güneş Kremi", "Tüm Ürünler"] },
      { title: "Vücut Güneş Kremleri", items: ["Güneş Spreyi", "Çocuk Güneş Kremi", "Hassas Cilt Güneş Spreyi", "Tüm Ürünler"] },
      { title: "Güneş Sonrası", items: ["Bronzlaştırıcı Yağ", "After-Sun Jel", "Nemlendirici Losyon", "Tüm Ürünler"] },
    ],
  },
  {
    name: "Saç Bakımı",
    href: "/kategori/sac-bakimi",
    subcategories: [
      { title: "Şampuan & Krem", items: ["Dökülme Karşıtı Şampuan", "Kepek Karşıtı Şampuan", "Saç Kremi", "Tüm Ürünler"] },
      { title: "Özel Bakım", items: ["Saç Serumu", "Saç Maskesi", "Saç Toniği", "Tüm Ürünler"] },
    ],
  },
  {
    name: "Cilt Bakımı",
    href: "/kategori/cilt-bakimi",
    subcategories: [
      { title: "Yüz Bakımı", items: ["Nemlendirici Krem", "Yüz Temizleme Jeli", "Serum & Ampul", "Yüz Maskesi", "Tüm Ürünler"] },
      { title: "Vücut Bakımı", items: ["Vücut Losyonu", "Selülit Kremi", "El ve Ayak Bakımı", "Tüm Ürünler"] },
      { title: "Anti-Aging", items: ["Yaşlanma Karşıtı Krem", "Göz Çevresi Kremi", "Tüm Ürünler"] },
    ],
  },
  {
    name: "Makyaj",
    href: "/kategori/makyaj",
    subcategories: [
      { title: "Ten Makyajı", items: ["BB & CC Krem", "Kapatıcı", "Pudra", "Tüm Ürünler"] },
      { title: "Göz Makyajı", items: ["Maskara", "Eyeliner", "Tüm Ürünler"] },
    ],
  },
  {
    name: "Kişisel Bakım",
    href: "/kategori/kisisel-bakim",
    subcategories: [
      { title: "Ağız Bakımı", items: ["Diş Macunu", "Diş Fırçası", "Ağız Çalkalama Suyu", "Tüm Ürünler"] },
      { title: "Vücut Temizliği", items: ["Duş Jeli", "Sabun", "Deodorant", "Tüm Ürünler"] },
    ],
  },
  {
    name: "Anne & Bebek",
    href: "/kategori/anne-bebek",
    subcategories: [
      { title: "Bebek Bakımı", items: ["Bebek Bezi", "Bebek Duş Jeli", "Bebek Güneş Kremi", "Bebek Yağı", "Islak Mendil", "Pişik Kremi", "Tüm Ürünler"] },
      { title: "Bebek Beslenme Ürünleri", items: ["Bebek Maması", "Biberon", "Emzik", "Takviye Ürünler", "Tüm Ürünler"] },
      { title: "Emzirme Ürünleri", items: ["Emziren Anne Besinleri", "Göğüs Pompası", "Süt Saklama Poşeti", "Tüm Ürünler"] },
      { title: "Göğüs Bakımı", items: ["Göğüs Pedi", "Göğüs Ucu Koruyucu", "Göğüs Ucu Kremi", "Tüm Ürünler"] },
    ],
  },
];

interface SearchResult {
  id: number;
  name: string;
  slug: string;
  brand: string;
  price: number;
  image: string | null;
}

export default function Header() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMegaCategory, setActiveMegaCategory] = useState<typeof NAV_CATEGORIES[0] | null>(null);

  const cartItems = useCartStore((state) => state.items);
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.slice(0, 6));
          setShowSearchDropdown(true);
        }
      } catch {
        // Hata durumunda boş bırak
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      router.push(`/ara?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      {/* Üst duyuru bandı */}
      <div
        style={{
          background: "var(--gradient-hero)",
          color: "white",
          fontSize: "12px",
          padding: "6px 0",
          textAlign: "center",
          fontWeight: 600,
          letterSpacing: "0.3px",
        }}
      >
        🚚 500 TL ve üzeri siparişlerde ücretsiz kargo! | 📦 Hızlı teslimat
      </div>

      {/* Main Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-sm)",
        }}
        onMouseLeave={() => setActiveMegaCategory(null)}
      >
        <div
          className="container-custom"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
            paddingTop: "14px",
            paddingBottom: "14px",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-sm)",
                background: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 800,
                fontSize: "18px",
              }}
            >
              🌿
            </div>
            <span
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color: "var(--color-text)",
                letterSpacing: "-0.5px",
              }}
            >
              Onb<span style={{ color: "var(--color-primary)" }}>Sağlık</span>
            </span>
          </Link>

          {/* Arama Çubuğu */}
          <div
            ref={searchRef}
            style={{
              flex: 1,
              maxWidth: "560px",
              position: "relative",
            }}
            className="search-bar-desktop"
          >
            <form onSubmit={handleSearchSubmit} style={{ position: "relative" }}>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowSearchDropdown(true);
                }}
                placeholder="Ürün, marka veya kategori arayın..."
                style={{
                  width: "100%",
                  padding: "10px 48px 10px 18px",
                  fontSize: "14px",
                  borderRadius: "999px",
                  border: "2px solid var(--color-border)",
                  background: "var(--color-bg)",
                  outline: "none",
                  transition: "var(--transition)",
                }}
              />
              <button
                type="submit"
                style={{
                  position: "absolute",
                  right: "4px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "var(--color-primary)",
                  border: "none",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Search size={16} />
              </button>
            </form>

            {/* Arama Sonuçları Açılır Menü */}
            {showSearchDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  right: 0,
                  background: "white",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-lg)",
                  border: "1px solid var(--color-border)",
                  overflow: "hidden",
                  zIndex: 200,
                }}
              >
                {isSearching ? (
                  <div style={{ padding: "16px", textAlign: "center", color: "var(--color-text-muted)", fontSize: "13px" }}>
                    Aranıyor...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div>
                    {searchResults.map((item) => (
                      <Link
                        key={item.id}
                        href={`/urun/${item.slug}`}
                        onClick={() => setShowSearchDropdown(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 16px",
                          textDecoration: "none",
                          color: "var(--color-text)",
                          borderBottom: "1px solid var(--color-border)",
                          fontSize: "13px",
                        }}
                      >
                        <div>
                          <span style={{ fontSize: "11px", color: "var(--color-primary)", fontWeight: 600, display: "block" }}>
                            {item.brand}
                          </span>
                          <span style={{ fontWeight: 500 }}>{item.name}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* İkonlar: Hesabım, Favoriler, Sepet */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link
              href="/hesabim"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                textDecoration: "none",
                color: "var(--color-text)",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              <User size={20} />
              <span className="icon-label-desktop">Hesabım</span>
            </Link>

            <Link
              href="/favoriler"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                textDecoration: "none",
                color: "var(--color-text)",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              <Heart size={20} />
              <span className="icon-label-desktop">Favoriler</span>
            </Link>

            {/* Sepet İkonu & Drawer Tetikleyici */}
            <button
              onClick={() => setIsCartOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text)",
                fontSize: "13px",
                fontWeight: 600,
                position: "relative",
              }}
            >
              <div style={{ position: "relative" }}>
                <ShoppingCart size={22} />
                {totalItemCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-8px",
                      right: "-8px",
                      background: "var(--color-primary)",
                      color: "white",
                      fontSize: "10px",
                      fontWeight: 800,
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {totalItemCount}
                  </span>
                )}
              </div>
              <span className="icon-label-desktop">Sepet</span>
            </button>

            {/* Mobil Menü Butonu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="mobile-menu-btn"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text)",
                padding: "4px",
              }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Kategori Navigasyon Çubuğu — Masaüstü (Görsel 5 Birebir Kategori Hover Menüsü) */}
        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            background: "white",
            position: "relative",
          }}
          className="desktop-nav"
        >
          <nav
            className="container-custom"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "0 24px",
              overflowX: "auto",
              scrollbarWidth: "none",
            }}
          >
            {NAV_CATEGORIES.map((cat) => (
              <div
                key={cat.href}
                onMouseEnter={() => setActiveMegaCategory(cat)}
                style={{ position: "relative" }}
              >
                <Link
                  href={cat.href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: cat.highlight ? "6px 14px" : "12px 14px",
                    fontSize: "13px",
                    fontWeight: cat.highlight ? 800 : 700,
                    color: cat.highlight ? "#dc2626" : "var(--color-text)",
                    background: cat.highlight ? "#fef2f2" : "transparent",
                    borderRadius: cat.highlight ? "999px" : "0",
                    textDecoration: "none",
                    borderBottom: cat.highlight ? "none" : activeMegaCategory?.name === cat.name ? "3px solid var(--color-primary)" : "3px solid transparent",
                    whiteSpace: "nowrap",
                    transition: "var(--transition)",
                  }}
                >
                  {cat.name}
                  {cat.subcategories && <ChevronDown size={14} className="text-gray-400" />}
                </Link>
              </div>
            ))}

            <Link
              href="/urunler"
              style={{
                marginLeft: "auto",
                padding: "6px 16px",
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--color-primary)",
                textDecoration: "none",
                border: "2px solid var(--color-primary)",
                borderRadius: "999px",
                whiteSpace: "nowrap",
              }}
            >
              Tüm Ürünler
            </Link>
          </nav>

          {/* MEGA DROPDOWN KATEGORİ MENÜSÜ (Görsel 5 Birebir Çok Kolonlu Açılır Liste) */}
          {activeMegaCategory && activeMegaCategory.subcategories && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "white",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                borderTop: "1px solid var(--color-border)",
                borderBottom: "1px solid var(--color-border)",
                zIndex: 300,
                padding: "24px 0",
              }}
              onMouseEnter={() => setActiveMegaCategory(activeMegaCategory)}
              onMouseLeave={() => setActiveMegaCategory(null)}
            >
              <div className="container-custom grid grid-cols-4 gap-8">
                {activeMegaCategory.subcategories.map((sub, idx) => (
                  <div key={idx} className="space-y-3">
                    <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider border-b pb-2 border-gray-100">
                      {sub.title}
                    </h4>
                    <ul className="space-y-2">
                      {sub.items.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          <Link
                            href={`${activeMegaCategory.href}?sub=${encodeURIComponent(item)}`}
                            onClick={() => setActiveMegaCategory(null)}
                            className="text-xs text-gray-600 hover:text-emerald-600 hover:font-bold transition-all block"
                          >
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobil Menü */}
        {isMenuOpen && (
          <div
            style={{
              background: "white",
              borderTop: "1px solid var(--color-border)",
              position: "absolute",
              width: "100%",
              boxShadow: "var(--shadow-lg)",
              zIndex: 99,
            }}
          >
            <form onSubmit={handleSearchSubmit} style={{ padding: "12px 16px" }}>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ürün, marka veya kategori ara..."
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  fontSize: "14px",
                }}
              />
            </form>
            <nav style={{ display: "flex", flexDirection: "column" }}>
              {NAV_CATEGORIES.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    padding: "12px 20px",
                    borderBottom: "1px solid var(--color-border)",
                    textDecoration: "none",
                    color: cat.highlight ? "#dc2626" : "var(--color-text)",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Sepet Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
