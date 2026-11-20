/**
 * Google Merchant Center (Google Alışveriş) & Meta (Facebook/Instagram) Katalog XML Feed
 * URL: https://www.onbsaglik.com.tr/api/feeds/google-merchant
 *
 * Bu besleme:
 * 1. Google Merchant Center -> Ücretsiz Ürün Listelemeleri (Google'da fotoğraflı/fiyatlı en üst sıra)
 * 2. Google Ads -> Maksimum Performans (PMax) & Alışveriş Reklamları
 * 3. Meta Commerce Manager -> Instagram & Facebook Katalog / Dinamik Ürün Reklamları
 * ile %100 uyumlu RSS 2.0 (xmlns:g="http://base.google.com/ns/1.0") formatındadır.
 */

import { getAllProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await getAllProducts();
    const activeProducts = products.filter((p) => p.status === "active");
    const baseUrl = "https://www.onbsaglik.com.tr";

    const xmlItems = activeProducts
      .map((p) => {
        const cleanName = escapeXml(p.name);
        const cleanBrand = escapeXml(p.brand || "OnbSağlık");
        const cleanCategory = escapeXml(p.category || "Sağlık ve Güzellik > Sağlık Bakımı");
        const rawDesc =
          p.description && p.description.trim().length > 20
            ? p.description.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim()
            : `${p.brand} ${p.name} %100 orijinal eczane güvencesi, faturalı gönderim ve hızlı kargo avantajıyla OnbSağlık'ta.`;
        const cleanDesc = escapeXml(rawDesc.slice(0, 4500));

        const productUrl = `${baseUrl}/urun/${p.slug}?utm_source=google_merchant&utm_medium=shopping`;
        const imageUrl = p.images?.[0]
          ? p.images[0].startsWith("http")
            ? escapeXml(p.images[0])
            : `${baseUrl}${p.images[0].startsWith("/") ? "" : "/"}${escapeXml(p.images[0])}`
          : `${baseUrl}/logo.png`;

        const availability = p.stock && p.stock > 0 ? "in_stock" : "out_of_stock";
        const shippingPrice = p.price >= 500 ? "0.00 TRY" : "49.90 TRY";

        // Piyasa fiyatı (marketPrice) indirimli fiyattan büyükse Google'da üstü çizili indirimli fiyat gösterir
        const hasSale = p.marketPrice && p.marketPrice > p.price;
        const regularPriceStr = hasSale
          ? `${p.marketPrice!.toFixed(2)} TRY`
          : `${p.price.toFixed(2)} TRY`;
        const salePriceTag = hasSale
          ? `\n      <g:sale_price>${p.price.toFixed(2)} TRY</g:sale_price>`
          : "";

        const gtinTag =
          p.barcode && p.barcode.trim().length >= 8
            ? `\n      <g:gtin>${escapeXml(p.barcode.trim())}</g:gtin>`
            : `\n      <g:identifier_exists>no</g:identifier_exists>`;

        return `    <item>
      <g:id>ONB-${p.id}</g:id>
      <g:title>${cleanName}</g:title>
      <g:description>${cleanDesc}</g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${regularPriceStr}</g:price>${salePriceTag}
      <g:brand>${cleanBrand}</g:brand>${gtinTag}
      <g:mpn>ONB-${p.id}</g:mpn>
      <g:product_type>${cleanCategory}</g:product_type>
      <g:google_product_category>Health &amp; Beauty &gt; Health Care</g:google_product_category>
      <g:shipping>
        <g:country>TR</g:country>
        <g:service>HepsiJet Standart Kargo</g:service>
        <g:price>${shippingPrice}</g:price>
      </g:shipping>
    </item>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>OnbSağlık Ürün Kataloğu - Orijinal Eczane Ürünleri</title>
    <link>${baseUrl}</link>
    <description>Orijinal eczane güvencesiyle vitamin, besin takviyeleri, dermokozmetik ve kişisel bakım ürünleri.</description>
${xmlItems}
  </channel>
</rss>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=600",
      },
    });
  } catch (error: any) {
    console.error("[Google Merchant XML Feed Error]:", error);
    return new Response("<error>XML oluşturulamadı</error>", {
      status: 500,
      headers: { "Content-Type": "application/xml" },
    });
  }
}

function escapeXml(unsafe: string) {
  return (unsafe || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
