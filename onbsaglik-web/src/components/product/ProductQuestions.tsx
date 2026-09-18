"use client";

import { useState, useEffect } from "react";
import { MessageCircle, User, CheckCircle2, Send, HelpCircle } from "lucide-react";

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
  const [questions, setQuestions] = useState<DbQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState("");
  const [email, setEmail] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch(`/api/questions?productId=${productId}`)
      .then(res => res.json())
      .then(data => {
        if (data.questions) setQuestions(data.questions);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!authorName.trim() || !questionText.trim()) {
      setErrorMsg("Lütfen adınızı ve sorunuzu giriniz.");
      return;
    }

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          user_email: email.trim(),
          user_name: authorName.trim(),
          question: questionText.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsSuccess(true);
        setAuthorName("");
        setEmail("");
        setQuestionText("");
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        setErrorMsg(data.error || "Soru gönderilirken bir hata oluştu.");
      }
    } catch (err) {
      setErrorMsg("Sunucuya bağlanılamadı.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  if (loading) return <div className="py-8 text-center text-sm text-gray-500">Sorular yükleniyor...</div>;

  return (
    <div className="mt-6 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Satıcıya Soru Sor</h2>
        <p className="text-sm text-slate-500">Ürün hakkında merak ettiklerinizi sorabilirsiniz. Eczacılarımız en kısa sürede yanıtlayacaktır.</p>
      </div>

      <div className="mb-10 bg-slate-50 border border-slate-200 rounded-2xl p-6">
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
                <input type="text" required value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">E-posta Adresiniz (Cevap bildirimleri için)</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Sorunuz *</label>
              <textarea rows={3} required value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="Ürün detayları, kullanımı vb. hakkında sorunuzu yazın..." className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500" />
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-colors">
                <Send size={15} /> Soruyu Gönder
              </button>
            </div>
          </form>
        )}
      </div>

      <div>
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <MessageCircle size={18} className="text-pink-500" /> Önceki Sorular ve Cevaplar
        </h3>
        
        {questions.length === 0 ? (
          <div className="text-center py-8 rounded-xl bg-slate-50 border border-dashed border-slate-200">
            <HelpCircle size={36} className="mx-auto text-slate-300 mb-2" />
            <h3 className="text-sm font-semibold text-slate-600">Henüz soru sorulmamış.</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0 mt-1">
                    {q.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-800">{q.user_name}</span>
                      <span className="text-[10px] text-slate-400">{formatDate(q.created_at)}</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed mb-3">{q.question}</p>
                    
                    {q.answer && (
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 ml-4 relative">
                        <div className="absolute -left-2 top-4 w-4 h-4 bg-slate-50 border-l border-b border-slate-100 transform rotate-45"></div>
                        <div className="flex items-center justify-between mb-1 relative z-10">
                          <span className="font-bold text-xs text-pink-600 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Eczacı Cevabı (OnbSağlık)
                          </span>
                          {q.answered_at && <span className="text-[10px] text-slate-400">{formatDate(q.answered_at)}</span>}
                        </div>
                        <p className="text-sm text-slate-800 relative z-10">{q.answer}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
