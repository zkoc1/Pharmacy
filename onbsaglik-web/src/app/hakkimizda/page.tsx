/**
 * Hakkımızda sayfası — /hakkimizda
 * Şirket hikayesi, misyon ve ekip bilgileri.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hakkımızda | OnbSağlık",
  description:
    "OnbSağlık olarak güvenilir, orijinal vitamin, takviye ve kozmetik ürünleri Türkiye genelinde hızlı teslimatla sunuyoruz.",
};

export default function HakkimizdaSayfasi() {
  return (
    <div className="container-custom py-12">
      {/* Sayfa başlığı */}
      <div
        className="card mb-10"
        style={{
          padding: "48px",
          background: "var(--gradient-hero)",
          color: "white",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "36px", fontWeight: 800, marginBottom: "16px" }}>
          OnbSağlık Hakkında
        </h1>
        <p style={{ fontSize: "18px", opacity: 0.9, maxWidth: "600px", margin: "0 auto" }}>
          Sağlığınız için doğru ürünü, doğru fiyatla sunma misyonuyla çalışıyoruz.
        </p>
      </div>

      {/* Misyon - Vizyon grid */}
      <div
        className="grid gap-6 mb-12"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
      >
        {[
          {
            emoji: "🎯",
            title: "Misyonumuz",
            desc: "Vitamin, takviye besin ve kozmetik ürünlerini en güvenilir ve uygun fiyatlı şekilde müşterilerimize ulaştırmak. Her ürün, orijinallik kontrolünden geçerek raflarımıza giriyor.",
          },
          {
            emoji: "🌱",
            title: "Vizyonumuz",
            desc: "Türkiye'nin en güvenilir online sağlık ve kozmetik platformu olmak. 2024 yılında kurulan markamız, kısa sürede 63 güvenilir markayı bünyesinde topladı.",
          },
          {
            emoji: "🤝",
            title: "Güvenilirlik",
            desc: "Tüm ürünlerimiz yetkili distribütörlerden temin edilmektedir. Her satın alımda orijinallik güvencesi veriyoruz.",
          },
        ].map((item) => (
          <div key={item.title} className="card" style={{ padding: "28px" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>{item.emoji}</div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "10px" }}>
              {item.title}
            </h2>
            <p style={{ color: "var(--color-text-muted)", lineHeight: "1.7", fontSize: "15px" }}>
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Rakamlarla OnbSağlık */}
      <div
        style={{
          background: "var(--gradient-primary)",
          borderRadius: "var(--radius-xl)",
          padding: "48px",
          color: "white",
          marginBottom: "48px",
        }}
      >
        <h2
          style={{
            fontSize: "24px",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "36px",
          }}
        >
          Rakamlarla OnbSağlık
        </h2>
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "24px",
            textAlign: "center",
          }}
        >
          {[
            { value: "184+", label: "Ürün" },
            { value: "63", label: "Güvenilir Marka" },
            { value: "7", label: "Kategori" },
            { value: "500₺", label: "Ücretsiz Kargo Sınırı" },
          ].map((stat) => (
            <div key={stat.label}>
              <div
                style={{
                  fontSize: "42px",
                  fontWeight: 900,
                  marginBottom: "6px",
                  letterSpacing: "-1px",
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "14px", opacity: 0.85 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Markalar */}
      <div className="mb-12">
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "16px" }}>
          Çalıştığımız Başlıca Markalar
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          {[
            "Ocean",
            "Dermoskin",
            "Nutraxin",
            "Bioxcin",
            "Orzax",
            "Talya",
            "Bioderma",
            "Enterogermina",
            "Argivit",
          ].map((brand) => (
            <span
              key={brand}
              style={{
                padding: "8px 20px",
                border: "2px solid var(--color-primary)",
                borderRadius: "999px",
                color: "var(--color-primary)",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              {brand}
            </span>
          ))}
          <span
            style={{
              padding: "8px 20px",
              background: "var(--color-bg)",
              border: "2px solid var(--color-border)",
              borderRadius: "999px",
              color: "var(--color-text-muted)",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            +54 marka daha
          </span>
        </div>
      </div>

      {/* Instagram CTA */}
      <div
        className="card"
        style={{
          padding: "40px",
          textAlign: "center",
          background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
          border: "2px solid var(--color-primary-light)",
        }}
      >
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "12px" }}>
          Bizi Sosyal Medyada Takip Edin
        </h2>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "24px" }}>
          Yeni ürünler, kampanyalar ve sağlık ipuçları için Instagram sayfamızı takip edin.
        </p>
        <a
          href="https://www.instagram.com/onbsaglik"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ display: "inline-flex" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          @onbsaglik
        </a>
      </div>
    </div>
  );
}
