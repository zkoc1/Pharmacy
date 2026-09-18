"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, CheckCircle2, User, Send, ThumbsUp } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useOrderStore } from "@/stores/orderStore";
import { useAccountExtrasStore } from "@/stores/accountExtrasStore";
import { useSession } from "next-auth/react";

interface Props {
  productSlug: string;
  productId?: number;
}

interface DbReview {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

const RATING_LABELS: Record<number, string> = {
  1: "Çok Kötü",
  2: "Kötü",
  3: "Orta",
  4: "İyi",
  5: "Mükemmel",
};

export default function ProductReviews({ productSlug, productId }: Props) {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [rewardMsg, setRewardMsg] = useState("");

  const [productReviews, setProductReviews] = useState<DbReview[]>([]);
  const [loading, setLoading] = useState(true);
  
  const userEmail = useCartStore((s) => s.userEmail);
  const getOrdersByEmail = useOrderStore((s) => s.getOrdersByEmail);
  const grantReviewReward = useAccountExtrasStore((s) => s.grantReviewReward);

  useEffect(() => {
    setMounted(true);
    if (productId) {
      fetch(`/api/reviews?productId=${productId}`)
        .then(res => res.json())
        .then(data => {
          if (data.reviews) setProductReviews(data.reviews);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (session?.user && !authorName) {
      setAuthorName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session, authorName]);

  const reviewCount = productReviews.length;
  const averageRating =
    reviewCount > 0
      ? Number((productReviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1))
      : 0;

  const userOrders = mounted && userEmail !== "guest" ? getOrdersByEmail(userEmail) : [];
  const hasPurchased = mounted && productId ? userOrders.some((o) => o.status === "Teslim Edildi" && o.items.some((i) => i.id === productId)) : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setRewardMsg("");

    if (!hasPurchased) {
      setErrorMsg("Yorum yapabilmek için ürünü satın almış olmanız ve siparişinizin 'Teslim Edildi' durumunda olması gerekmektedir.");
      return;
    }

    if (!authorName.trim() || !comment.trim() || rating < 1 || rating > 5) {
      setErrorMsg("Lütfen tüm alanları geçerli şekilde doldurunuz.");
      return;
    }

    try {
      let finalName = authorName.trim();
      if (isAnonymous) {
        const parts = finalName.split(" ");
        finalName = parts.map(p => p.charAt(0) + "*".repeat(p.length > 1 ? p.length - 1 : 3)).join(" ");
      }

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          user_email: email.trim() || userEmail || "anon",
          user_name: finalName,
          rating,
          comment: comment.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsSuccess(true);
        if (userEmail && userEmail !== "guest") {
          const rewardCode = grantReviewReward(userEmail);
          setRewardMsg(`Tebrikler! Yorumunuz onaylandığında 5 TL hediye çekiniz tanımlanacaktır. Referans Kodunuz: ${rewardCode}`);
        }
        setAuthorName("");
        setEmail("");
        setComment("");
        setRating(5);
        setTimeout(() => {
          setIsSuccess(false);
          setIsFormOpen(false);
          setRewardMsg("");
        }, 5000);
      } else {
        setErrorMsg(data.error || "Yorum gönderilirken bir hata oluştu.");
      }
    } catch (err) {
      setErrorMsg("Sunucuya bağlanılamadı.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!mounted || loading) return <div className="py-8 text-center text-sm text-gray-500">Yorumlar yükleniyor...</div>;

  return (
    <div className="mt-12 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Müşteri Yorumları</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center text-amber-500">
              <Star size={20} fill="#f59e0b" stroke="#f59e0b" />
              <span className="ml-1.5 text-lg font-bold text-slate-900">
                {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
              </span>
            </div>
            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {reviewCount} Değerlendirme
            </span>
          </div>
        </div>

        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="btn-primary"
            style={{ fontSize: "14px", padding: "10px 20px" }}
          >
            Yorum Yap
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="mb-10 bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Ürünü Değerlendir</h3>
              <p className="text-xs text-slate-500">Deneyiminizi diğer müşterilerle paylaşın.</p>
            </div>
          </div>

          {isSuccess ? (
            <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 text-center animate-in fade-in zoom-in duration-300">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-600" />
              <h4 className="font-bold mb-1">Teşekkürler!</h4>
              <p className="text-sm">Yorumunuz başarıyla alındı ve yönetici onayına gönderildi.</p>
              {rewardMsg && (
                <div className="mt-3 bg-white p-3 rounded-lg border border-emerald-100 text-xs font-semibold text-emerald-700">
                  {rewardMsg}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-100 text-sm font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <label className="text-sm font-bold text-slate-700 w-32">Puanınız</label>
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (hoverRating || rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 text-slate-300 hover:scale-110 transition-transform focus:outline-none"
                        >
                          <Star size={28} fill={isFilled ? "#f59e0b" : "none"} stroke={isFilled ? "#f59e0b" : "#cbd5e1"} />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-sm font-semibold text-amber-600">{RATING_LABELS[hoverRating || rating]}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Adınız Soyadınız *</label>
                  <input type="text" required value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="w-4 h-4 text-emerald-500 rounded border-gray-300 focus:ring-emerald-500" />
                    <span className="text-xs text-slate-600 font-medium">İsmim gizli kalsın (Örn: A*** Y***)</span>
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">E-posta Adresiniz (Opsiyonel)</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Yorumunuz *</label>
                <textarea rows={4} required value={comment} onChange={(e) => setComment(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="btn-outline px-4 py-2 text-sm">Vazgeç</button>
                <button type="submit" className="btn-primary px-5 py-2 text-sm flex items-center gap-1"><Send size={15} /> Gönder</button>
              </div>
            </form>
          )}
        </div>
      )}

      {productReviews.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-200">
          <MessageSquare size={44} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-semibold text-slate-700 mb-1">Henüz yorum yok. İlk yorumu siz yapın!</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {productReviews.map((item: DbReview) => (
            <div key={item.id} className="p-5 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-emerald-50 text-emerald-700">
                    {item.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                      {item.user_name}
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 size={12} className="text-emerald-600" /> Onaylı Alıcı
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">{formatDate(item.created_at)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={14} fill={star <= item.rating ? "#f59e0b" : "none"} stroke="#f59e0b" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-800 ml-1">{item.rating}/5</span>
                </div>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed pl-13">{item.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
