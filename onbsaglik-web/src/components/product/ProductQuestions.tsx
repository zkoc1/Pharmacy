"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Search, CheckCircle2, User, Send, HelpCircle, X } from "lucide-react";
import { useSession } from "next-auth/react";

interface Props {
  productId: number;
}

interface DbQuestion {
  id: string;
  user_name: string;
  question: string;
  answer: string | null;
  created_at: string;
  answered_at: string | null;
}

export default function ProductQuestions({ productId }: Props) {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState<DbQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Soru sorma formu state'leri
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [email, setEmail] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Arama ve sıralama state'leri
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    fetch(`/api/questions?productId=${productId}`)
      .then(res => res.json())
      .then(data => {
        if (data.questions) setQuestions(data.questions);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    if (session?.user && !authorName) {
      setAuthorName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session, authorName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!authorName.trim() || !questionText.trim()) {
      setErrorMsg("Lütfen adınızı ve sorunuzu giriniz.");
      return;
    }

    try {
      let finalName = authorName.trim();
      if (isAnonymous) {
        const parts = finalName.split(" ");
        finalName = parts.map(p => p.charAt(0) + "*".repeat(p.length > 1 ? p.length - 1 : 3)).join(" ");
      }

      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          user_email: email.trim(),
          user_name: finalName,
          question: questionText.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsSuccess(true);
        setQuestionText("");
        setTimeout(() => {
          setIsSuccess(false);
          setIsFormOpen(false);
        }, 3000);
      } else {
        setErrorMsg(data.error || "Soru gönderilirken bir hata oluştu.");
      }
    } catch (err) {
      setErrorMsg("Sunucuya bağlanılamadı.");
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} | ${hours}:${minutes}`;
  };

  const maskName = (name: string) => {
    return name.split(" ").map(p => p.charAt(0) + "*".repeat(p.length > 1 ? 3 : 2)).join(" ");
  };

  const filteredQuestions = questions
    .filter(q => q.question.toLowerCase().includes(searchQuery.toLowerCase()) || (q.answer && q.answer.toLowerCase().includes(searchQuery.toLowerCase())))
    .sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); // oldest
    });

  if (loading) return <div className="py-8 text-center text-sm text-gray-500">Sorular yükleniyor...</div>;

  return (
    <div className="mt-4">
      {/* BAŞLIK */}
      <h2 className="text-xl font-extrabold text-pink-500 mb-6">
        Soru ve Cevap ({questions.length})
      </h2>

      {/* ARAÇ ÇUBUĞU (Toolbar) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Soru ve cevaplarda ara" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:border-pink-500"
            />
          </div>
          <button className="bg-slate-800 text-white font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-slate-700 transition-colors">
            Ara
          </button>

          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-pink-500 text-gray-600 font-medium"
          >
            <option value="newest">Sıralama (En Yeni)</option>
            <option value="oldest">Sıralama (En Eski)</option>
          </select>
        </div>

        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-pink-500 text-white font-bold px-8 py-2.5 rounded-lg text-sm hover:bg-pink-600 transition-colors uppercase tracking-wide"
        >
          {isFormOpen ? "Kapat" : "Soru Sor"}
        </button>
      </div>

      {/* SORU SORMA FORMU */}
      {isFormOpen && (
        <div className="mb-8 bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Satıcıya Soru Sor</h3>
              <p className="text-sm text-slate-500">Ürün hakkında merak ettiklerinizi sorabilirsiniz. Eczacılarımız en kısa sürede yanıtlayacaktır.</p>
            </div>
            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
          </div>

          {isSuccess ? (
            <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 text-center animate-in fade-in zoom-in duration-300">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-600" />
              <h4 className="font-bold mb-1">Sorunuz Alındı!</h4>
              <p className="text-sm">Sorunuz uzman eczacılarımıza iletildi. En kısa sürede yanıtlanacaktır.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-100 text-sm font-medium">
                  {errorMsg}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Adınız Soyadınız *</label>
                  <input type="text" required value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white" />
                  
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="w-4 h-4 text-pink-500 rounded border-gray-300 focus:ring-pink-500" />
                    <span className="text-xs text-slate-600 font-medium">İsmim gizli kalsın (Örn: A*** Y*** şeklinde görünür)</span>
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">E-posta Adresiniz (Cevap bildirimleri için)</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Sorunuz *</label>
                <textarea rows={3} required value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="Ürün detayları, kullanımı vb. hakkında sorunuzu yazın..." className="w-full p-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white" />
              </div>
              
              <div className="flex justify-end pt-2">
                <button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-8 py-3 rounded-lg text-sm flex items-center gap-2 transition-colors">
                  <Send size={16} /> Soruyu Gönder
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* SORULAR LİSTESİ */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12 rounded-xl bg-slate-50 border border-dashed border-slate-200">
            <HelpCircle size={36} className="mx-auto text-slate-300 mb-2" />
            <h3 className="text-sm font-semibold text-slate-600">Bu ürünle ilgili henüz bir soru sorulmamış veya aradığınız kriterde soru bulunamadı.</h3>
          </div>
        ) : (
          filteredQuestions.map((q) => (
            <div key={q.id} className="border border-gray-200 rounded-xl overflow-hidden flex flex-col md:flex-row">
              
              {/* Soru İçeriği */}
              <div className="p-6 flex-1 bg-white">
                <h4 className="text-[15px] font-bold text-slate-800 mb-2">{q.question}</h4>
                <div className="text-xs text-gray-500 font-medium mb-4">
                  {maskName(q.user_name)} <span className="mx-1">|</span> {formatDate(q.created_at)}
                </div>
                
                {q.answer && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Satıcı Cevabı</h5>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      {q.answer}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Beğenme Butonları (Sağ Taraf) */}
              <div className="bg-gray-50 border-l border-gray-100 flex md:flex-col items-center justify-center gap-6 p-6 min-w-[120px]">
                <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-emerald-500 transition-colors">
                  <ThumbsUp size={22} />
                  <span className="text-xs font-bold">0</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-red-500 transition-colors">
                  <ThumbsDown size={22} />
                  <span className="text-xs font-bold">0</span>
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
