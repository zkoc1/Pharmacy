# onbsaglik.com — E-Ticaret Platformu Mimari ve Proje Planı (v2)

**Referans tasarım:** dermoeczanem.com
**Ürün kataloğu kaynağı:** `trendyol_ürün_listemiz.xlsx` (539 ürün, 113 marka)
**GitHub:** https://github.com/zkoc1
**Instagram:** https://www.instagram.com/onbsaglik

---

## ⚠️ Önce Önemli Bir Not — Yüklediğin Excel Hakkında

Dosyanı analiz ederken **"Durum"** sütununda dikkat çekmen gereken bir şey gördüm: 539 üründen yaklaşık **270'inin (%50'den fazla)** Trendyol tarafından şu etiketlerle işaretlendiğini görüyorum:

- "Kuvvetli Orijinallik Şüphesi Taşıyan Ürünler" — 156 ürün
- "Hakkımdaki Marka İhlal Bildirimi" — 80 ürün
- "Marka Hakkı İhlali - SPM" — 16 ürün
- "Hatalı Marka" — 13 ürün
- "Satışı Yasak Ürün" — 11 ürün
- "Orijinallik Şüphesine İlişkin Belgeleri Yüklememe/Reddetme" — 22 ürün

Bu, Trendyol'un bu ürünlerin **orijinallik/marka hakkı** açısından sorunlu olduğunu düşündüğü anlamına geliyor. Kendi bağımsız sitende (onbsaglik.com) bu ürünleri aynen listelersen, marka sahiplerinden ihtar/hukuki süreç riski olabilir — özellikle bunlar kozmetik/takviye gibi sağlıkla ilgili ürünler olduğu için (Sağlık Bakanlığı/Tarım Bakanlığı tarafında da takviye edici gıda bildirimleri gerekiyor).

**Önerim:** Kataloğu siteye aktarmadan önce, tedarikçi faturası/distribütörlük belgesi olan ürünleri ayıklayıp önce onları yayınla; "orijinallik şüphesi" veya "marka ihlali" etiketli ürünleri hukuki/tedarik durumu netleşene kadar **taslak (yayınlanmamış)** statüsünde tut. Aşağıdaki import pipeline'ında bu alanı (`trendyol_durum`) veritabanına dahil ediyorum, böylece admin panelinde bu ürünleri filtreleyip tek tek gözden geçirebilirsin.

Bunun dışında kalan kısım, teknik planın geri kalanı.

---

## 1. Gerçek Ürün Kataloğu Analizi

Excel'den çıkan özet:

| Metrik | Değer |
|---|---|
| Toplam ürün satırı | 539 |
| Farklı marka | 113 |
| Ortalama fiyat (KDV dahil) | ~302 TL |
| Fiyat aralığı | 0 TL – 3.699 TL (0 TL olanlar fiyat girilmemiş, temizlenmeli) |
| KDV oranları | %20 (251), %10 (221), %1 (67) |
| Kargo tipi | Hızlı Teslimat (çoğunluk) |

**En büyük kategoriler (ürün adedi):**

| Kategori | Adet |
|---|---|
| Vitamin | 184 |
| Yüz Güneş Kremi | 56 |
| Şampuan | 44 |
| Yüz Kremi | 29 |
| Vücut Güneş Kremi | 18 |
| Mineral | 16 |
| Kolajen | 16 |
| Bitkisel Ürünler | 15 |
| Balık Yağı | 14 |
| Saç Serum ve Yağı | 12 |
| Probiyotik ve Prebiyotik | 12 |
| Cilt Bakım Seti | 9 |
| Saç Bakım Seti | 8 |
| Diğer (Pastil, Göz Kremi, Fondöten, Tonik, Yüz Maskesi, Bebek Şampuanı, Glukozamin, Cilt Serumu, Vücut Kremi, Tüy Dökücü vb.) | ~50 |

**En çok ürünü olan markalar:** Ocean (82), Dermoskin (77), Nutraxin (53), Bioxcin (52), Orzax (18), Talya (18), Bioderma (16), Enterogermina (10), Argivit (10) — bu markalar site açılışında öne çıkarılmalı (dermoeczanem'deki marka şeridi gibi).

**Veri kalitesi notları (temizlik gerekli):**
- Bazı satırlarda fiyat 0 TL — bunlar "taslak" olarak işaretlenip fiyat girilmeden yayınlanmamalı.
- 2 satır kategori olarak "Oyuncak Silah & Su Tabancası" / "Eğitici Oyuncak" görünüyor — muhtemelen yanlış kategorilendirme, kontrol edip ya sağlık/bebek kategorisine ya da listeden çıkarılmaya uygun.
- Görseller Trendyol'un kendi CDN'inde (`cdn.dsmcdn.com`) barındırılıyor — bunları kendi sitende **doğrudan hotlink olarak kullanma** (Trendyol erişimi keserse ürün görselsiz kalır, ayrıca büyük ihtimalle kullanım hakkın yok). Faz 1'de görselleri indirip kendi S3/R2 deponda yeniden barındırmak (re-host) gerekiyor.

---

## 2. Bu Veriye Göre Kategori Ağacı (Önerilen)

```
Vitamin ve Takviye
├── Vitamin (D, C, B, Multivitamin...)
├── Mineral
├── Kolajen
├── Balık Yağı / Omega 3
├── Probiyotik ve Prebiyotik
├── Bitkisel Ürünler
├── Glukozamin
├── Koenzim Q10
├── Pastil
└── Fonksiyonel İçecek / Bal / Aktar Ürünleri

Güneş Bakımı
├── Yüz Güneş Kremi
└── Vücut Güneş Kremi

Saç Bakımı
├── Şampuan (dökülme karşıtı, bebek şampuanı dahil)
├── Saç Serum ve Yağı
├── Saç Bakım Seti
├── Saç Vitamini
└── Saç Toniği

Cilt Bakımı
├── Yüz Kremi
├── Cilt Bakım Seti
├── Yüz Temizleyici
├── Göz Kremi
├── Tonik
├── Yüz Maskesi
├── Cilt Serumu
├── Vücut Kremi
└── Kaş ve Kirpik Serumu

Makyaj
└── Fondöten (kataloğunda şimdilik sınırlı, ileride genişler)

Kişisel Bakım
├── Tüy Dökücü Krem
├── Deodorant / Roll-on
├── Kulak Tıkacı
└── Protez Diş Bakım

Anne Bebek
├── Bebek Şampuanı
└── Bebek Kremi ve Yağı

Medikal ve Sağlık Ürünleri
├── Sağlık Ölçüm Cihazları
└── Göz ve Burun Damlası
```

Bu ağaç, `categories` tablosuna 3 seviyeli (üst kategori → alt kategori → gerekirse alt-alt) olarak yüklenecek; Excel'deki `Kategori İsmi` sütunundaki 539 satır, bir eşleme (mapping) tablosuyla bu ağaca bağlanacak.

---

## 3. Teknoloji Seçimi ve Gerekçesi

### Frontend: **Next.js 15 (App Router) + TypeScript + Tailwind CSS**
- SSR/SSG ile ürün/kategori sayfaları Google'da hızlı indekslenir (539 ürünlük katalog için SEO kritik).
- Az JS ile hızlı ilk yükleme (Türkiye mobil trafiği yüksek).
- Görsel optimizasyonu hazır (re-host edilen ürün görselleri için önemli).

### Backend: **NestJS (Node.js + TypeScript)**
- Modüler yapı + Dependency Injection → SOLID prensiplerini doğal olarak destekler.
- Frontend ile aynı dil (TypeScript), tip güvenliği uçtan uca.

### Veritabanı: **PostgreSQL** + **Prisma ORM**
- 539 ürün, çok nitelikli (varyant, marka, kategori, KDV, desi) veri için ilişkisel model en uygunu.

### Önbellek/Kuyruk: **Redis + BullMQ**
- Excel import işlemi, görsel indirme/re-host işlemi gibi ağır işler arka planda kuyrukla yürütülür (kullanıcıyı bekletmeden).

### Arama: **Meilisearch**
- 539 ürün + büyüyecek katalog için anlık, Türkçe karakter destekli arama.

### Medya Depolama: **Cloudflare R2 / AWS S3**
- Trendyol CDN'inden indirilen görseller buraya taşınır, kendi CDN'in üzerinden sunulur.

### Ödeme: **iyzico** (birincil) + Havale/EFT seçeneği
- Taksit, 3D Secure, PCI-DSS yükünü senin yerine üstlenmesi (kart verisi hiç sunucunda tutulmaz).

### Hosting
- **Frontend:** Vercel (otomatik SSL/CDN) — **Backend+DB:** DigitalOcean/Hetzner (Docker) — **DNS/HTTPS:** Cloudflare (zorunlu HTTPS + ücretsiz SSL + DDoS koruması).

---

## 4. Mimari Prensipler (SOLID)

```
Controller (HTTP)  →  Service (iş kuralı)  →  Repository (interface arkasında DB erişimi)  →  Prisma/DB
```

- **S**RP: Her servis tek iş alanından sorumlu (`ProductImportService` sadece Excel/Trendyol veri aktarımını bilir, `PricingService` fiyat/KDV hesaplarını).
- **O**CP: Yeni pazaryeri entegrasyonu (örn. ileride Hepsiburada'dan da içe aktarım) mevcut `ImportSource` interface'ini implemente eden yeni bir sınıfla eklenir, eski kod değişmez.
- **L**SP: Tüm `ImportSource` implementasyonları (`TrendyolXlsxImportSource`, ileride `CsvImportSource`) aynı sözleşmeye uyar.
- **I**SP: Küçük, amaca özel interface'ler (`IStockChecker`, `IPriceValidator`).
- **D**IP: Servisler somut sınıflara değil interface'lere bağımlı; NestJS DI container bunu native destekler.

---

## 5. Klasör / Proje Yapısı

### Backend (`onbsaglik-api`)
```
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── categories/
│   ├── brands/
│   ├── products/
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   ├── repositories/product.repository.ts
│   │   └── dto/
│   ├── product-import/            # ← Trendyol Excel/CSV içe aktarım modülü
│   │   ├── import.controller.ts    # admin panelden dosya yükleme endpoint'i
│   │   ├── import.service.ts       # satır bazlı doğrulama + eşleme
│   │   ├── parsers/xlsx.parser.ts  # exceljs ile satır okuma
│   │   ├── mappers/category.mapper.ts   # Excel kategori adı → kendi kategori ağacı
│   │   └── jobs/image-rehost.processor.ts  # BullMQ: görselleri indir → R2'ye yükle
│   ├── inventory/
│   ├── cart/
│   ├── orders/
│   ├── payments/
│   │   ├── providers/
│   │   │   ├── payment-provider.interface.ts
│   │   │   ├── iyzico.provider.ts
│   │   │   └── paytr.provider.ts
│   ├── shipping/
│   ├── coupons/
│   ├── reviews/
│   ├── search/
│   ├── notifications/
│   └── admin/
├── common/ (guards, interceptors, filters, pipes)
├── config/
├── prisma/schema.prisma
└── main.ts
```

### Frontend (`onbsaglik-web`)
```
app/(storefront)/
├── page.tsx
├── kategori/[slug]/page.tsx
├── urun/[slug]/page.tsx
├── marka/[slug]/page.tsx
├── sepet/page.tsx
├── odeme/page.tsx
├── hesabim/…
components/ (layout, product, cart, checkout, ui)
lib/ (api-client, auth, analytics)
stores/ (Zustand — sepet/favori state)
```

### Admin Panel (`onbsaglik-admin`) — **yeni eklenen, kataloğun büyüklüğü nedeniyle önerilir**
539 ürünü ve büyüyecek kataloğu yönetmek için ayrı, basit bir admin arayüzü (Next.js veya React-Admin tabanlı):
- Excel/CSV toplu ürün yükleme ekranı (hata/uyarı raporu ile: "12 üründe fiyat eksik", "3 ürün orijinallik şüpheli, yayına alınmadı" gibi)
- Ürün/kategori/marka düzenleme
- Sipariş yönetimi, stok güncelleme

---

## 6. Veritabanı Şeması (Trendyol Verisine Göre Güncellendi)

```
products
├── id
├── name                    ← "Ürün Adı"
├── slug
├── description             ← "Ürün Açıklaması"
├── brand_id                ← "Marka" (FK → brands)
├── barcode                 ← "Barkod" (unique)
├── model_code               ← "Model Kodu"
├── supplier_sku             ← "Tedarikçi Stok Kodu"
├── base_price               ← "Trendyol'da Satılacak Fiyat (KDV Dahil)"
├── market_price              ← "Piyasa Satış Fiyatı" (varsa üstü çizili gösterim için)
├── vat_rate                  ← "KDV Oranı"
├── excise_tax_rate            ← "ÖTV Oranı"
├── desi                       ← kargo hesaplama için
├── gender                     ← "Cinsiyet" (Unisex/Erkek/Kadın)
├── status                     ← enum: draft / active / archived
├── source_status               ← "Durum" (Trendyol'dan gelen orijinallik/ihlal notu — bilgi amaçlı, admin filtrelemesi için)
├── is_verified_authentic         ← boolean, admin elle onayladıysa true (varsayılan false — yukarıdaki uyarı nedeniyle)
└── created_at / updated_at

product_variants
├── id, product_id
├── sku
├── color                    ← "Ürün Rengi"
├── size                      ← "Beden"
├── dimension                  ← "Boyut/Ebat"
├── stock_qty                   ← "Ürün Stok Adedi"
└── price_override

product_images
├── id, product_id
├── source_url                 ← orijinal Trendyol CDN linki (referans/log amaçlı)
├── hosted_url                  ← kendi R2/S3'teki kalıcı link
└── order

categories (self-referencing, 3 seviye)
brands (id, name, slug, logo_url)
category_import_mappings         ← Excel "Kategori İsmi" metnini kendi category_id'ne eşleyen tablo
shipping_profiles                 ← "Sevkiyat Tipi", "Kargo Şirketi", "Sevkiyat Süresi"
carts / cart_items
orders / order_items
payments
coupons
reviews
```

---

## 7. Excel → Veritabanı İçe Aktarım Akışı (Yeni, Kritik Adım)

Bu, Faz 1'in ilk işi olacak çünkü elindeki gerçek veri buradan geliyor:

1. **Admin panelden `.xlsx` yükle** → backend `product-import` modülü dosyayı alır.
2. **Satır bazlı doğrulama:** Barkod boş mu? Fiyat 0 mı? Kategori eşleşmesi var mı? → Hatalı satırlar "içe aktarılmadı" raporunda listelenir, işlem durmaz (kısmi başarı).
3. **Kategori eşleme:** `Kategori İsmi` sütunundaki her benzersiz değer (örn. "Yüz Güneş Kremi") otomatik olarak yukarıdaki ağaçtaki karşılığına eşlenir; eşleşmeyen yeni kategori adayları admin'e "onaylanmamış kategori" olarak gösterilir.
4. **Orijinallik/marka durumu kontrolü:** `Durum` sütununda "orijinallik şüphesi", "marka ihlali", "yasak ürün" geçen satırlar otomatik olarak `status = draft` ve `is_verified_authentic = false` ile kaydedilir — **bu ürünler admin onaylamadan mağazada görünmez.**
5. **Görsel re-host job'u (BullMQ kuyruğu):** Her ürün için `Görsel 1..8` linklerindeki dosyalar indirilir, optimize edilir (WebP'e çevrilir), R2/S3'e yüklenir, `hosted_url` doldurulur. Bu iş arka planda yürür, admin panelde ilerleme yüzdesi gösterilir.
6. **Sonuç raporu:** "539 satırdan 483'ü başarıyla içe aktarıldı, 270'i orijinallik uyarısı nedeniyle taslak, 12'si fiyat eksik nedeniyle atlandı" gibi özet admin'e sunulur.

Bu importer, SOLID'in OCP prensibine uygun şekilde `ImportSource` interface'i üzerinden yazılır — ileride farklı bir pazaryerinden (Hepsiburada, N11 vb.) veri almak istersen mevcut kodu bozmadan yeni bir "source" eklenir.

---

## 8. Ödeme Akışı

1. **Sepet Onayı** — stok + fiyat backend'de tekrar doğrulanır (yalnızca `status=active` ve `is_verified_authentic=true` ürünler satışa açık).
2. **Adres Seçimi**
3. **Kargo Seçimi** — `desi` alanına göre otomatik ücret hesaplama, `shipping_profiles` tablosundaki Trendyol kargo verisi başlangıç referansı olarak kullanılabilir.
4. **Ödeme Yöntemi** — Kredi/Banka Kartı (iyzico, taksit) veya Havale/EFT.
5. **3D Secure** — kart verisi asla sunucuda tutulmaz, iyzico'nun güvenli formu/iframe'i kullanılır.
6. **Webhook Doğrulama** — iyzico sunucudan sunucuya ödeme sonucunu bildirir; sipariş durumu (ve stok düşümü) **sadece bu webhook doğrulandığında** kesinleşir.
7. **Sipariş Onayı** — BullMQ kuyruğuna "e-posta gönder", "faturayı hazırla" job'ları eklenir.

**Güvenlik:** HTTPS zorunlu + HSTS, `helmet` middleware, DTO + `class-validator` ile girdi doğrulama, ödeme endpoint'lerinde rate limiting, webhook imza doğrulaması (HMAC).

---

## 9. GitHub Repo Yapısı

`https://github.com/zkoc1` altında:

```
zkoc1/
├── onbsaglik-web        (Next.js frontend)
├── onbsaglik-api          (NestJS backend + product-import modülü)
├── onbsaglik-admin         (katalog/sipariş yönetim paneli)
├── onbsaglik-infra          (Docker Compose, Nginx, CI/CD)
└── onbsaglik-docs            (bu plan, kategori eşleme tablosu, API dokümantasyonu)
```

Branch stratejisi: `main` ← `develop` ← `feature/*`. Her PR'da otomatik lint + test + build (GitHub Actions). `.env` dosyaları repoya girmez, gizli anahtarlar GitHub Secrets'ta tutulur.

---

## 10. Proje Fazları (Güncellendi)

| Faz | İçerik | Süre |
|---|---|---|
| **Faz 0 — Kurulum** | Repo iskeletleri, CI/CD, domain/DNS/SSL, Docker (Postgres+Redis) | 2-3 gün |
| **Faz 1 — Katalog + İçe Aktarım** | Kategori ağacı kurulumu, `product-import` modülü, 539 ürünün Excel'den aktarımı, görsel re-host, admin onay ekranı (orijinallik uyarılı ürünler için) | 1.5-2 hafta |
| **Faz 2 — Kullanıcı & Sepet** | Kayıt/giriş, adres, sepet, favoriler | 4-5 gün |
| **Faz 3 — Ödeme & Sipariş** | iyzico entegrasyonu, checkout, webhook, sipariş takip | 1-1.5 hafta |
| **Faz 4 — Arama & SEO** | Meilisearch, meta/sitemap, structured data | 4-5 gün |
| **Faz 5 — İçerik & Görsel** | Anasayfa, kampanya/marka sayfaları, Instagram feed widget'ı | 3-4 gün |
| **Faz 6 — Test & Güvenlik** | Yük testi, güvenlik taraması, ödeme sandbox testi, **orijinallik uyarılı ürünlerin son kontrolü** | 3-4 gün |
| **Faz 7 — Canlıya Alma** | Prod deploy, izleme (Sentry), yedekleme | 2 gün |

**Toplam:** ~6-7 hafta (katalog/içe aktarım işi eklendiği için önceki plandan biraz uzadı).

---

## 11. Sıradaki Adımlar

1. **Öncelik:** "Durum" sütununda uyarı taşıyan ~270 ürünü gözden geçir — hangileri gerçek distribütörlük/fatura ile destekleniyor, hangileri listeden tamamen çıkarılmalı. Bu, hem hukuki risk hem de admin onay iş yükünü belirleyecek.
2. Kategori eşleme tablosunu (Excel kategori adı → yukarıdaki ağaç) birlikte netleştirelim.
3. İstersen `product-import` modülünün NestJS + Prisma kod iskeletini (Excel parser + kategori mapper + BullMQ görsel job'u) birlikte yazmaya başlayabiliriz.
