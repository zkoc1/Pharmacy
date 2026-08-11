# onbsaglik.com

**onbsaglik.com** — Vitamin, Takviye Besin ve Kozmetik Ürünler E-Ticaret Platformu

[![Instagram](https://img.shields.io/badge/Instagram-%40onbsaglik-E4405F?logo=instagram)](https://www.instagram.com/onbsaglik)

---

## 🚀 Başlangıç

```bash
# Geliştirme sunucusunu başlat
cd onbsaglik-web
npm run dev

# Üretim için build al
npm run build
npm start
```

Uygulama: [http://localhost:3000](http://localhost:3000)  
Admin Paneli: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🗂️ Proje Yapısı

```
Pharmacy/
├── onbsaglik-web/          # Next.js 15 frontend
│   ├── src/
│   │   ├── app/            # App Router sayfalar
│   │   │   ├── page.tsx           # Anasayfa
│   │   │   ├── urun/[slug]/       # Ürün detay
│   │   │   ├── kategori/[slug]/   # Kategori listeleme
│   │   │   ├── sepet/             # Alışveriş sepeti
│   │   │   ├── ara/               # Arama sonuçları
│   │   │   └── admin/             # Yönetim paneli
│   │   ├── components/
│   │   │   ├── layout/     # Header, Footer
│   │   │   ├── product/    # Ürün kartı, grid, detay
│   │   │   ├── home/       # HeroBanner, CategoryCards, BrandStrip
│   │   │   └── ui/         # CartDrawer ve diğer UI bileşenleri
│   │   ├── data/           # Trendyol'dan aktarılan JSON verisi
│   │   ├── lib/            # Servis katmanı (products.ts)
│   │   ├── stores/         # Zustand state yönetimi
│   │   └── types/          # TypeScript tip tanımları
│   └── package.json
└── onbsaglik-proje-plani.md
```

---

## 🛒 Özellikler

- ✅ **184 ürün** — Trendyol Excel'inden aktarılmış ürün kataloğu
- ✅ **63 marka** — Ocean, Dermoskin, Nutraxin, Bioxcin ve daha fazlası
- ✅ **Kategori sistemi** — Vitamin & Takviye, Güneş Bakımı, Saç/Cilt Bakımı, Makyaj, Anne & Bebek
- ✅ **Arama** — Ürün adı, marka ve kategoride tam metin arama
- ✅ **Sepet** — Zustand ile kalıcı sepet (LocalStorage)
- ✅ **Admin Paneli** — Stok ve fiyat yönetimi, ürün yayınlama/gizleme
- ✅ **SEO** — Meta etiketleri, sitemap, yapısal veri
- ✅ **Responsive** — Mobil uyumlu tasarım

---

## 🏗️ Teknoloji

| Katman | Teknoloji |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Stil | Tailwind CSS + CSS Variables |
| State | Zustand (sepet yönetimi) |
| İkonlar | Lucide React |
| Font | Inter (Google Fonts) |

---

## 🔒 Admin Paneli

Admin paneline erişmek için `/admin/giris` sayfasına gidin.

> **Demo kimlik bilgileri:**  
> E-posta: `admin@onbsaglik.com`  
> Şifre: `onbAdmin2024!`

---

## 📋 Mimari Prensipler (SOLID)

- **S**RP: Her bileşen/servis tek bir sorumluluğa sahip
- **O**CP: `products.ts` servis katmanı — kapalı değişime, açık genişlemeye
- **L**SP: Tüm sayfa bileşenleri aynı props arayüzüne uyar
- **I**SP: Küçük ve amaca özgü tipler (`ProductFilter`, `CartItem`)
- **D**IP: Sayfalar somut veri katmanına değil, servis fonksiyonlarına bağımlı

---

## 🗺️ Yol Haritası

- [x] Faz 1: Next.js Frontend + Ürün Kataloğu
- [ ] Faz 2: NestJS Backend + PostgreSQL API
- [ ] Faz 3: iyzico Ödeme Entegrasyonu
- [ ] Faz 4: Görsel Re-host (Cloudflare R2)
- [ ] Faz 5: Meilisearch Arama
- [ ] Faz 6: Canlıya Alma (Vercel + Cloudflare DNS)

---

© 2024 onbsaglik.com — [@onbsaglik](https://www.instagram.com/onbsaglik)
