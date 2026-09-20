  // Fiyat Düşüşü Bildirimi
  if (oldProduct && updateData.price && updateData.price < oldProduct.price) {
    const { data: priceAlarms } = await supabase.from("price_alarms").select("user_email, target_price").eq("product_id", id);
    if (priceAlarms && priceAlarms.length > 0) {
      const { sendEmail } = await import("@/lib/email");
      const productUrl = \\/urun/\\;
      for (const alarm of priceAlarms) {
        if (alarm.user_email && updateData.price <= alarm.target_price) {
          const mailHtml = \<h2>Müjde! Beklediğiniz Ürünün Fiyatı Düştü 🥳</h2>
            <p><strong>\</strong> ürününün fiyatı <strong>\ TL</strong> seviyesine düştü!</p>
            <a href="\" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;">Hemen İncele</a>\;
          await sendEmail({ to: alarm.user_email, subject: \Fiyat Alarmı: \\, html: mailHtml });
          await supabase.from("price_alarms").delete().eq("user_email", alarm.user_email).eq("product_id", id);
        }
      }
    }
  }

  // Stok Geldi Bildirimi
  if (oldProduct && oldProduct.stock === 0 && updateData.stock > 0) {
    const { data: stockAlarms } = await supabase.from("stock_alarms").select("user_email").eq("product_id", id);
    if (stockAlarms && stockAlarms.length > 0) {
      const { sendEmail } = await import("@/lib/email");
      const productUrl = \\/urun/\\;
      for (const alarm of stockAlarms) {
        if (alarm.user_email) {
          const mailHtml = \<h2>Müjde! Beklediğiniz Ürün Stoklarda 📦</h2>
            <p><strong>\</strong> ürünü yeniden stoklarımıza girmiştir!</p>
            <a href="\" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;">Hemen Satın Al</a>\;
          await sendEmail({ to: alarm.user_email, subject: \Stok Alarmı: \ Geldi!\, html: mailHtml });
          await supabase.from("stock_alarms").delete().eq("user_email", alarm.user_email).eq("product_id", id);
        }
      }
    }
  }
