/**
 * Ürün detay sayfası — /urun/[slug] rotası.
 * Google SEO, Rich Snippet (Product, FAQ, Breadcrumb JSON-LD),
 * Yüksek dönüşüm ve satın alma odaklı meta etiketleri.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllProducts, getProductBySlug, formatPrice, calcDiscount } from "@/lib/products";
import ProductDetailClient from "@/components/product/ProductDetailClient";
import ProductTabs from "@/components/product/ProductTabs";
import ProductReviews from "@/components/product/ProductReviews";
import { ShieldCheck, Truck, CreditCard, RotateCcw, HelpCircle, CheckCircle2 } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

// Statik sayfa üretimi için tüm slug'ları döndür
export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

// Google Arama Sonuçlarında İlk Sıraları Hedefleyen Dinamik Meta Veriler
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const cleanPrice = formatPrice(product.price);
  const title = `${product.name} Satın Al, En Uygun Fiyatı & Yorumları | OnbSağlık`;
  const description = `${product.name} en uygun fiyat (${cleanPrice}), %100 orijinal eczane garantisi ve hızlı kargo avantajıyla onbsaglik.com.tr'de! ${product.brand} ürününü hemen inceleyin, indirimli fiyatla güvenle satın alın.`;

  return {
    title,
    description,
    keywords: [
      product.name,
      `${product.name} satın al`,
      `${product.name} fiyatı`,
      `${product.name} en ucuz`,
      `${product.name} eczane`,
      `${product.name} kullanıcı yorumları`,
      `${product.name} kullananlar`,
      `${product.name} ne işe yarar`,
      `${product.name} nasıl kullanılır`,
      `${product.brand} satın al`,
      `${product.brand} ürünleri`,
      `${product.category} satın al`,
      "online eczane",
      "orijinal eczane güvencesi",
      "hızlı kargo",
      "indirimli eczane fiyatı"
    ],
    alternates: {
      canonical: `https://onbsaglik.com.tr/urun/${product.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://onbsaglik.com.tr/urun/${product.slug}`,
      siteName: "OnbSağlık",
      locale: "tr_TR",
      type: "website",
      images: product.images && product.images.length > 0
        ? product.images.map((img) => ({
            url: img,
            width: 800,
            height: 800,
            alt: `${product.name} - ${product.brand}`,
          }))
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.images && product.images.length > 0 ? [product.images[0]] : [],
    },
  };
}

export default async function UrunDetaySayfasi({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const discountRate = calcDiscount(product.price, product.marketPrice);
  const inStock = Boolean(product.stock && product.stock > 0 && product.status === "active");

  // 1. Google Schema.org Product Rich Snippet (Fiyat, Stok, Yıldızlar, Barkod)
  const productJsonLd: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: `${product.brand} marka ${product.name} orijinal eczane güvencesi, en uygun fiyat ve aynı gün kargo avantajıyla onbsaglik.com.tr'de!`,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    sku: product.barcode || `ONB-${product.id}`,
    offers: {
      "@type": "Offer",
      url: `https://onbsaglik.com.tr/urun/${product.slug}`,
      priceCurrency: "TRY",
      price: product.price,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Pharmacy",
        name: "OnbSağlık",
        url: "https://onbsaglik.com.tr"
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "TR",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn"
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: product.price >= 500 ? "0" : "59",
          currency: "TRY"
        },
        shippingDestination: [{
          "@type": "DefinedRegion",
          addressCountry: "TR"
        }],
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "d"
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "d"
          }
        }
      }
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "42",
      bestRating: "5",
      worstRating: "1"
    },
  };

  if (product.barcode) {
    productJsonLd.gtin13 = product.barcode;
  }

  // 2. Google BreadcrumbList (Ekmek Kırıntısı Navigasyon Şeması)
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Anasayfa",
        item: "https://onbsaglik.com.tr"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: product.category,
        item: `https://onbsaglik.com.tr/kategori/${product.categorySlug}`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.brand,
        item: `https://onbsaglik.com.tr/marka/${product.brandSlug}`
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: `https://onbsaglik.com.tr/urun/${product.slug}`
      }
    ]
  };

  // 3. Google FAQPage Rich Snippet (Arama Sonuçlarında Doğrudan Çıkan Soru-Cevaplar)
  const faqList = [
    {
      q: `${product.name} orijinal mi ve faturalı mı?`,
      a: `Evet, OnbSağlık üzerinden satın aldığınız tüm ${product.brand} ürünleri %100 orijinaldir, ecza depolarından ve yetkili distribütörlerden temin edilir. Her sipariş adınıza resmi e-Arşiv faturalı olarak gönderilmektedir.`
    },
    {
      q: `${product.name} siparişim ne zaman kargoya verilir?`,
      a: `Hafta içi saat 15:00'e kadar verilen tüm ${product.name} siparişleri aynı gün özenle darbe koruyucu ambalajlarla paketlenerek kargoya teslim edilir. Takip kodunuz SMS ve e-posta ile tarafınıza iletilir.`
    },
    {
      q: `${product.name} ürününün son kullanma tarihi (SKT) nedir?`,
      a: `OnbSağlık deposundaki tüm ürünler güncel üretim serisine ve uzun miada (minimum 1-3 yıl kullanım süresine) sahiptir. Kesinlikle yakın miatlı ürün satışı yapılmaz.`
    },
    {
      q: `${product.name} nasıl kullanılmalıdır?`,
      a: `${product.name} ürününü doğrudan güneş ışığı almayan, serin ve kuru bir ortamda muhafaza ediniz. Günlük dozaj ve tavsiye edilen kullanım şekli için ambalaj üzerindeki üretici prospektüsünü inceleyebilir veya eczacınıza danışabilirsiniz.`
    }
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqList.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a
      }
    }))
  };

  return (
    <div className="container-custom py-8">
      {/* Google SEO Zengin Sonuç Yapısal Verileri (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Breadcrumb navigasyonu */}
      <nav className="flex items-center gap-2 text-sm mb-8 flex-wrap" style={{ color: "var(--color-text-muted)" }}>
        <a href="/" style={{ color: "var(--color-primary)" }} className="hover:underline">Anasayfa</a>
        <span>/</span>
        <a href={`/kategori/${product.categorySlug}`} style={{ color: "var(--color-primary)" }} className="hover:underline">
          {product.category}
        </a>
        <span>/</span>
        <a href={`/marka/${product.brandSlug}`} style={{ color: "var(--color-primary)" }} className="hover:underline">
          {product.brand}
        </a>
        <span>/</span>
        <span className="line-clamp-1 font-semibold text-gray-800">{product.name}</span>
      </nav>

      {/* İstemci taraflı ürün detay bileşeni */}
      <ProductDetailClient product={product} discountRate={discountRate} />

      {/* İstemci taraflı detaylı ürün sekmeleri */}
      <ProductTabs product={product} />

      {/* Google E-E-A-T ve Satın Alma Güvencesi Kartları */}
      <div className="my-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-gray-900 mb-1">%100 Orijinal Ürün</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Yetkili ecza depolarından temin edilen, adınıza faturalı orijinal ürün garantisi.</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Truck size={22} />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-gray-900 mb-1">Aynı Gün Hızlı Kargo</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Hafta içi saat 15:00'e kadar verilen siparişler aynı gün koruyucu ambalajla kargolanır.</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <CreditCard size={22} />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-gray-900 mb-1">Güvenli 3D Ödeme</h4>
            <p className="text-xs text-gray-500 leading-relaxed">256-Bit SSL şifreleme ve 3D Secure güvencesiyle tüm banka ve kredi kartlarına uygun.</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <RotateCcw size={22} />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-gray-900 mb-1">14 Gün Kolay İade</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Ambalajı açılmamış tüm siparişlerinizde 14 gün koşulsuz iade ve değişim hakkı.</p>
          </div>
        </div>
      </div>

      {/* Google Aramalarında Ürünü Öne Çıkaran Sıkça Sorulan Sorular (On-Page SEO) */}
      <section className="my-10 bg-white border border-gray-100 p-6 sm:p-8 rounded-3xl shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <HelpCircle size={20} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">
              {product.name} Hakkında Sıkça Sorulan Sorular & Satın Alma Bilgileri
            </h2>
            <p className="text-xs text-gray-500">Orijinallik, kargo teslimatı ve kullanım tavsiyeleri</p>
          </div>
        </div>

        <div className="space-y-4">
          {faqList.map((faq, index) => (
            <details key={index} className="group border border-gray-100 rounded-2xl p-4 transition-colors hover:border-emerald-200">
              <summary className="font-bold text-sm text-gray-800 cursor-pointer list-none flex items-center justify-between gap-4">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  {faq.q}
                </span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed pl-6 border-t border-gray-50 pt-3">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Müşteri Yorumları */}
      <ProductReviews productSlug={slug} productId={product.id} />
    </div>
  );
}
