"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useReviewStore, Review } from "@/stores/reviewStore";
import { Star, Trash2, ArrowLeft, Search, CheckCircle, ExternalLink, MessageCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

export default function AdminYorumlar() {
  const router = useRouter();
  const { reviews, deleteReview } = useReviewStore();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("admin_session");
    if (!raw) {
      router.replace("/admin/giris");
      return;
    }
    try {
      const p = JSON.parse(raw);
      if (p.role === "super_admin" || p.role === "admin") {
        setIsAuthorized(true);
      } else {
        router.replace("/admin/giris");
      }
    } catch {
      router.replace("/admin/giris");
    }
  }, [router]);

  if (!isAuthorized) return null;

  const filteredReviews = reviews.filter((r) =>
    r.comment.toLowerCase().includes(search.toLowerCase()) ||
    r.authorName.toLowerCase().includes(search.toLowerCase()) ||
    r.productSlug.toLowerCase().includes(search.toLowerCase())
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
                Sistemdeki tüm ürün yorumlarını görüntüle ve yönet.
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
              placeholder="Yorumlarda, müşteri adında veya ürün URL'sinde ara..."
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
                  <th className="p-4 w-32">Tarih</th>
                  <th className="p-4 w-20 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-400 font-medium flex flex-col items-center justify-center gap-3">
                      <MessageCircle size={32} className="text-gray-300" />
                      Aradığınız kriterlerde yorum bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredReviews.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-gray-900 block">{r.authorName}</span>
                        {r.email && (
                          <span className="text-[11px] text-gray-500 font-medium block">{r.email}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Link
                          href={`/urun/${r.productSlug}`}
                          target="_blank"
                          className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-xs truncate max-w-[150px] inline-block"
                          title={r.productSlug}
                        >
                          {r.productSlug} <ExternalLink size={12} />
                        </Link>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              fill={i < r.rating ? "currentColor" : "transparent"}
                              className={i < r.rating ? "text-amber-500" : "text-gray-300"}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="p-4 max-w-md">
                        <p className="text-xs text-gray-700 leading-relaxed font-medium line-clamp-2" title={r.comment}>
                          {r.comment}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className="text-[11px] text-gray-500 font-bold block">
                          {format(parseISO(r.createdAt), "dd MMM yyyy", { locale: tr })}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm("Bu yorumu silmek istediğinize emin misiniz?")) {
                              deleteReview(r.id);
                            }
                          }}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center"
                          title="Yorumu Sil"
                        >
                          <Trash2 size={16} />
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
