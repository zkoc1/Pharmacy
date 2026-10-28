import { NextResponse } from "next/server";
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
        const cleanDesc = escapeXml((p.description || p.name).slice(0, 500));
        const productUrl = `${baseUrl}/urun/${p.slug}?utm_source=akakce&utm_medium=cpc`;
        const imageUrl = p.images?.[0]
          ? p.images[0].startsWith("http")
            ? p.images[0]
            : `${baseUrl}${p.images[0].startsWith("/") ? "" : "/"}${p.images[0]}`
          : `${baseUrl}/logo.png`;
        const shippingFee = p.price >= 500 ? "0.00" : "59.90";

        return `  <product>
    <id>${p.id}</id>
    <name>${cleanName}</name>
    <url>${productUrl}</url>
    <price>${p.price.toFixed(2)}</price>
    <currency>TRY</currency>
    <stock>${p.stock}</stock>
    <barcode>${p.barcode || ""}</barcode>
    <brand>${cleanBrand}</brand>
    <category>${cleanCategory}</category>
    <image_url>${imageUrl}</image_url>
    <shipping_fee>${shippingFee}</shipping_fee>
    <description>${cleanDesc}</description>
  </product>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="utf-8"?>
<akakce>
${xmlItems}
</akakce>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=600",
      },
    });
  } catch (error: any) {
    console.error("[Akakce XML Feed Error]:", error);
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
