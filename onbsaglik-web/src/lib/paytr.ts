import crypto from "crypto";

export async function processPayTRRefund(merchant_oid: string, return_amount: number) {
  const merchant_id = process.env.PAYTR_MERCHANT_ID;
  const merchant_key = process.env.PAYTR_MERCHANT_KEY;
  const merchant_salt = process.env.PAYTR_MERCHANT_SALT;

  if (!merchant_id || !merchant_key || !merchant_salt) {
    console.error("PayTR refund failed: Credentials missing.");
    return { status: "error", err_msg: "API credentials missing" };
  }

  // PayTR expects return_amount as string or number without formatting, typically in standard TRY format but wait.
  // Docs say: return_amount: İade edilecek tutar (Örn: 15.50 veya 15.5)
  const amountStr = return_amount.toString();

  // Create hash: merchant_id + merchant_oid + return_amount + merchant_salt
  const hash_str = merchant_id + merchant_oid + amountStr + merchant_salt;
  const paytr_token = crypto
    .createHmac("sha256", merchant_key)
    .update(hash_str)
    .digest("base64");

  const bodyParams = new URLSearchParams({
    merchant_id,
    merchant_oid,
    return_amount: amountStr,
    paytr_token
  });

  try {
    const res = await fetch("https://www.paytr.com/odeme/iade", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: bodyParams.toString()
    });

    const result = await res.json();
    return result; // Expected { status: 'success', is_test: 0, merchant_oid: '...', return_amount: '...' } 
                   // Or { status: 'error', err_msg: '...', err_no: '...' }
  } catch (error: any) {
    console.error("PayTR Refund HTTP Error:", error);
    return { status: "error", err_msg: error.message };
  }
}
