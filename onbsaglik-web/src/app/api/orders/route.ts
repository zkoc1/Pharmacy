import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

// Herkes sipariş oluşturabilir (müşteri / misafir).
export async function POST(req: Request) {
  try {
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
      status: body.status || "Ödeme Bekliyor",
      delivery_address: body.deliveryAddress,
      billing_address: body.billingAddress || body.deliveryAddress,
      tracking_number: body.trackingNumber || "",
      admin_note: body.adminNote || "",
      customer_note: body.customerNote || ""
    };

    const { error: insertError } = await supabase.from("orders").insert(orderData);
    if (insertError) {
      console.error("Orders insert failed:", insertError);
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
      const { error: itemsError } = await supabase.from("order_items").insert(itemsData);
      if (itemsError) {
        console.error("Order items insert failed:", itemsError);
      }
    }

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("Order create error:", error);
    return NextResponse.json({ error: "Sipariş oluşturulamadı." }, { status: 500 });
  }
}
