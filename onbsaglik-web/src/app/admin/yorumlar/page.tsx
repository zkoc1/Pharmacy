"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star, Trash2, ArrowLeft, Search, CheckCircle, XCircle, ExternalLink, MessageCircle } from "lucide-react";
import { getValidAdminSession } from "@/lib/authUtils";

interface DbReview {
  id: string;
  product_id: number;
  user_email: string;
  user_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
  products?: {
    name: string;
    slug: string;
    brand: string;
  };
}

export default function AdminYorumlar() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [search, setSearch] = useState("");
  const [reviews, setReviews] = useState<DbReview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/admin/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const session = getValidAdminSession();
    if (!session) {
      router.replace("/admin/giris?expired=1");
      return;
    }
    setIsAuthorized(true);
    fetchReviews();
  }, [router]);

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_approved: !currentStatus }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, is_approved: !currentStatus } : r))
        );
      }
    } catch (err) {
      alert("Hata oluştu.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu yorumu tamamen silmek istediğinize emin misiniz?")) {
      try {
        const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
        if (res.ok) {
          setReviews((prev) => prev.filter((r) => r.id !== id));
        }
      } catch (err) {
        alert("Silme hatası.");
      }
    }
  };

  if (!isAuthorized) return null;

  const filteredReviews = reviews.filter(
    (r) =>
      r.comment.toLowerCase().includes(search.toLowerCase()) ||
      r.user_name.toLowerCase().includes(search.toLowerCase()) ||
      (r.products?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      <header className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white px-6 py-5 shadow-lg">
        <div className="container-custom max-w-7xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-2xl transition-all flex items-center gap-1 text-xs font-bold"
            >
              <ArrowLeft size={16} /> Panel
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border border-emerald-500/30">
                  Moderasyon
                </span>
                <h1 className="text-lg font-black tracking-tight">Yorum Yönetimi</h1>
              </div>
              <p className="text-xs text-emerald-200/70 font-medium">
                Kullanıcıların yaptığı yorumları incele, onayla veya sil.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container-custom max-w-7xl py-8 space-y-6">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Yorumlarda, müşteri adında veya üründe ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100/70 border-b border-gray-200 text-gray-500 font-extrabold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="p-4 w-48">Müşteri</th>
                  <th className="p-4 w-48">Ürün</th>
                  <th className="p-4 w-24">Puan</th>
                  <th className="p-4">Yorum</th>
                  <th className="p-4 w-32">Durum / Tarih</th>
                  <th className="p-4 w-32 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-400 font-medium">Yükleniyor...</td>
                  </tr>
                ) : filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center flex flex-col items-center justify-center gap-3">
                      <MessageCircle size={32} className="text-gray-300" />
                      <span className="text-gray-400 font-medium">Aradığınız kriterlerde yorum bulunamadı.</span>
                    </td>
                  </tr>
                ) : (
                  filteredReviews.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 align-top">
                        <div className="font-bold text-gray-900">{r.user_name}</div>
                        <div className="text-[10px] text-gray-400 mt-1">{r.user_email}</div>
                      </td>
                      <td className="p-4 align-top">
                        <div className="font-bold text-emerald-700 text-xs line-clamp-2">
                          {r.products?.name || "Bilinmeyen Ürün"}
                        </div>
                        {r.products?.slug && (
                          <a
                            href={`/urun/${r.products.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[10px] text-sky-500 hover:text-sky-700 mt-1"
                          >
                            Ürüne Git <ExternalLink size={10} />
                          </a>
                        )}
                      </td>
                      <td className="p-4 align-top">
                        <div className="flex items-center text-amber-500">
                          {r.rating} <Star size={14} fill="currentColor" className="ml-1" />
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <p className="text-xs text-gray-600 leading-relaxed max-w-xl">
                          {r.comment}
                        </p>
                      </td>
                      <td className="p-4 align-top">
                        {r.is_approved ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                            <CheckCircle size={12} /> Yayında
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded">
                            Onay Bekliyor
                          </span>
                        )}
                        <div className="text-[10px] text-gray-400 mt-2">
                          {new Date(r.created_at).toLocaleDateString("tr-TR")}
                        </div>
                      </td>
                      <td className="p-4 align-top text-right space-x-2">
                        <button
                          onClick={() => handleToggleApproval(r.id, r.is_approved)}
                          className={`p-2 rounded-xl transition-colors ${
                            r.is_approved
                              ? "text-amber-500 hover:bg-amber-50"
                              : "text-emerald-500 hover:bg-emerald-50"
                          }`}
                          title={r.is_approved ? "Yayından Kaldır" : "Onayla ve Yayınla"}
                        >
                          {r.is_approved ? <XCircle size={18} /> : <CheckCircle size={18} />}
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                          title="Sil"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
