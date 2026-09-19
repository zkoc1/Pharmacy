"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, MapPin, CheckCircle } from "lucide-react";

interface Address {
  id: string;
  title: string;
  full_name: string;
  phone: string;
  city: string;
  district: string;
  address_line: string;
  is_default: boolean;
}

export default function AdreslerimPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    full_name: "",
    phone: "",
    city: "",
    district: "",
    address_line: "",
    is_default: false,
  });

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/user/addresses");
      const data = await res.json();
      if (res.ok) setAddresses(data.addresses || []);
    } catch (error) {
      console.error("Adresler yüklenemedi", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editId ? `/api/user/addresses/${editId}` : "/api/user/addresses";
      const method = editId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsFormOpen(false);
        setEditId(null);
        setFormData({ title: "", full_name: "", phone: "", city: "", district: "", address_line: "", is_default: false });
        fetchAddresses();
      } else {
        alert("Adres kaydedilemedi.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Adresi silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
      if (res.ok) fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMakeDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_default: true }),
      });
      if (res.ok) fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-gray-500 text-sm">Adresleriniz yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Adreslerim</h1>
          <p className="text-sm text-gray-500">Teslimat ve fatura adreslerinizi buradan yönetebilirsiniz.</p>
        </div>
        <button
          onClick={() => {
            setEditId(null);
            setFormData({ title: "", full_name: "", phone: "", city: "", district: "", address_line: "", is_default: false });
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
        >
          <Plus size={18} /> Yeni Adres Ekle
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold mb-4">{editId ? "Adresi Düzenle" : "Yeni Adres Ekle"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Adres Başlığı (Ev, İş vb.)</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Ad Soyad</label>
                <input required type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Telefon</label>
                <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">İl</label>
                  <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">İlçe</label>
                  <input required type="text" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Açık Adres</label>
              <textarea required rows={3} value={formData.address_line} onChange={e => setFormData({...formData, address_line: e.target.value})} className="w-full p-2.5 border rounded-lg text-sm"></textarea>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.is_default} onChange={e => setFormData({...formData, is_default: e.target.checked})} className="rounded text-emerald-600 focus:ring-emerald-500" />
              <span className="text-sm text-gray-700">Varsayılan adresim yap</span>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">İptal</button>
              <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">Kaydet</button>
            </div>
          </form>
        </div>
      )}

      {addresses.length === 0 && !isFormOpen ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
          <MapPin size={48} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">Kayıtlı Adresiniz Yok</h3>
          <p className="text-sm text-gray-500 mt-1">Siparişlerinizi daha hızlı vermek için hemen bir adres ekleyin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div key={address.id} className={`p-5 rounded-xl border relative transition-colors ${address.is_default ? "border-emerald-500 bg-emerald-50/30" : "border-gray-200 bg-white hover:border-gray-300"}`}>
              {address.is_default && (
                <span className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle size={12} /> Varsayılan
                </span>
              )}
              <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                <MapPin size={18} className={address.is_default ? "text-emerald-600" : "text-gray-400"} />
                {address.title}
              </h3>
              <div className="text-sm text-gray-600 space-y-1 mb-4">
                <p className="font-medium text-gray-900">{address.full_name} • {address.phone}</p>
                <p>{address.address_line}</p>
                <p>{address.district} / {address.city}</p>
              </div>
              <div className="flex items-center gap-3 border-t pt-3">
                <button 
                  onClick={() => {
                    setEditId(address.id);
                    setFormData({ ...address });
                    setIsFormOpen(true);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }} 
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <Edit2 size={14} /> Düzenle
                </button>
                <button onClick={() => handleDelete(address.id)} className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1">
                  <Trash2 size={14} /> Sil
                </button>
                {!address.is_default && (
                  <button onClick={() => handleMakeDefault(address.id)} className="text-xs font-semibold text-gray-500 hover:text-emerald-600 ml-auto flex items-center gap-1">
                    Varsayılan Yap
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

