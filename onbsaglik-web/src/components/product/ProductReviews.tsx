/**
 * Müşteri Yorum Sistemi Bileşeni — ProductReviews
 * Ürün için mevcut müşteri yorumlarını listeler ve yeni yorum ekleme formu sunar.
 */
"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, CheckCircle2, User, Send, ThumbsUp } from "lucide-react";
import { useReviewStore, Review } from "@/stores/reviewStore";

interface Props {
  productSlug: string;
  productId?: number;
}

const RATING_LABELS: Record<number, string> = {
  1: "Çok Kötü",
  2: "Kötü",
  3: "Orta",
  4: "İyi",
  5: "Mükemmel",
};

export default function ProductReviews({ productSlug, productId }: Props) {
  const [mounted, setMounted] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const reviews = useReviewStore((s) => s.reviews);
  const addReview = useReviewStore((s) => s.addReview);

  useEffect(() => {
    setMounted(true);
  }, []);

  const productReviews = mounted ? reviews.filter((r) => r.productSlug === productSlug) : [];
  const reviewCount = productReviews.length;
  const averageRating =
    reviewCount > 0
      ? Number((productReviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1))
      : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!authorName.trim()) {
      setErrorMsg("Lütfen adınızı ve soyadınızı giriniz.");
      return;
    }

    if (!comment.trim()) {
      setErrorMsg("Lütfen ürün hakkındaki yorumunuzu yazınız.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setErrorMsg("Lütfen 1 ile 5 arasında bir puan veriniz.");
      return;
    }

    addReview({
      productSlug,
      productId,
      authorName: authorName.trim(),
      email: email.trim() || undefined,
      rating,
      comment: comment.trim(),
    });

    setAuthorName("");
    setEmail("");
    setComment("");
    setRating(5);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsFormOpen(false);
    }, 3000);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="card mt-8" style={{ padding: "32px" }}>
      {/* Başlık ve Özet Alanı */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 gap-6" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare size={22} style={{ color: "var(--color-primary)" }} />
              Müşteri Değerlendirmeleri
            </h2>
            <span
              className="badge"
              style={{
                background: "var(--color-bg)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
                fontWeight: 600,
              }}
            >
              {reviewCount} Yorum
            </span>
          </div>
          <p style={{ fontSize: "14px", color: "var(--color-text-muted)", margin: 0 }}>
            Bu ürünü satın alan müşterilerimizin gerçek deneyimleri ve puanları.
          </p>
        </div>

        {/* Puan ve Yorum Yap Butonu */}
        <div className="flex flex-wrap items-center gap-4">
          {reviewCount > 0 ? (
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
              <div className="text-3xl font-extrabold" style={{ color: "var(--color-primary)" }}>
                {averageRating}
              </div>
              <div>
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      fill={star <= Math.round(averageRating) ? "#f59e0b" : "none"}
                      stroke="#f59e0b"
                    />
                  ))}
                </div>
                <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                  5 üzerinden ortalama
                </div>
              </div>
            </div>
          ) : null}

          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="btn-primary"
            style={{ fontSize: "14px", padding: "10px 20px" }}
          >
            {isFormOpen ? "Formu Kapat" : "Yorum Yap"}
          </button>
        </div>
      </div>

      {/* Yorum Ekleme Formu */}
      {isFormOpen && (
        <div
          className="mb-10 p-6 rounded-2xl transition-all"
          style={{
            background: "var(--gradient-card)",
            border: "2px solid rgba(16, 185, 129, 0.2)",
          }}
        >
          <h3 className="text-base font-bold mb-4 flex items-center gap-2">
            ✍️ Ürünü Değerlendirin
          </h3>

          {isSuccess ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-3 text-sm">
              <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />
              <span>Yorumunuz başarıyla kaydedildi! Teşekkür ederiz.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
                  {errorMsg}
                </div>
              )}

              {/* Yıldız Puanlama */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Puanınız *
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const activeStar = hoverRating > 0 ? hoverRating : rating;
                      const isFilled = star <= activeStar;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 text-slate-300 hover:scale-110 transition-transform focus:outline-none"
                          aria-label={`${star} yıldız`}
                        >
                          <Star
                            size={28}
                            fill={isFilled ? "#f59e0b" : "none"}
                            stroke={isFilled ? "#f59e0b" : "#cbd5e1"}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-sm font-semibold text-amber-600">
                    {RATING_LABELS[hoverRating || rating]}
                  </span>
                </div>
              </div>

              {/* İsim & E-posta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Adınız Soyadınız *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Ahmet Yılmaz"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      background: "white",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    E-posta Adresiniz <span className="text-slate-400 font-normal">(Yayınlanmaz, opsiyonel)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="ahmet@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      background: "white",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Yorum Metni */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Yorumunuz *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Ürünün etkisi, kargo hızı ve paketlemesi hakkındaki deneyimlerinizi paylaşın..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    background: "white",
                    fontSize: "14px",
                    outline: "none",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="btn-outline"
                  style={{ fontSize: "14px", padding: "10px 18px" }}
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ fontSize: "14px", padding: "10px 22px" }}
                >
                  <Send size={15} />
                  Yorumu Gönder
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Yorumlar Listesi */}
      {productReviews.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-200">
          <MessageSquare size={44} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-semibold text-slate-700 mb-1">
            Henüz yorum yok. İlk yorumu siz yapın!
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
            Bu ürün hakkında henüz bir değerlendirme yapılmamış. Deneyiminizi ilk siz paylaşın.
          </p>
          {!isFormOpen && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="btn-primary"
              style={{ fontSize: "13px", padding: "8px 18px" }}
            >
              İlk Yorumu Yaz
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {productReviews.map((item: Review) => (
            <div
              key={item.id}
              className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{
                      background: "rgba(16, 185, 129, 0.12)",
                      color: "var(--color-primary-dark)",
                    }}
                  >
                    {item.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                      {item.authorName}
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 size={12} className="text-emerald-600" /> Onaylı Alıcı
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatDate(item.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Yıldız Gösterimi */}
                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        fill={star <= item.rating ? "#f59e0b" : "none"}
                        stroke="#f59e0b"
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-800 ml-1">
                    {item.rating}/5
                  </span>
                </div>
              </div>

              {/* Yorum Metni */}
              <p className="text-sm text-slate-700 leading-relaxed pl-13">
                {item.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
