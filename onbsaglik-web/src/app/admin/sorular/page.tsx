"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Check, X, Search, Trash2, Send } from "lucide-react";

interface DbQuestion {
  id: string;
  product_id: number;
  user_email: string;
  user_name: string;
  question: string;
  answer: string | null;
  is_approved: boolean;
  created_at: string;
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<DbQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [answerInputs, setAnswerInputs] = useState<Record<string, string>>({});
  const [answeringId, setAnsweringId] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/questions");
      const data = await res.json();
      if (data.questions) setQuestions(data.questions);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_approved: !currentStatus }),
      });
      if (res.ok) {
        setQuestions(questions.map((q) => (q.id === id ? { ...q, is_approved: !currentStatus } : q)));
      }
    } catch (err) {
      alert("Hata oluştu.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu soruyu tamamen silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setQuestions(questions.filter((q) => q.id !== id));
      }
    } catch (err) {
      alert("Hata oluştu.");
    }
  };

  const handleAnswerSubmit = async (id: string) => {
    const answer = answerInputs[id];
    if (!answer || answer.trim() === "") return;

    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: answer.trim(), is_approved: true }), // Cevaplanan soru otomatik onaylansın
      });
      
      if (res.ok) {
        setQuestions(questions.map((q) => (q.id === id ? { ...q, answer: answer.trim(), is_approved: true } : q)));
        setAnsweringId(null);
      } else {
        alert("Cevap kaydedilemedi.");
      }
    } catch (err) {
      alert("Hata oluştu.");
    }
  };

  const filtered = questions.filter(
    (q) =>
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.user_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Soru ve Cevap Yönetimi</h1>
          <p className="text-sm text-gray-500 mt-1">Müşterilerden gelen ürün sorularını yanıtlayın ve yönetin.</p>
        </div>
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Soru veya müşteri ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Sorular yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <MessageCircle size={48} className="text-gray-200 mb-4" />
            <p>Herhangi bir soru bulunamadı.</p>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-semibold">Müşteri</th>
                  <th className="p-4 font-semibold">Soru & Cevap</th>
                  <th className="p-4 font-semibold">Durum</th>
                  <th className="p-4 font-semibold text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 align-top">
                      <div className="font-semibold text-gray-900">{q.user_name}</div>
                      <div className="text-xs text-gray-500">{q.user_email}</div>
                      <div className="text-[10px] text-gray-400 mt-1">
                        {new Date(q.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </td>
                    <td className="p-4 max-w-md align-top">
                      <div className="font-medium text-gray-900 mb-2">{q.question}</div>
                      
                      {q.answer ? (
                        <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg text-sm border border-emerald-100">
                          <span className="font-bold text-xs uppercase block mb-1">Satıcı Cevabı:</span>
                          {q.answer}
                        </div>
                      ) : answeringId === q.id ? (
                        <div className="mt-2 flex flex-col gap-2">
                          <textarea 
                            rows={3}
                            placeholder="Cevabınızı buraya yazın..."
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                            value={answerInputs[q.id] || ""}
                            onChange={(e) => setAnswerInputs({ ...answerInputs, [q.id]: e.target.value })}
                          />
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => setAnsweringId(null)} className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700">İptal</button>
                            <button onClick={() => handleAnswerSubmit(q.id)} className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 flex items-center gap-1"><Send size={14} /> Yanıtla</button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setAnsweringId(q.id)}
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                        >
                          <MessageCircle size={14} /> Cevap Yaz
                        </button>
                      )}
                    </td>
                    <td className="p-4 align-top">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          q.is_approved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {q.is_approved ? "Yayında" : "Onay Bekliyor"}
                      </span>
                    </td>
                    <td className="p-4 align-top text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleApproval(q.id, q.is_approved)}
                          title={q.is_approved ? "Yayından Kaldır" : "Onayla ve Yayınla"}
                          className={`p-1.5 rounded-lg border ${
                            q.is_approved
                              ? "text-amber-600 border-amber-200 hover:bg-amber-50"
                              : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                          } transition-colors`}
                        >
                          {q.is_approved ? <X size={18} /> : <Check size={18} />}
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          title="Sil"
                          className="p-1.5 rounded-lg border text-red-600 border-red-200 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
