"use client";

/**
 * Header — Yapışkan üst navigasyon çubuğu.
 * Canlı arama, sepet drawer, mobil menü ve kategori navigasyonu içerir.
 */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Heart,
  User,
  Search,
  Menu,
  X,
} from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import CartDrawer from "@/components/ui/CartDrawer";

// Kategori navigasyonu — URL slug'ları kategoriler JSON ile eşleşiyor
const NAV_CATEGORIES = [
  { name: "Vitamin & Takviye", href: "/kategori/vitamin-ve-takviye" },
  { name: "Güneş Bakımı", href: "/kategori/gunes-bakimi" },
  { name: "Saç Bakımı", href: "/kategori/sac-bakimi" },
  { name: "Cilt Bakımı", href: "/kategori/cilt-bakimi" },
  { name: "Makyaj", href: "/kategori/makyaj" },
  { name: "Kişisel Bakım", href: "/kategori/kisisel-bakim" },
  { name: "Anne & Bebek", href: "/kategori/anne-bebek" },
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

  // Mobil menü açık/kapalı
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Sepet drawer açık/kapalı
  const [isCartOpen, setIsCartOpen] = useState(false);
  // Arama kutusu değeri
  const [searchValue, setSearchValue] = useState("");
  // Anlık arama sonuçları
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  // Arama dropdown görünür mü?
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Zustand sepet sayısı
  const cartCount = useCartStore((state) =>
    state.items.reduce((acc, item) => acc + item.quantity, 0)
  );

  // Arama input değiştiğinde API çağrısı yap (debounce ile)
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (searchValue.trim().length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    // 300ms bekle, sonra API çağrısı yap
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchValue)}`);
        const data = await res.json();
        setSearchResults(data.products ?? []);
        setShowSearchDropdown(true);
      } catch {
        setSearchResults([]);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchValue]);

  // Arama dışına tıklayınca dropdown'ı kapat
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Arama formunu gönder — /ara sayfasına yönlendir
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    setShowSearchDropdown(false);
    router.push(`/ara?q=${encodeURIComponent(searchValue.trim())}`);
  };

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          width: "100%",
          background: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {/* Haber bandı — ücretsiz kargo bilgisi */}
        <div
          style={{
            background: "var(--gradient-primary)",
            color: "white",
            textAlign: "center",
            fontSize: "13px",
            padding: "7px 16px",
            fontWeight: 600,
            letterSpacing: "0.2px",
          }}
        >
          🚚 500 TL ve üzeri siparişlerde ücretsiz kargo! &nbsp;|&nbsp; 📦 Hızlı teslimat
        </div>

        {/* Ana header satırı */}
        <div
          className="container-custom"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "12px 24px",
          }}
        >
          {/* Mobil hamburger butonu */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              display: "none",
              padding: "8px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text)",
            }}
            className="mobile-menu-btn"
            aria-label="Menü"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <Image
              src="/logo.jpg"
              alt="OnbSağlık"
              width={150}
              height={50}
              style={{ objectFit: "contain", height: "44px", width: "auto" }}
              priority
            />
          </Link>

          {/* Arama çubuğu — masaüstü */}
          <div
            ref={searchRef}
            style={{ flex: 1, maxWidth: "540px", position: "relative" }}
          >
            <form onSubmit={handleSearchSubmit}>
              <div style={{ position: "relative" }}>
                <input
                  id="header-search"
                  type="search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowSearchDropdown(true)}
                  placeholder="Ürün, marka veya kategori arayın..."
                  style={{
                    width: "100%",
                    padding: "11px 48px 11px 20px",
                    border: "2px solid var(--color-border)",
                    borderRadius: "999px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "var(--transition)",
                    background: "var(--color-bg)",
                  }}
                  onFocusCapture={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                  onBlurCapture={(e) => (e.target.style.borderColor = "var(--color-border)")}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "var(--color-primary)",
                    border: "none",
                    borderRadius: "50%",
                    width: "30px",
                    height: "30px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "white",
                  }}
                >
                  <Search size={15} />
                </button>
              </div>
            </form>

            {/* Canlı arama sonuçları dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  right: 0,
                  background: "white",
                  borderRadius: "var(--radius-lg)",
                  border: "2px solid var(--color-border)",
                  boxShadow: "var(--shadow-lg)",
                  zIndex: 200,
                  overflow: "hidden",
                  maxHeight: "380px",
                  overflowY: "auto",
                }}
              >
                {searchResults.map((item) => (
                  <Link
                    key={item.id}
                    href={`/urun/${item.slug}`}
                    onClick={() => {
                      setShowSearchDropdown(false);
                      setSearchValue("");
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 16px",
                      textDecoration: "none",
                      color: "inherit",
                      borderBottom: "1px solid var(--color-border)",
                      transition: "var(--transition)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--color-bg)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "white";
                    }}
                  >
                    {/* Küçük ürün görseli */}
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        width={40}
                        height={40}
                        style={{ objectFit: "contain", borderRadius: "var(--radius-sm)", flexShrink: 0 }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        className="line-clamp-1"
                        style={{ fontSize: "13px", fontWeight: 600 }}
                      >
                        {item.name}
                      </p>
                      <p style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                        {item.brand}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "var(--color-primary)",
                        flexShrink: 0,
                      }}
                    >
                      {item.price.toLocaleString("tr-TR")} ₺
                    </span>
                  </Link>
                ))}

                {/* Tüm sonuçları gör */}
                <button
                  onClick={handleSearchSubmit as unknown as React.MouseEventHandler}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "var(--color-bg)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "13px",
                    color: "var(--color-primary)",
                    fontWeight: 600,
                  }}
                >
                  Tüm sonuçları gör →
                </button>
              </div>
            )}
          </div>

          {/* Sağ ikon grubu */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "auto" }}>
            {/* Hesabım */}
            <Link
              href="/hesabim"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                padding: "6px 10px",
                color: "var(--color-text-muted)",
                textDecoration: "none",
                borderRadius: "var(--radius-sm)",
                transition: "var(--transition)",
                fontSize: "11px",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--color-primary)";
                (e.currentTarget as HTMLElement).style.background = "var(--color-bg)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <User size={22} />
              <span style={{ fontWeight: 600 }}>Hesabım</span>
            </Link>

            {/* Favoriler */}
            <Link
              href="/favoriler"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                padding: "6px 10px",
                color: "var(--color-text-muted)",
                textDecoration: "none",
                borderRadius: "var(--radius-sm)",
                transition: "var(--transition)",
                fontSize: "11px",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--color-primary)";
                (e.currentTarget as HTMLElement).style.background = "var(--color-bg)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <Heart size={22} />
              <span style={{ fontWeight: 600 }}>Favoriler</span>
            </Link>

            {/* Sepet — drawer açar */}
            <button
              onClick={() => setIsCartOpen(true)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                padding: "6px 10px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-muted)",
                borderRadius: "var(--radius-sm)",
                transition: "var(--transition)",
                fontSize: "11px",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--color-primary)";
                (e.currentTarget as HTMLElement).style.background = "var(--color-bg)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <div style={{ position: "relative" }}>
                <ShoppingCart size={22} />
                {/* Sepet sayısı rozeti */}
                {cartCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-8px",
                      right: "-8px",
                      background: "var(--color-accent)",
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
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>
              <span style={{ fontWeight: 600 }}>Sepet</span>
            </button>
          </div>
        </div>

        {/* Kategori navigasyon çubuğu — masaüstü */}
        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            background: "rgba(255,255,255,0.7)",
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
              <Link
                key={cat.href}
                href={cat.href}
                style={{
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  textDecoration: "none",
                  borderBottom: "2px solid transparent",
                  whiteSpace: "nowrap",
                  transition: "var(--transition)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--color-primary)";
                  (e.currentTarget as HTMLElement).style.borderBottomColor = "var(--color-primary)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)";
                  (e.currentTarget as HTMLElement).style.borderBottomColor = "transparent";
                }}
              >
                {cat.name}
              </Link>
            ))}

            {/* Tüm ürünler linki */}
            <Link
              href="/urunler"
              style={{
                marginLeft: "auto",
                padding: "8px 16px",
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--color-primary)",
                textDecoration: "none",
                border: "2px solid var(--color-primary)",
                borderRadius: "999px",
                whiteSpace: "nowrap",
                transition: "var(--transition)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--color-primary)";
                (e.currentTarget as HTMLElement).style.color = "white";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = "var(--color-primary)";
              }}
            >
              Tüm Ürünler
            </Link>
          </nav>
        </div>

        {/* Mobil menü içeriği */}
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
            {/* Mobil arama */}
            <form onSubmit={handleSearchSubmit} style={{ padding: "12px 16px" }}>
              <input
                type="search"
                placeholder="Ara..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  border: "2px solid var(--color-border)",
                  borderRadius: "999px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </form>
            {/* Kategori linkleri */}
            {NAV_CATEGORIES.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                onClick={() => setIsMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "14px 20px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--color-text)",
                  textDecoration: "none",
                  borderBottom: "1px solid var(--color-border)",
                  transition: "var(--transition)",
                }}
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/hakkimizda"
              onClick={() => setIsMenuOpen(false)}
              style={{
                display: "block",
                padding: "14px 20px",
                fontSize: "14px",
                color: "var(--color-text-muted)",
                textDecoration: "none",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              Hakkımızda
            </Link>
            <Link
              href="/iletisim"
              onClick={() => setIsMenuOpen(false)}
              style={{
                display: "block",
                padding: "14px 20px",
                fontSize: "14px",
                color: "var(--color-text-muted)",
                textDecoration: "none",
              }}
            >
              İletişim
            </Link>
          </div>
        )}
      </header>

      {/* Sepet drawer — portal olarak render edilir */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
