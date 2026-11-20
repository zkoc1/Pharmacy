/**
 * Cimri.com Fiyat Karşılaştırma Motoru XML Ürün Beslemesi
 * URL: https://www.onbsaglik.com.tr/api/feeds/cimri
 */

import { getAllProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await getAllProducts();
    const activeProducts = products.filter((p) => p.status === "active" && p.stock > 0);
    const baseUrl = "https://www.onbsaglik.com.tr";

    const xmlItems = activeProducts
      .map((p) => {
        const cleanName = escapeXml(p.name);
        const cleanBrand = escapeXml(p.brand || "OnbSağlık");
        const cleanCategory = escapeXml(p.category || "Sağlık & Medikal");
        const productUrl = `${baseUrl}/urun/${p.slug}?utm_source=cimri&utm_medium=cpc`;
        const imageUrl = p.images?.[0]
          ? p.images[0].startsWith("http")
            ? escapeXml(p.images[0])
            : `${baseUrl}${p.images[0].startsWith("/") ? "" : "/"}${escapeXml(p.images[0])}`
          : `${baseUrl}/logo.png`;
        const shippingFee = p.price >= 500 ? "0.00" : "49.90";

        return `  <MerchantItem>
    <merchantItemId>${p.id}</merchantItemId>
    <merchantItemCategoryName>${cleanCategory}</merchantItemCategoryName>
    <brand>${cleanBrand}</brand>
    <model>${cleanName}</model>
    <itemTitle>${cleanName}</itemTitle>
    <merchantItemField>${escapeXml(p.barcode || `ONB-${p.id}`)}</merchantItemField>
    <itemUrl>${productUrl}</itemUrl>
    <pricePlusTax>${p.price.toFixed(2)}</pricePlusTax>
    <itemUrlMobile>${productUrl}</itemUrlMobile>
    <itemImageUrl>${imageUrl}</itemImageUrl>
    <shippingFee>${shippingFee}</shippingFee>
    <stockStatus>${p.stock}</stockStatus>
    <shippingDay>1</shippingDay>
    <shippingDetail>HepsiJet ile Hızlı Kargo</shippingDetail>
    <ean>${escapeXml(p.barcode || "")}</ean>
  </MerchantItem>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="utf-8"?>
<MerchantItems xmlns="http://www.cimri.com/schema/merchant/upload" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
${xmlItems}
</MerchantItems>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=600",
      },
    });
  } catch (error: any) {
    console.error("[Cimri XML Feed Error]:", error);
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
