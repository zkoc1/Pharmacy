/**
 * Ödeme & Teslimat Sayfası — /odeme (Görsel 3, 4, 5 Birebir)
 * Adres Adımı (İl/İlçe/Mahalle Dropdown), Kargo Seçimi, Kredi Kartı/PayTR/Havale ve Sipariş Özeti.
 */

"use client";

import React, { useState, useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useAddressStore } from "@/stores/addressStore";
import { useSession } from "next-auth/react";
import { formatPrice } from "@/lib/products";
import { CreditCard, CheckCircle2, ShieldCheck, Truck, MapPin, ChevronRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// TÜRKİYE İLLERİ, İLÇELERİ VE MAHALLELERİ DATASETİ (Görsel 4 Birebir)
const TURKEY_CITIES: Record<string, Record<string, string[]>> = {
  Kayseri: {
    Kocasinan: ["SAHABİYE MAH", "SALUR MAH", "SANAYİ MAH", "SANCAKTEPE MAH", "SARAY BOSNA MAH", "SARAYCIK MAH", "ŞEKER MAH", "SEYRANİ MAH", "SÜMER MAH", "TALATPAŞA MAH", "TAŞHAN MAH", "TURGUT REİS MAH", "UĞUREVLER MAH", "VATAN MAH", "YAKUT MAH", "YAVUZ SELİM MAH", "YAVUZLAR MAH", "YAZIR MAH", "YEMLİHA MAH", "YENİ MAH"],
    Melikgazi: ["ALPASLAN MAH", "BAHÇELİEVLER MAH", "GÜLTEPE MAH", "HÜRRIYET MAH", "KÖŞK MAH", "MUMCU MAH", "YILDIRIM BEYAZIT MAH"],
    Talas: ["BAHÇELİEVLER MAH", "HARMAN MAH", "MEVLANA MAH", "YENİDOĞAN MAH"],
  },
  İstanbul: {
    Kadıköy: ["CAFERAĞA MAH", "CADDEBOSTAN MAH", "FENERBAHÇE MAH", "MODA MAH", "SUADİYE MAH"],
    Beşiktaş: ["BEBEK MAH", "ETİLER MAH", "LEVENT MAH", "ORTAKÖY MAH"],
    Şişli: ["BOMONTİ MAH", "TEŞVİKİYE MAH", "FULYA MAH", "MECİDİYEKÖY MAH"],
  },
  Ankara: {
    Çankaya: ["BAHÇELİEVLER MAH", "GOP MAH", "KIZILAY MAH", "TUZLUÇAYIR MAH"],
    Yenimahalle: ["BATIKENT MAH", "DEMETEVLER MAH", "ŞENTEPE MAH"],
  },
  İzmir: {
    Konak: ["ALSANCAK MAH", "GÖZTEPE MAH", "GÜZELYALI MAH", "KARATAŞ MAH"],
    Karşıyaka: ["BOSTANLI MAH", "MAVİŞEHİR MAH", "YALI MAH"],
  },
  Bursa: {
    Nilüfer: ["ALTINŞEHİR MAH", "BEŞEVLER MAH", "ÖZLÜCE MAH"],
    Osmangazi: ["ALTIPARMAK MAH", "ÇEKİRGE MAH", "DOĞANBEY MAH"],
  },
  Antalya: {
    Muratpaşa: ["FENER MAH", "LARA MAH", "ŞİRİNYALI MAH"],
    Konyaaltı: ["ARAPSUYU MAH", "GÜRSU MAH", "LİMAN MAH"],
  },
};

export default function OdemeSayfasi() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { getDefaultAddress } = useAddressStore();
  const { data: session } = useSession();

  // Adım State: 1 = ADRES BİLGİLERİ, 2 = ÖDEME BİLGİLERİ (Görsel 3-5 Birebir)
  const [activeStep, setActiveStep] = useState<1 | 2>(1);

  // Adres Formu State (Görsel 3-4 Birebir)
  const [addressForm, setAddressForm] = useState({
    invoiceType: "Bireysel Adres",
    title: "Evim",
    fullName: "",
    tcNo: "",
    country: "Türkiye",
    city: "Kayseri",
    district: "Kocasinan",
    neighborhood: "YENİ MAH",
    fullAddress: "",
    phone: "",
    differentInvoice: false,
  });

  // Kargo Seçenekleri (Görsel 5 Birebir)
  const [selectedCarrier, setSelectedCarrier] = useState("Kolay Gelsin");

  const carriers = [
    { name: "Kolay Gelsin", price: 0, label: "BEDAVA" },
    { name: "HepsiJet", price: 0, label: "BEDAVA" },
    { name: "PTT Kargo", price: 0, label: "BEDAVA" },
    { name: "DHL Kargo", price: 149.90, label: "149,90 TL" },
    { name: "Sürat Kargo", price: 129.90, label: "129,90 TL" },
    { name: "Aras Kargo", price: 149.90, label: "149,90 TL" },
    { name: "Yurtiçi Kargo", price: 149.90, label: "149,90 TL" },
  ];

  // Ödeme Seçeneği Tab (Görsel 5 Birebir)
  const [paymentMethod, setPaymentMethod] = useState<"cc" | "eft" | "paytr">("cc");

  // Kart Formu
  const [cardForm, setCardForm] = useState({ cardName: "", cardNumber: "", expireDate: "", cvc: "" });
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Kupon İndirimi
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const total = getTotalPrice();
  const carrierObj = carriers.find((c) => c.name === selectedCarrier);
  const shippingCost = carrierObj ? carrierObj.price : 0;
  const grandTotal = Math.max(0, total + shippingCost - discount);

  useEffect(() => {
    const defaultAddr = getDefaultAddress();
    if (defaultAddr) {
      setAddressForm((p) => ({
        ...p,
        title: defaultAddr.title || p.title,
        fullName: defaultAddr.fullName || session?.user?.name || "Zehra Koç",
        phone: defaultAddr.phone || "+90 (553) 272-38-58",
        city: defaultAddr.city || "Kayseri",
        district: defaultAddr.district || "Kocasinan",
        fullAddress: defaultAddr.fullAddress || "",
      }));
    } else if (session?.user) {
      setAddressForm((p) => ({
        ...p,
        fullName: session.user?.name || p.fullName,
      }));
    }
  }, [session, getDefaultAddress]);

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.fullName || !addressForm.fullAddress) {
      alert("Lütfen Ad Soyad ve Açık Adres alanlarını doldurun.");
      return;
    }
    setActiveStep(2); // Ödeme Bilgileri Adımına Geç
  };

  const handleCompleteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      alert("Lütfen Mesafeli Satış Sözleşmesini onaylayın.");
      return;
    }

    clearCart();
    const orderNum = `ONB-${Date.now()}`;
    window.location.href = `/odeme/basarili?orderId=${orderNum}`;
  };

  const cityList = Object.keys(TURKEY_CITIES);
  const districtList = TURKEY_CITIES[addressForm.city] ? Object.keys(TURKEY_CITIES[addressForm.city]) : ["Merkez"];
  const neighborhoodList = TURKEY_CITIES[addressForm.city]?.[addressForm.district] || ["YENİ MAH", "MERKEZ MAH"];

  if (items.length === 0) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Sepetiniz Boş</h1>
        <Link href="/urunler" className="btn-primary">Alışverişe Devam Et</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        
        {/* Üst Adım Çubuğu (Görsel 3, 4, 5 Birebir: 1 ADRES BİLGİLERİ | 2 ÖDEME BİLGİLERİ) */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveStep(1)}
            className={`flex-1 py-3.5 px-6 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 border-2 transition-all ${
              activeStep === 1
                ? "bg-white border-rose-500 text-rose-500 shadow-sm"
                : "bg-gray-100 border-transparent text-gray-400"
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs">1</span>
            ADRES BİLGİLERİ
          </button>

          <button
            onClick={() => setActiveStep(2)}
            className={`flex-1 py-3.5 px-6 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 border-2 transition-all ${
              activeStep === 2
                ? "bg-white border-rose-500 text-rose-500 shadow-sm"
                : "bg-gray-100 border-transparent text-gray-400"
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs">2</span>
            ÖDEME BİLGİLERİ
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sol Ana Alan (Adım 1 veya Adım 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* ADIM 1: ADRES BİLGİLERİ (Görsel 3-4 Birebir) */}
            {activeStep === 1 && (
              <form onSubmit={handleSaveAddress} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                    <MapPin className="text-rose-500" /> YENİ ADRES EKLE
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Fatura Türü */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Fatura Türü</label>
                    <select
                      value={addressForm.invoiceType}
                      onChange={(e) => setAddressForm({ ...addressForm, invoiceType: e.target.value })}
                      className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-semibold"
                    >
                      <option value="Bireysel Adres">Bireysel Adres</option>
                      <option value="Kurumsal Adres">Kurumsal Adres</option>
                    </select>
                  </div>

                  {/* Adres Başlığı */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Adres Başlığı</label>
                    <input
                      type="text"
                      value={addressForm.title}
                      onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
                      placeholder="Evim, İş Vb."
                      className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-semibold"
                    />
                  </div>

                  {/* Ad Soyad */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Ad Soyad *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                      placeholder="Zehra Koç"
                      className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-semibold"
                    />
                  </div>

                  {/* T.C. Kimlik No */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">T.C. Kimlik No</label>
                    <input
                      type="text"
                      maxLength={11}
                      value={addressForm.tcNo}
                      onChange={(e) => setAddressForm({ ...addressForm, tcNo: e.target.value })}
                      placeholder="XXXXXXXXXXX"
                      className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-semibold"
                    />
                  </div>

                  {/* Ülke Seçiniz */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Ülke Seçiniz *</label>
                    <select value={addressForm.country} disabled className="w-full p-3 bg-gray-100 border rounded-xl text-xs font-semibold text-gray-500">
                      <option value="Türkiye">Türkiye</option>
                    </select>
                  </div>

                  {/* İl Seçiniz Dropdown (Görsel 4 Birebir Tüm Konumlar) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">İl Seçiniz *</label>
                    <select
                      value={addressForm.city}
                      onChange={(e) => {
                        const newCity = e.target.value;
                        const firstDist = TURKEY_CITIES[newCity] ? Object.keys(TURKEY_CITIES[newCity])[0] : "Merkez";
                        const firstNeigh = TURKEY_CITIES[newCity]?.[firstDist]?.[0] || "YENİ MAH";
                        setAddressForm({ ...addressForm, city: newCity, district: firstDist, neighborhood: firstNeigh });
                      }}
                      className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-semibold"
                    >
                      {cityList.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* İlçe Seçiniz Dropdown (Görsel 4 Birebir) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">İlçe Seçiniz *</label>
                    <select
                      value={addressForm.district}
                      onChange={(e) => {
                        const newDist = e.target.value;
                        const firstNeigh = TURKEY_CITIES[addressForm.city]?.[newDist]?.[0] || "YENİ MAH";
                        setAddressForm({ ...addressForm, district: newDist, neighborhood: firstNeigh });
                      }}
                      className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-semibold"
                    >
                      {districtList.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Semt / Mahalle Dropdown (Görsel 4 Birebir) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Semt / Mahalle *</label>
                    <select
                      value={addressForm.neighborhood}
                      onChange={(e) => setAddressForm({ ...addressForm, neighborhood: e.target.value })}
                      className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-semibold"
                    >
                      {neighborhoodList.map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>

                  {/* Açık Adres */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Açık Adres *</label>
                    <textarea
                      required
                      rows={3}
                      value={addressForm.fullAddress}
                      onChange={(e) => setAddressForm({ ...addressForm, fullAddress: e.target.value })}
                      placeholder="Mahalle, Cadde, Sokak, Bina No / Daire No..."
                      className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-semibold"
                    />
                  </div>

                  {/* Cep Telefonu */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Cep Telefonu *</label>
                    <div className="flex items-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-xs font-bold text-gray-700">🇹🇷 +90</span>
                      <input
                        type="tel"
                        required
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        placeholder="(553) 272-38-58"
                        className="w-full p-3 bg-gray-50 border rounded-r-xl text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={addressForm.differentInvoice}
                    onChange={(e) => setAddressForm({ ...addressForm, differentInvoice: e.target.checked })}
                    className="rounded text-rose-500"
                  />
                  <span className="text-xs text-gray-600 font-semibold">Faturamın farklı bir adrese düzenlenmesini istiyorum</span>
                </label>

                <button
                  type="submit"
                  className="w-full bg-rose-400 hover:bg-rose-500 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-md transition-all text-xs uppercase tracking-wider"
                >
                  ADRESİ KAYDET VE ÖDEMEYE GEÇ
                </button>
              </form>
            )}

            {/* ADIM 2: ÖDEME BİLGİLERİ (Görsel 5 Birebir) */}
            {activeStep === 2 && (
              <div className="space-y-6">
                
                {/* KARGO SEÇENEKLERİ (Görsel 5 Birebir) */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-4">
                  <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b pb-3">
                    <Truck className="text-emerald-600" /> KARGO SEÇENEKLERİ
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {carriers.map((car) => (
                      <label
                        key={car.name}
                        onClick={() => setSelectedCarrier(car.name)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                          selectedCarrier === car.name
                            ? "border-rose-400 bg-rose-50/30 font-bold"
                            : "border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input type="radio" name="carrier" checked={selectedCarrier === car.name} readOnly className="text-rose-500" />
                          <span className="text-xs font-bold text-gray-800">{car.name}</span>
                        </div>
                        <span className={`text-xs font-extrabold ${car.price === 0 ? "text-rose-500" : "text-gray-700"}`}>
                          {car.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* ÖDEME SEÇENEKLERİ (Görsel 5 Birebir) */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
                  <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b pb-3">
                    <CreditCard className="text-emerald-600" /> ÖDEME SEÇENEKLERİ
                  </h3>

                  {/* Ödeme Sekmeleri: Kredi Kartı | Havale / EFT | PayTR ile Öde */}
                  <div className="flex gap-2 border-b pb-3">
                    <button
                      onClick={() => setPaymentMethod("cc")}
                      className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                        paymentMethod === "cc" ? "bg-rose-400 text-white" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      Kredi Kartı
                    </button>
                    <button
                      onClick={() => setPaymentMethod("eft")}
                      className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                        paymentMethod === "eft" ? "bg-rose-400 text-white" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      Havale / EFT
                    </button>
                    <button
                      onClick={() => setPaymentMethod("paytr")}
                      className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                        paymentMethod === "paytr" ? "bg-rose-400 text-white" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      PayTR ile Öde
                    </button>
                  </div>

                  {paymentMethod === "cc" && (
                    <form onSubmit={handleCompleteOrder} className="space-y-4">
                      <h4 className="text-xs font-extrabold text-gray-900 uppercase">Kart Bilgileri</h4>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Kart Üzerindeki Ad Soyad *</label>
                        <input
                          type="text"
                          required
                          value={cardForm.cardName}
                          onChange={(e) => setCardForm({ ...cardForm, cardName: e.target.value })}
                          placeholder="Kart Üzerindeki Ad Soyad"
                          className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Kart Numarası *</label>
                        <input
                          type="text"
                          required
                          maxLength={19}
                          value={cardForm.cardNumber}
                          onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                          placeholder="0000 0000 0000 0000"
                          className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-semibold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Son Kullanma Tarihi *</label>
                          <input
                            type="text"
                            required
                            placeholder="AA/YY"
                            value={cardForm.expireDate}
                            onChange={(e) => setCardForm({ ...cardForm, expireDate: e.target.value })}
                            className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">CVC / CVC2 *</label>
                          <input
                            type="text"
                            required
                            maxLength={4}
                            placeholder="123"
                            value={cardForm.cvc}
                            onChange={(e) => setCardForm({ ...cardForm, cvc: e.target.value })}
                            className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-semibold"
                          />
                        </div>
                      </div>
                    </form>
                  )}

                  {paymentMethod === "eft" && (
                    <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-2 text-xs">
                      <p className="font-extrabold text-emerald-900">Ziraat Bankası IBAN Bilgimiz:</p>
                      <p className="font-mono text-emerald-800 font-bold bg-white p-2 rounded-lg border">TR62 0001 0090 1012 3456 7850 01</p>
                      <p className="text-emerald-700">Alıcı Adı: OnbSağlık İnternet Mağazacılık San. Tic. A.Ş.</p>
                    </div>
                  )}

                  {paymentMethod === "paytr" && (
                    <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl text-xs text-blue-900 font-bold">
                      🔒 PayTR 256-bit SSL Güvenli İframe Ödeme Ortamı Yüklenecektir.
                    </div>
                  )}

                </div>
              </div>
            )}

          </div>

          {/* Sağ Kolon: Sipariş Özeti (Görsel 3, 4, 5 Birebir) */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4 sticky top-24">
              
              <h3 className="font-extrabold text-sm text-gray-900 uppercase border-b pb-3 flex justify-between items-center">
                Sipariş Özet <ChevronRight size={16} />
              </h3>

              {/* Ürün Mini Listesi */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center gap-3 text-xs border-b pb-2">
                    <div className="relative w-12 h-12 flex-shrink-0 bg-gray-50 rounded-lg p-1 border">
                      <Image src={product.images?.[0] || "/placeholder.png"} alt={product.name} fill className="object-contain" unoptimized />
                    </div>
                    <div className="flex-grow min-w-0">
                      <span className="font-bold text-gray-400 block uppercase truncate">{product.brand}</span>
                      <p className="font-bold text-gray-800 truncate">{product.name}</p>
                      <span className="text-gray-500 font-semibold">{quantity} Adet</span>
                    </div>
                    <span className="font-extrabold text-rose-500">{formatPrice(product.price * quantity)}</span>
                  </div>
                ))}
              </div>

              {/* İndirim Kodu Kutu */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="İndirim Kodu"
                  className="flex-1 p-2.5 border rounded-xl text-xs bg-gray-50 uppercase font-bold"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (couponCode.toUpperCase() === "ONB100") setDiscount(100);
                  }}
                  className="bg-gray-400 hover:bg-gray-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs"
                >
                  Uygula
                </button>
              </div>

              {/* Fiyat Detayları */}
              <div className="space-y-2 text-xs border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold">Sepet Toplamı</span>
                  <span className="font-extrabold text-gray-900">{formatPrice(total)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold">Kargo Ücreti</span>
                  <span className="font-extrabold text-rose-500">{shippingCost === 0 ? "BEDAVA" : formatPrice(shippingCost)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Kupon İndirimi</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-extrabold border-t pt-2 text-rose-500">
                  <span>Genel Toplam</span>
                  <span className="text-lg">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Sözleşme Onay Kutus (Görsel 5 Birebir) */}
              <label className="flex items-start gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded text-rose-500"
                />
                <span className="text-[11px] text-gray-600 leading-tight">
                  <strong className="underline">Ön Bilgilendirme Formunu</strong> ve <strong className="underline">Mesafeli Satış Sözleşmesini</strong> okudum, onaylıyorum.
                </span>
              </label>

              {/* SİPARİŞİ TAMAMLA Butonu (Görsel 5 Birebir) */}
              <button
                type="button"
                onClick={handleCompleteOrder}
                className="w-full bg-rose-400 hover:bg-rose-500 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-md transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                SİPARİŞİ TAMAMLA
              </button>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
