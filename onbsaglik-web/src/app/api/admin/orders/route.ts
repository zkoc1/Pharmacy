import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { cookies } from "next/headers";

// JWT tabanlı auth fonksiyonumuz (admin/products'taki gibi)
async function getAdminEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  try {
    const decoded = atob(token);
    return decoded.split(":")[0];
  } catch {
    return null;
  }
}

export async function GET() {
  const adminEmail = await getAdminEmail();
  if (!adminEmail) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const supabase = getServiceSupabase();
  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select(`
      *,
      items:order_items(*)
    `)
    .order("created_at", { ascending: false });

  if (ordersError) {
    return NextResponse.json({ error: ordersError.message }, { status: 500 });
  }

  // Frontend'e uydurmak için veriyi maple
  const mapped = ordersData.map((o) => ({
    id: o.id,
    invoiceNo: o.invoice_no,
    date: new Date(o.created_at).toLocaleString("tr-TR"),
    customerEmail: o.customer_email,
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    total: Number(o.total),
    carrier: o.carrier,
    paymentMethod: o.payment_method,
    status: o.status,
    deliveryAddress: o.delivery_address,
    billingAddress: o.billing_address,
    trackingNumber: o.tracking_number,
    adminNote: o.admin_note,
    customerNote: o.customer_note,
    items: o.items.map((i: any) => ({
      id: i.product_id,
      slug: i.slug,
      name: i.name,
      brand: i.brand,
      price: Number(i.price),
      quantity: i.quantity,
      image: i.image
    }))
  }));

  return NextResponse.json(mapped);
}

export async function POST(req: Request) {
  const adminEmail = await getAdminEmail();
  if (!adminEmail) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();
  const supabase = getServiceSupabase();

  // Rastgele ID ve Fatura No oluştur
  const id = body.id || `ONB-${Math.floor(100000 + Math.random() * 900000)}`;
  const invoiceNo = `ONB2026${Math.floor(10000 + Math.random() * 90000)}`;

  const orderData = {
    id,
    invoice_no: invoiceNo,
    customer_email: body.customerEmail,
    customer_name: body.customerName,
    customer_phone: body.customerPhone,
    total: body.total,
    carrier: body.carrier,
    payment_method: body.paymentMethod,
    status: body.status || "Hazırlanıyor",
    delivery_address: body.deliveryAddress,
    billing_address: body.billingAddress || body.deliveryAddress,
    tracking_number: body.trackingNumber || "",
    admin_note: body.adminNote || "",
    customer_note: body.customerNote || ""
  };

  const { error: insertError } = await supabase.from("orders").insert(orderData);
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  if (body.items && body.items.length > 0) {
    const itemsData = body.items.map((i: any) => ({
      order_id: id,
      product_id: i.id,
      slug: i.slug,
      name: i.name,
      brand: i.brand,
      price: i.price,
      quantity: i.quantity,
      image: i.image
    }));
    await supabase.from("order_items").insert(itemsData);
  }

  // Log ekleyelim (opsiyonel)
  await supabase.from("admin_logs").insert({
    admin_email: adminEmail,
    action: "SİPARİŞ EKLENDİ",
    details: `#${id} numaralı manuel sipariş oluşturuldu.`
  });

  return NextResponse.json({ success: true, id });
}
