/**
 * Ã–deme & Teslimat SayfasÄ± â€” /odeme
 * KullanÄ±cÄ±ya Ã–zel KayÄ±tlÄ± Adres & Kart SeÃ§imi (userEmail Scoped),
 * Form ValidasyonlarÄ±, ÃœrÃ¼n Slug DesteÄŸi, PayTR 3D Secure, Mail Order & Havale/EFT.
 */

"use client";

import React, { useState, useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useAddressStore, Address } from "@/stores/addressStore";
import { useCardStore, SavedCard } from "@/stores/cardStore";
import { useOrderStore } from "@/stores/orderStore";
import { useCampaignStore } from "@/stores/campaignStore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/products";
import { calculateMultiBuyDiscount, applyCouponDiscount, calculateShipping, calculateEftDiscount, PRICING_RULES } from "@/lib/pricing";
import {
  CreditCard,
  Truck,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Plus,
  AlertCircle,
  Building,
  Home,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ALL_81_PROVINCES } from "@/lib/turkeyLocations";
import { isUserLoggedIn } from "@/lib/authUtils";

export default function OdemeSayfasi() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { addresses, addAddress, getUserAddresses } = useAddressStore();
  const { cards, addCard, getUserCards } = useCardStore();
  const { addOrder } = useOrderStore();
  const { data: session, status } = useSession();

  const currentUserEmail = session?.user?.email || "";

  // Oturum Guard: KullanÄ±cÄ± giriÅŸ yapmamÄ±ÅŸsa doÄŸrudan giriÅŸ sayfasÄ±na yÃ¶nlendir
  useEffect(() => {
    if (status !== "loading" && !isUserLoggedIn(session?.user)) {
      router.replace("/hesabim/giris?callbackUrl=/odeme");
    }
  }, [session, status, router]);

  const { getActiveCampaigns } = useCampaignStore();
  const activeCampaigns = getActiveCampaigns();

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        useCartStore.getState().syncCartPrices(data, activeCampaigns);
      })
      .catch(console.error);
  }, [activeCampaigns]);

  // AdÄ±m State: 1 = ADRES BÄ°LGÄ°LERÄ°, 2 = Ã–DEME BÄ°LGÄ°LERÄ°
  const [activeStep, setActiveStep] = useState<1 | 2>(1);

  // KullanÄ±cÄ±ya Ã–zel Adresler ve Kartlar
  const userAddresses = getUserAddresses(currentUserEmail);
  const userCards = getUserCards(currentUserEmail);

  // KayÄ±tlÄ± Adres & Yeni Adres Modu
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [fetchedProfile, setFetchedProfile] = useState<any>(null);

  // Dinamik Konum State'leri
  const [cities, setCities] = useState<string[]>(ALL_81_PROVINCES);
  const [districts, setDistricts] = useState<string[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);

  // Adres Formu State (SeÃ§ili Gelmez â€” Temiz BaÅŸlar)
  const [addressForm, setAddressForm] = useState({
    invoiceType: "Bireysel Adres",
    title: "Ev",
    fullName: "",
    tcNo: "",
    country: "TÃ¼rkiye",
    city: "",
    district: "",
    neighborhood: "",
    fullAddress: "",
    phone: "",
    differentInvoice: false,
  });

  // Kargo SeÃ§enekleri
  const [selectedCarrier, setSelectedCarrier] = useState("Kolay Gelsin");

  const carriers = [
    { name: "Kolay Gelsin", price: 0, label: "BEDAVA" },
    { name: "HepsiJet", price: 0, label: "BEDAVA" },
    { name: "PTT Kargo", price: 0, label: "BEDAVA" },
    { name: "DHL Kargo", price: 149.9, label: "149,90 TL" },
    { name: "SÃ¼rat Kargo", price: 129.9, label: "129,90 TL" },
    { name: "Aras Kargo", price: 149.9, label: "149,90 TL" },
    { name: "YurtiÃ§i Kargo", price: 149.9, label: "149,90 TL" },
  ];

  // Ã–deme SeÃ§eneÄŸi Tab (Kredi KartÄ± | Havale / EFT | PayTR ile Ã–de)
  const [paymentMethod, setPaymentMethod] = useState<"cc" | "eft" | "paytr">("cc");

  // KayÄ±tlÄ± Kartlar & Yeni Kart State
  const [selectedCardId, setSelectedCardId] = useState<string | "new">("new");
  const [saveCardCheckbox, setSaveCardCheckbox] = useState(true);
  const [cardForm, setCardForm] = useState({
    cardName: "",
    cardNumber: "",
    expireMonth: "",
    expireYear: "",
    cvc: "",
  });
  const [cardError, setCardError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [mailOrderConsent, setMailOrderConsent] = useState(true);

  // Dinamik Ayarlar (Kargo Limiti vs)
  const [checkoutSettings, setCheckoutSettings] = useState({
    freeShippingThreshold: 3000,
    shippingCost: 49.90
  });

  // Kupon Ä°ndirimi
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const total = getTotalPrice();
  const multiBuyDiscount = calculateMultiBuyDiscount(items, total);
  
  const carrierObj = carriers.find((c) => c.name === selectedCarrier);
  const defaultShippingCost = carrierObj ? carrierObj.price : 0;
  
  // Dinamik kargo hesaplama
  const subTotalForShipping = total - multiBuyDiscount - discount;
  const calculatedShippingCost = subTotalForShipping > checkoutSettings.freeShippingThreshold ? 0 : checkoutSettings.shippingCost;
  const shippingCost = defaultShippingCost > 0 ? calculatedShippingCost : 0;
  
  let tempGrandTotal = Math.max(0, total - multiBuyDiscount - discount + shippingCost);
  const eftDiscount = paymentMethod === "eft" ? calculateEftDiscount(tempGrandTotal) : 0;
  const grandTotal = Math.max(0, tempGrandTotal - eftDiscount);

  // 1. API'den Åehir Ä°simlerini Ã‡ek ve Kargo AyarlarÄ±nÄ± Al
  useEffect(() => {
    fetch("/api/locations")
      .then((r) => r.json())
      .then((data) => {
        if (data.cities && data.cities.length > 0) setCities(data.cities);
      })
      .catch(() => {});

    fetch("/api/checkout/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data) setCheckoutSettings(data);
      })
      .catch(() => {});
  }, []);

  // 2. SeÃ§ilen Åehrin TÃ¼m Ä°lÃ§elerini Ã‡ek
  useEffect(() => {
    if (!addressForm.city) {
      setDistricts([]);
      setNeighborhoods([]);
      return;
    }
    fetch(`/api/locations?city=${encodeURIComponent(addressForm.city)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.districts && data.districts.length > 0) {
          setDistricts(data.districts);
        } else {
          setDistricts([]);
        }
      });
  }, [addressForm.city]);

  // 3. SeÃ§ilen Ä°lÃ§enin TÃ¼m Mahallelerini Ã‡ek
  useEffect(() => {
    if (!addressForm.city || !addressForm.district) {
      setNeighborhoods([]);
      return;
    }
    fetch(
      `/api/locations?city=${encodeURIComponent(addressForm.city)}&district=${encodeURIComponent(
        addressForm.district
      )}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.neighborhoods && data.neighborhoods.length > 0) {
          setNeighborhoods(data.neighborhoods);
        } else {
          setNeighborhoods(["MERKEZ MAH", "CUMHURÄ°YET MAH", "YENÄ° MAH"]);
        }
      });
  }, [addressForm.city, addressForm.district]);

  // KullanÄ±cÄ±nÄ±n Mevcut KayÄ±tlÄ± Adreslerini YÃ¼kle ve KullanÄ±cÄ± Profilini Ã‡ek
  useEffect(() => {
    // 1. Profil verisini Ã§ek (Her durumda)
    if (status === "authenticated") {
      fetch("/api/auth/update-profile")
        .then(res => res.json())
        .then(data => {
          if (data.success && data.metadata) {
            const prof = {
              fullName: (data.metadata.first_name ? `${data.metadata.first_name} ${data.metadata.last_name}` : session?.user?.name) || "",
              phone: data.metadata.phone || "",
              tcNo: data.metadata.tc_no || "",
              fullAddress: data.metadata.address || ""
            };
            setFetchedProfile(prof);
            
            // EÄŸer kayÄ±tlÄ± adres yoksa hemen forma uygula
            if (userAddresses.length === 0) {
              setAddressForm(p => ({ ...p, ...prof }));
            }
          }
        })
        .catch(() => {});
    }

    // 2. KayÄ±tlÄ± adresleri forma bas
    if (userAddresses.length > 0) {
      const def = userAddresses.find((a) => a.isDefault) || userAddresses[0];
      setSelectedAddressId(def.id);
      setIsAddingNewAddress(false);
      setAddressForm({
        invoiceType: "Bireysel Adres",
        title: def.title || "Ev",
        fullName: def.fullName || session?.user?.name || "",
        tcNo: "",
        country: "TÃ¼rkiye",
        city: def.city || "",
        district: def.district || "",
        neighborhood: def.neighborhood || "",
        fullAddress: def.fullAddress || "",
        phone: def.phone || "",
        differentInvoice: false,
      });
    } else {
      setIsAddingNewAddress(true);
      if (session?.user?.name && !fetchedProfile) {
        setAddressForm((p) => ({ ...p, fullName: session.user?.name || "" }));
      }
    }
  }, [addresses, session, status, currentUserEmail, userAddresses.length]);

  // KayÄ±tlÄ± KartlarÄ± YÃ¼kle
  useEffect(() => {
    if (userCards.length > 0) {
      const defCard = userCards.find((c) => c.isDefault) || userCards[0];
      setSelectedCardId(defCard.id);
    } else {
      setSelectedCardId("new");
    }
  }, [cards, currentUserEmail]);

  // Adres SeÃ§imi DeÄŸiÅŸtirildiÄŸinde Formu GÃ¼ncelle
  const handleSelectSavedAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setAddressForm((prev) => ({
      ...prev,
      title: addr.title,
      fullName: addr.fullName,
      phone: addr.phone,
      city: addr.city,
      district: addr.district,
      neighborhood: addr.neighborhood || "",
      fullAddress: addr.fullAddress,
    }));
    setAddressError("");
  };

  // 1. AdÄ±m Adres Kaydetme & DoÄŸrulama
  const handleSaveAndProceedAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError("");

    // KayÄ±tlÄ± Adres SeÃ§ildiyse
    if (!isAddingNewAddress && selectedAddressId) {
      const chosen = userAddresses.find((a) => a.id === selectedAddressId);
      if (chosen) {
        setActiveStep(2);
        return;
      }
    }

    // Yeni Adres GiriÅŸi ValidasyonlarÄ±
    if (!addressForm.fullName.trim()) {
      setAddressError("LÃ¼tfen Ad Soyad alanÄ±nÄ± doldurunuz.");
      return;
    }
    if (!addressForm.phone.trim() || addressForm.phone.replace(/\D/g, "").length < 10) {
      setAddressError("LÃ¼tfen 10 haneli geÃ§erli bir Cep Telefonu giriniz (Ã¶rn: 5XX XXX XX XX).");
      return;
    }
    if (!addressForm.city) {
      setAddressError("LÃ¼tfen bir Ä°l seÃ§iniz.");
      return;
    }
    if (!addressForm.district) {
      setAddressError("LÃ¼tfen bir Ä°lÃ§e seÃ§iniz.");
      return;
    }
    if (!addressForm.neighborhood) {
      setAddressError("LÃ¼tfen bir Mahalle/Semt seÃ§iniz.");
      return;
    }
    if (!addressForm.fullAddress.trim() || addressForm.fullAddress.trim().length < 8) {
      setAddressError("LÃ¼tfen AÃ§Ä±k Adres (Cadde, Sokak, No, Daire) alanÄ±nÄ± eksiksiz doldurunuz.");
      return;
    }

    // Adresi KullanÄ±cÄ±ya Ã–zel Olarak Sisteme Kaydet
    const saved = addAddress({
      userEmail: currentUserEmail,
      title: addressForm.title || "Evim",
      fullName: addressForm.fullName,
      phone: addressForm.phone,
      city: addressForm.city,
      district: addressForm.district,
      neighborhood: addressForm.neighborhood,
      fullAddress: addressForm.fullAddress,
      isDefault: true,
    });

    setSelectedAddressId(saved.id);
    setIsAddingNewAddress(false);
    setActiveStep(2);
  };

  // 2. AdÄ±m SipariÅŸi Tamamlama
  const handleCompleteOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCardError("");

    if (!termsAccepted) {
      alert("LÃ¼tfen Ã–n Bilgilendirme ve Mesafeli SatÄ±ÅŸ SÃ¶zleÅŸmesini onaylayÄ±nÄ±z.");
      return;
    }

    // Kredi KartÄ± Validasyonu
    if (paymentMethod === "cc") {
      if (selectedCardId === "new") {
        const cleanCardNum = cardForm.cardNumber.replace(/\s+/g, "");
        if (!cardForm.cardName.trim()) {
          setCardError("LÃ¼tfen kart Ã¼zerindeki Ad Soyad bilgisini giriniz.");
          return;
        }
        if (cleanCardNum.length < 15 || isNaN(Number(cleanCardNum))) {
          setCardError("LÃ¼tfen 16 haneli geÃ§erli bir kart numarasÄ± giriniz.");
          return;
        }
        if (!cardForm.expireMonth || !cardForm.expireYear) {
          setCardError("LÃ¼tfen kartÄ±nÄ±zÄ±n son kullanma ay ve yÄ±lÄ±nÄ± seÃ§iniz.");
          return;
        }
        if (cardForm.cvc.trim().length < 3 || isNaN(Number(cardForm.cvc))) {
          setCardError("LÃ¼tfen 3 haneli CVC gÃ¼venlik kodunu giriniz.");
          return;
        }

        // KartÄ± KullanÄ±cÄ±ya Ã–zel GÃ¼venle Kaydet
        if (saveCardCheckbox) {
          const type = cleanCardNum.startsWith("4")
            ? "Visa"
            : cleanCardNum.startsWith("5")
            ? "Mastercard"
            : cleanCardNum.startsWith("9")
            ? "Troy"
            : "Diğer";

          addCard({
            userEmail: currentUserEmail,
            cardName: cardForm.cardName,
            cardNumberMasked: `${cleanCardNum.slice(0, 4)} **** **** ${cleanCardNum.slice(-4)}`,
            cardLast4: cleanCardNum.slice(-4),
            expireMonth: cardForm.expireMonth,
            expireYear: cardForm.expireYear,
            cardType: type,
            isDefault: userCards.length === 0,
          });
        }
      } else {
        // KayÄ±tlÄ± Kart ile Ã–deme â€” CVC KontrolÃ¼
        if (cardForm.cvc.trim().length < 3 || isNaN(Number(cardForm.cvc))) {
          setCardError("LÃ¼tfen seÃ§ili kartÄ±nÄ±zÄ±n 3 haneli CVC gÃ¼venlik kodunu giriniz.");
          return;
        }
      }

      if (!mailOrderConsent) {
        setCardError("LÃ¼tfen Mail Order / Kart Tahsilat OnayÄ±nÄ± iÅŸaretleyiniz.");
        return;
      }
    }

    // SÄ°PARÄ°ÅÄ° MERKEZÄ° SÄ°PARÄ°Å STORE'UNA KAYDET (SLUG DAHÄ°L)
    const userSession = JSON.parse(localStorage.getItem("user_session") || "{}");
    const orderStatus =
      paymentMethod === "cc"
        ? "Mail Order Bekliyor"
        : paymentMethod === "paytr"
        ? "PayTR Ã–deme Bekliyor"
        : "Ã–deme Bekliyor";

    const newOrderId = await addOrder({
      items: items.map((i) => ({
        id: i.product.id,
        slug: i.product.slug,
        name: i.product.name,
        brand: i.product.brand,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.images?.[0] || "/placeholder.png",
      })),
      total: grandTotal,
      carrier: selectedCarrier,
      customerEmail: currentUserEmail || userSession.email || "musteri@onbsaglik.com.tr",
      customerName: addressForm.fullName || userSession.name || "DeÄŸerli MÃ¼ÅŸterimiz",
      customerPhone: addressForm.phone || "",
      paymentMethod:
        paymentMethod === "cc"
          ? "Kredi KartÄ± / Mail Order"
          : paymentMethod === "eft"
          ? "Havale / EFT"
          : "PayTR 3D Secure",
      deliveryAddress: `${addressForm.city} / ${addressForm.district} / ${addressForm.neighborhood} - ${addressForm.fullAddress}`,
      billingAddress: `Fatura TÃ¼rÃ¼: ${addressForm.invoiceType} | T.C. Kimlik No: ${addressForm.tcNo || "Girilmedi"} | ${addressForm.city} / ${addressForm.district} / ${addressForm.neighborhood} - ${addressForm.fullAddress}`,
      status: orderStatus,
      couponCode: discount > 0 ? couponCode.trim() : "",
    });

    clearCart();

    if (paymentMethod === "paytr") {
      try {
        const response = await fetch("/api/checkout/paytr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: newOrderId,
            total: grandTotal,
            items: items.map(i => ({ name: i.product.name, price: i.product.price, quantity: i.quantity })),
            customerInfo: { email: currentUserEmail, fullName: addressForm.fullName, phone: addressForm.phone, address: addressForm.fullAddress }
          })
        });
        const data = await response.json();
        if (data.success && data.iframeUrl) {
          window.location.href = data.iframeUrl; // Redirect to PayTR
          return;
        } else {
          alert("PayTR token alÄ±namadÄ±, lÃ¼tfen tekrar deneyin.");
          return;
        }
      } catch (err) {
        alert("Ã–deme baÅŸlatÄ±lamadÄ±.");
        return;
      }
    }

    window.location.href = `/odeme/basarili?orderId=${newOrderId}`;
  };

  const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  const years = ["2026", "2027", "2028", "2029", "2030", "2031", "2032", "2033", "2034", "2035"];

  if (items.length === 0) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Sepetiniz BoÅŸ</h1>
        <p className="text-gray-500 mb-6">Ã–deme yapmak iÃ§in sepetinize Ã¼rÃ¼n ekleyiniz.</p>
        <Link href="/urunler" className="btn-primary">
          AlÄ±ÅŸveriÅŸe Devam Et
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Ãœst AdÄ±m Ã‡ubuÄŸu */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveStep(1)}
            className={`flex-1 py-3.5 px-6 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
              activeStep === 1
                ? "bg-white border-rose-500 text-rose-500 shadow-sm"
                : "bg-gray-100 border-transparent text-gray-400"
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs">
              1
            </span>
            ADRES BÄ°LGÄ°LERÄ°
          </button>

          <button
            onClick={() => {
              if (addressForm.fullName && addressForm.city && addressForm.district) {
                setActiveStep(2);
              } else if (userAddresses.length > 0) {
                setActiveStep(2);
              } else {
                setAddressError("LÃ¼tfen Ã¶nce teslimat adresi bilgilerinizi tamamlayÄ±nÄ±z.");
              }
            }}
            className={`flex-1 py-3.5 px-6 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
              activeStep === 2
                ? "bg-white border-rose-500 text-rose-500 shadow-sm"
                : "bg-gray-100 border-transparent text-gray-400"
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs">
              2
            </span>
            Ã–DEME BÄ°LGÄ°LERÄ°
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Ana Alan */}
          <div className="lg:col-span-2 space-y-6">
            {/* ADIM 1: ADRES BÄ°LGÄ°LERÄ° */}
            {activeStep === 1 && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
                {/* Hata UyarÄ±sÄ± */}
                {addressError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 font-bold text-xs">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <span>âš ï¸ {addressError}</span>
                  </div>
                )}

                {/* 1. SEÃ‡ENEK: KAYITLI ADRESLER LÄ°STESÄ° */}
                {userAddresses.length > 0 && !isAddingNewAddress ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                          <MapPin className="text-rose-500" /> KAYITLI TESLÄ°MAT ADRESLERÄ°M
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">
                          LÃ¼tfen sipariÅŸinizin teslim edileceÄŸi adresi seÃ§iniz.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNewAddress(true);
                          setAddressForm({
                            invoiceType: "Bireysel Adres",
                            title: "Ev",
                            fullName: fetchedProfile?.fullName || session?.user?.name || "",
                            tcNo: fetchedProfile?.tcNo || "",
                            country: "TÃ¼rkiye",
                            city: "",
                            district: "",
                            neighborhood: "",
                            fullAddress: fetchedProfile?.fullAddress || "",
                            phone: fetchedProfile?.phone || "",
                            differentInvoice: false,
                          });
                          setAddressError("");
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        <Plus size={14} /> + Yeni Adres Ekle
                      </button>
                    </div>

                    {/* Adres KartlarÄ± Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {userAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => handleSelectSavedAddress(addr)}
                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                              isSelected
                                ? "border-rose-400 bg-rose-50/20 shadow-sm"
                                : "border-gray-100 hover:border-gray-200 bg-gray-50/50"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="flex items-center gap-1.5 text-xs font-extrabold text-gray-800">
                                  {addr.title.toLowerCase().includes("iÅŸ") ? (
                                    <Building size={14} className="text-gray-500" />
                                  ) : (
                                    <Home size={14} className="text-gray-500" />
                                  )}
                                  {addr.title}
                                </span>

                                <div
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                    isSelected
                                      ? "border-rose-500 bg-rose-500 text-white"
                                      : "border-gray-300 bg-white"
                                  }`}
                                >
                                  {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                </div>
                              </div>

                              <p className="text-xs font-bold text-gray-900">{addr.fullName}</p>
                              <p className="text-[11px] text-gray-500 font-medium">{addr.phone}</p>
                              <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                                {addr.neighborhood ? `${addr.neighborhood}, ` : ""}
                                {addr.fullAddress}
                              </p>
                            </div>

                            <div className="mt-3 pt-2 border-t border-gray-100/80 text-[11px] font-bold text-gray-400">
                              {addr.district} / {addr.city}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Ä°lerle Butonu */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedAddressId) {
                          setAddressError("LÃ¼tfen teslimat iÃ§in bir adres seÃ§iniz.");
                          return;
                        }
                        setActiveStep(2);
                      }}
                      className="w-full bg-rose-400 hover:bg-rose-500 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-md transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer mt-4"
                    >
                      SEÃ‡Ä°LEN ADRES Ä°LE Ã–DEMEYE GEÃ‡ &gt;
                    </button>
                  </div>
                ) : (
                  /* 2. SEÃ‡ENEK: YENÄ° ADRES FORMU */
                  <form onSubmit={handleSaveAndProceedAddress} className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                          <MapPin className="text-rose-500" /> YENÄ° ADRES BÄ°LGÄ°LERÄ°
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">
                          LÃ¼tfen aÅŸaÄŸÄ±daki alanlarÄ± eksiksiz doldurunuz.
                        </p>
                      </div>

                      {userAddresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNewAddress(false);
                            setAddressError("");
                          }}
                          className="text-xs font-bold text-gray-600 hover:text-gray-900 underline cursor-pointer"
                        >
                          â† KayÄ±tlÄ± Adreslerime DÃ¶n
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Fatura TÃ¼rÃ¼ */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Fatura TÃ¼rÃ¼
                        </label>
                        <select
                          value={addressForm.invoiceType}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, invoiceType: e.target.value })
                          }
                          className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-semibold"
                        >
                          <option value="Bireysel Adres">Bireysel Adres</option>
                          <option value="Kurumsal Adres">Kurumsal Adres</option>
                        </select>
                      </div>

                      {/* Adres BaÅŸlÄ±ÄŸÄ± */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Adres BaÅŸlÄ±ÄŸÄ± *
                        </label>
                        <input
                          type="text"
                          required
                          value={addressForm.title}
                          onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
                          placeholder="Evim, Ä°ÅŸ Yeri vb."
                          className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-semibold"
                        />
                      </div>

                      {/* Ad Soyad */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Ad Soyad *
                        </label>
                        <input
                          type="text"
                          required
                          value={addressForm.fullName}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[0-9]/g, '');
                            setAddressForm({ ...addressForm, fullName: val });
                          }}
                          placeholder="Ad Soyad"
                          className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-semibold"
                        />
                      </div>

                      {/* Cep Telefonu */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Cep Telefonu *
                        </label>
                        <div className="flex items-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-xs font-bold text-gray-700">
                            ğŸ‡¹ğŸ‡· +90
                          </span>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={addressForm.phone}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              setAddressForm({ ...addressForm, phone: val });
                            }}
                            placeholder="553 272 38 58"
                            className="w-full p-3 bg-gray-50 border rounded-r-xl text-xs font-semibold"
                          />
                        </div>
                      </div>

                      {/* T.C. Kimlik No */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          T.C. Kimlik No (Opsiyonel)
                        </label>
                        <input
                          type="text"
                          maxLength={11}
                          value={addressForm.tcNo}
                          onChange={(e) => setAddressForm({ ...addressForm, tcNo: e.target.value })}
                          placeholder="11 Haneli T.C. No"
                          className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-semibold"
                        />
                      </div>

                      {/* Ãœlke */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Ãœlke</label>
                        <select
                          value={addressForm.country}
                          disabled
                          className="w-full p-3 bg-gray-100 border rounded-xl text-xs font-semibold text-gray-500"
                        >
                          <option value="TÃ¼rkiye">TÃ¼rkiye</option>
                        </select>
                      </div>

                      {/* Ä°L SEÃ‡Ä°NÄ°Z (SeÃ§ili Gelmez) */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Ä°l SeÃ§iniz *
                        </label>
                        <select
                          value={addressForm.city}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              city: e.target.value,
                              district: "",
                              neighborhood: "",
                            })
                          }
                          className={`w-full p-3 border rounded-xl text-xs font-semibold ${
                            !addressForm.city ? "bg-white text-gray-400 border-amber-300" : "bg-gray-50 text-gray-900"
                          }`}
                        >
                          <option value="">-- Ä°l SeÃ§iniz --</option>
                          {cities.map((c) => (
                            <option key={c} value={c} className="text-gray-900">
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Ä°LÃ‡E SEÃ‡Ä°NÄ°Z (SeÃ§ili Gelmez) */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Ä°lÃ§e SeÃ§iniz *
                        </label>
                        <select
                          value={addressForm.district}
                          disabled={!addressForm.city}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              district: e.target.value,
                              neighborhood: "",
                            })
                          }
                          className={`w-full p-3 border rounded-xl text-xs font-semibold ${
                            !addressForm.city
                              ? "bg-gray-100 text-gray-400"
                              : !addressForm.district
                              ? "bg-white text-gray-400 border-amber-300"
                              : "bg-gray-50 text-gray-900"
                          }`}
                        >
                          <option value="">
                            {!addressForm.city ? "-- Ã–nce Ä°l SeÃ§iniz --" : "-- Ä°lÃ§e SeÃ§iniz --"}
                          </option>
                          {districts.map((d) => (
                            <option key={d} value={d} className="text-gray-900">
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* MAHALLE SEÃ‡Ä°NÄ°Z (SeÃ§ili Gelmez) */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Semt / Mahalle SeÃ§iniz *
                        </label>
                        <select
                          value={addressForm.neighborhood}
                          disabled={!addressForm.district}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, neighborhood: e.target.value })
                          }
                          className={`w-full p-3 border rounded-xl text-xs font-semibold ${
                            !addressForm.district
                              ? "bg-gray-100 text-gray-400"
                              : !addressForm.neighborhood
                              ? "bg-white text-gray-400 border-amber-300"
                              : "bg-gray-50 text-gray-900"
                          }`}
                        >
                          <option value="">
                            {!addressForm.district
                              ? "-- Ã–nce Ä°lÃ§e SeÃ§iniz --"
                              : "-- Mahalle SeÃ§iniz --"}
                          </option>
                          {neighborhoods.map((n) => (
                            <option key={n} value={n} className="text-gray-900">
                              {n}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* AÃ§Ä±k Adres */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          AÃ§Ä±k Adres (Cadde, Sokak, No, Daire) *
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={addressForm.fullAddress}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, fullAddress: e.target.value })
                          }
                          placeholder="Cadde, Sokak, Apartman AdÄ±, DÄ±ÅŸ KapÄ± No, Daire No..."
                          className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer pt-2">
                      <input
                        type="checkbox"
                        checked={addressForm.differentInvoice}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, differentInvoice: e.target.checked })
                        }
                        className="rounded text-rose-500"
                      />
                      <span className="text-xs text-gray-600 font-semibold">
                        FaturamÄ±n farklÄ± bir adrese dÃ¼zenlenmesini istiyorum
                      </span>
                    </label>

                    <button
                      type="submit"
                      className="w-full bg-rose-400 hover:bg-rose-500 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-md transition-all text-xs uppercase tracking-wider cursor-pointer"
                    >
                      ADRESÄ° KAYDET VE Ã–DEMEYE GEÃ‡ &gt;
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ADIM 2: Ã–DEME BÄ°LGÄ°LERÄ° */}
            {activeStep === 2 && (
              <div className="space-y-6">
                {/* Geri DÃ¶n Butonu & SeÃ§ili Adres Ã–zeti */}
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="text-xs font-bold text-gray-700 hover:text-emerald-700 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    â† 1. AdÄ±ma DÃ¶n (Adres DeÄŸiÅŸtir)
                  </button>
                  <span className="text-[11px] text-gray-400 font-semibold truncate max-w-xs">
                    ğŸ“ {addressForm.city} / {addressForm.district}
                  </span>
                </div>

                {/* KARGO SEÃ‡ENEKLERÄ° */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-4">
                  <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b pb-3">
                    <Truck className="text-emerald-600" /> KARGO SEÃ‡ENEKLERÄ°
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
                          <input
                            type="radio"
                            name="carrier"
                            checked={selectedCarrier === car.name}
                            readOnly
                            className="text-rose-500"
                          />
                          <span className="text-xs font-bold text-gray-800">{car.name}</span>
                        </div>
                        <span
                          className={`text-xs font-extrabold ${
                            car.price === 0 ? "text-rose-500" : "text-gray-700"
                          }`}
                        >
                          {car.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Ã–DEME SEÃ‡ENEKLERÄ° */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
                  <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b pb-3">
                    <CreditCard className="text-emerald-600" /> Ã–DEME SEÃ‡ENEKLERÄ°
                  </h3>

                  {/* Ã–deme Sekmeleri: Kredi KartÄ± / Mail Order | Havale / EFT | PayTR */}
                  <div className="flex flex-wrap gap-2 border-b pb-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cc")}
                      className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        paymentMethod === "cc" ? "bg-rose-400 text-white" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      Kredi KartÄ± / Mail Order
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("paytr")}
                      className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        paymentMethod === "paytr"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      PayTR 3D Secure
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("eft")}
                      className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        paymentMethod === "eft"
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      Havale / EFT
                    </button>
                  </div>

                  {paymentMethod === "cc" && (
                    <form onSubmit={handleCompleteOrder} className="space-y-5">
                      <div className="flex justify-between items-center border-b pb-2">
                        <h4 className="text-xs font-extrabold text-gray-900 uppercase">
                          Kart Bilgileri
                        </h4>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                          256-Bit SSL GÃ¼venli
                        </span>
                      </div>

                      {cardError && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 font-bold text-xs rounded-xl flex items-center gap-2">
                          <AlertCircle size={16} /> {cardError}
                        </div>
                      )}

                      {/* KAYITLI KARTLAR SEÃ‡Ä°CÄ° */}
                      {userCards.length > 0 && (
                        <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <label className="block text-xs font-extrabold text-gray-700">
                            KayÄ±tlÄ± KartlarÄ±m:
                          </label>

                          <div className="space-y-2">
                            {userCards.map((c) => (
                              <label
                                key={c.id}
                                onClick={() => setSelectedCardId(c.id)}
                                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                  selectedCardId === c.id
                                    ? "bg-white border-rose-400 shadow-sm"
                                    : "bg-white/50 border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    name="savedCard"
                                    checked={selectedCardId === c.id}
                                    readOnly
                                    className="text-rose-500"
                                  />
                                  <div>
                                    <span className="text-xs font-bold text-gray-900 block">
                                      {c.cardNumberMasked}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-semibold">
                                      {c.cardName} | SKT: {c.expireMonth}/{c.expireYear}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-[10px] font-extrabold bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  {c.cardType}
                                </span>
                              </label>
                            ))}

                            <label
                              onClick={() => setSelectedCardId("new")}
                              className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                                selectedCardId === "new"
                                  ? "bg-white border-rose-400 shadow-sm"
                                  : "bg-white/50 border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name="savedCard"
                                checked={selectedCardId === "new"}
                                readOnly
                                className="text-rose-500"
                              />
                              <span className="text-xs font-bold text-gray-800">
                                + FarklÄ± Bir Kart ile Ã–de
                              </span>
                            </label>
                          </div>
                        </div>
                      )}

                      {/* YENÄ° KART FORMU ALANLARI */}
                      {selectedCardId === "new" ? (
                        <div className="space-y-4 pt-1">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                              Kart Ãœzerindeki Ad Soyad *
                            </label>
                            <input
                              type="text"
                              required
                              value={cardForm.cardName}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[0-9]/g, '');
                                setCardForm({ ...cardForm, cardName: val });
                              }}
                              placeholder="Kart Ãœzerindeki Ä°sim"
                              className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-semibold uppercase"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                              Kart NumarasÄ± *
                            </label>
                            <input
                              type="tel"
                              required
                              maxLength={19}
                              value={cardForm.cardNumber}
                              onChange={(e) => {
                                let val = e.target.value.replace(/[^0-9]/g, '');
                                val = val.match(/.{1,4}/g)?.join(' ') || val;
                                setCardForm({ ...cardForm, cardNumber: val });
                              }}
                              placeholder="XXXX XXXX XXXX XXXX"
                              className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-semibold font-mono tracking-wider"
                            />
                          </div>

                          {/* Son Kullanma Tarihi DropdownlarÄ± (Ay & YÄ±l) */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-bold text-gray-700 mb-1">
                                Son Kullanma Tarihi *
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                <select
                                  value={cardForm.expireMonth}
                                  onChange={(e) =>
                                    setCardForm({ ...cardForm, expireMonth: e.target.value })
                                  }
                                  className="p-3 bg-gray-50 border rounded-xl text-xs font-semibold"
                                >
                                  <option value="">Ay SeÃ§iniz</option>
                                  {months.map((m) => (
                                    <option key={m} value={m}>
                                      {m}
                                    </option>
                                  ))}
                                </select>

                                <select
                                  value={cardForm.expireYear}
                                  onChange={(e) =>
                                    setCardForm({ ...cardForm, expireYear: e.target.value })
                                  }
                                  className="p-3 bg-gray-50 border rounded-xl text-xs font-semibold"
                                >
                                  <option value="">YÄ±l SeÃ§iniz</option>
                                  {years.map((y) => (
                                    <option key={y} value={y}>
                                      {y}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1">
                                CVC / CVV *
                              </label>
                              <input
                                type="tel"
                                required
                                maxLength={3}
                                value={cardForm.cvc}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9]/g, '');
                                  setCardForm({ ...cardForm, cvc: val });
                                }}
                                placeholder="CVC"
                                className="w-full p-3 bg-gray-50 border rounded-xl text-xs font-semibold"
                              />
                            </div>
                          </div>

                          {/* KartÄ± Sisteme Kaydet Checkbox */}
                          <label className="flex items-center gap-2 cursor-pointer pt-1">
                            <input
                              type="checkbox"
                              checked={saveCardCheckbox}
                              onChange={(e) => setSaveCardCheckbox(e.target.checked)}
                              className="rounded text-rose-500"
                            />
                            <span className="text-xs text-gray-700 font-bold">
                              Bu kartÄ± sonraki alÄ±ÅŸveriÅŸlerimde kullanmak iÃ§in gÃ¼venle kaydet (PCI-DSS)
                            </span>
                          </label>
                        </div>
                      ) : (
                        /* KayÄ±tlÄ± Kart SeÃ§ildiÄŸinde Sadece CVV Ä°ste */
                        <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3">
                          <p className="text-xs font-bold text-emerald-900">
                            ğŸ”’ SeÃ§ili kartÄ±nÄ±zla gÃ¼venli iÅŸlem yapabilmek iÃ§in lÃ¼tfen arkadaki 3 haneli gÃ¼venlik kodunu (CVC) giriniz:
                          </p>
                          <div className="w-40">
                            <input
                              type="text"
                              required
                              maxLength={4}
                              placeholder="CVC"
                              value={cardForm.cvc}
                              onChange={(e) =>
                                setCardForm({ ...cardForm, cvc: e.target.value })
                              }
                              className="w-full p-3 bg-white border border-emerald-300 rounded-xl text-xs font-bold font-mono text-center tracking-widest"
                            />
                          </div>
                        </div>
                      )}

                      {/* Mail Order Yetkilendirme OnayÄ± */}
                      <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-2xl space-y-2 mt-4">
                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={mailOrderConsent}
                            onChange={(e) => setMailOrderConsent(e.target.checked)}
                            className="mt-0.5 rounded text-amber-600"
                          />
                          <span className="text-[11px] text-amber-900 leading-tight">
                            <strong>Mail Order / Kart Tahsilat OnayÄ±:</strong> Kredi kartÄ±mdan sipariÅŸ tutarÄ± olan <strong>{formatPrice(grandTotal)}</strong> tutarÄ±nÄ±n tahsil edilmesini ve sipariÅŸimin iÅŸleme alÄ±nmasÄ±nÄ± onaylÄ±yorum.
                          </span>
                        </label>
                      </div>
                    </form>
                  )}

                  {paymentMethod === "eft" && (
                    <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-2 text-xs">
                      <p className="font-extrabold text-emerald-900">Banka IBAN Bilgimiz:</p>
                      <p className="font-mono text-emerald-800 font-bold bg-white p-2 rounded-lg border">
                        {PRICING_RULES.COMPANY_IBAN}
                      </p>
                      <p className="text-emerald-700">
                        AlÄ±cÄ± AdÄ±: {PRICING_RULES.COMPANY_NAME}
                      </p>
                      <p className="text-[11px] text-emerald-600 font-medium pt-1">
                        * Havale aÃ§Ä±klamasÄ±na Ad Soyad veya SipariÅŸ NumaranÄ±zÄ± yazmayÄ± unutmayÄ±nÄ±z.
                      </p>
                    </div>
                  )}

                  {paymentMethod === "paytr" && (
                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-3xl space-y-4 text-xs">
                      <div className="flex items-center gap-3 text-blue-900 font-extrabold text-sm border-b border-blue-200 pb-3">
                        <ShieldCheck size={24} className="text-blue-600" /> PayTR 256-Bit SSL GÃ¼venli Sanal POS
                      </div>
                      <p className="text-blue-800 font-semibold">
                        PayTR gÃ¼vencesiyle 3D Secure SMS ÅŸifrenizle anÄ±nda ve gÃ¼venli Ã¶deme yapabilirsiniz.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SaÄŸ Kolon: SipariÅŸ Ã–zeti */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4 sticky top-24">
              <h3 className="font-extrabold text-sm text-gray-900 uppercase border-b pb-3 flex justify-between items-center">
                SipariÅŸ Ã–zeti <ChevronRight size={16} />
              </h3>

              {/* ÃœrÃ¼n Mini Listesi */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center gap-3 text-xs border-b pb-2">
                    <Link href={`/urun/${product.slug}`} className="relative w-12 h-12 flex-shrink-0 bg-gray-50 rounded-lg p-1 border hover:border-emerald-500 transition-colors">
                      <Image
                        src={product.images?.[0] || "/placeholder.png"}
                        alt={product.name}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </Link>
                    <div className="flex-grow min-w-0">
                      <span className="font-bold text-gray-400 block uppercase truncate">
                        {product.brand}
                      </span>
                      <Link href={`/urun/${product.slug}`} className="font-bold text-gray-800 hover:text-emerald-600 truncate block transition-colors">
                        {product.name}
                      </Link>
                      <span className="text-gray-500 font-semibold">{quantity} Adet</span>
                    </div>
                    <span className="font-extrabold text-rose-500">
                      {formatPrice(product.price * quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Ä°ndirim Kodu Kutu */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Ä°ndirim Kodu"
                  className="flex-1 p-2.5 border rounded-xl text-xs bg-gray-50 uppercase font-bold"
                />
                <button
                  type="button"
                  onClick={async () => {
                    const userEmail = session?.user?.email;
                    const isFirstOrder = userEmail ? useOrderStore.getState().getOrdersByEmail(userEmail).length === 0 : true;
                    
                    try {
                      const res = await fetch("/api/checkout/coupon", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          code: couponCode.trim(),
                          cartTotal: total,
                          isFirstOrder
                        })
                      });
                      
                      const data = await res.json();
                      if (data.success) {
                        setDiscount(data.discountAmount);
                      } else {
                        alert(data.error || "Kupon uygulanamadÄ±.");
                        setDiscount(0);
                      }
                    } catch (e: any) {
                      alert("Sunucuyla iletiÅŸim kurulamadÄ±.");
                      setDiscount(0);
                    }
                  }}
                  className="bg-gray-400 hover:bg-gray-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer"
                >
                  Uygula
                </button>
              </div>

              {/* Fiyat DetaylarÄ± */}
              <div className="space-y-2 text-xs border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold">Sepet ToplamÄ±</span>
                  <span className="font-extrabold text-gray-900">{formatPrice(total)}</span>
                </div>

                {multiBuyDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Sepet Ä°ndirimi (%5)</span>
                    <span>-{formatPrice(multiBuyDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold">Kargo Ãœcreti</span>
                  <span className="font-extrabold text-rose-500">
                    {shippingCost === 0 ? "BEDAVA" : formatPrice(shippingCost)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Kupon Ä°ndirimi</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                {eftDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Havale/EFT Ä°ndirimi</span>
                    <span>-{formatPrice(eftDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-extrabold border-t pt-2 text-rose-500">
                  <span>Genel Toplam</span>
                  <span className="text-lg">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* SÃ¶zleÅŸme Onay Kutusu */}
              <label className="flex items-start gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded text-rose-500"
                />
                <span className="text-[11px] text-gray-600 leading-tight">
                  <strong className="underline">Ã–n Bilgilendirme Formunu</strong> ve{" "}
                  <strong className="underline">Mesafeli SatÄ±ÅŸ SÃ¶zleÅŸmesini</strong> okudum, onaylÄ±yorum.
                </span>
              </label>

              {/* SÄ°PARÄ°ÅÄ° TAMAMLA Butonu */}
              <button
                type="button"
                onClick={() => {
                  if (activeStep === 1) {
                    if (selectedAddressId || (addressForm.fullName && addressForm.city && addressForm.district)) {
                      setActiveStep(2);
                    } else {
                      setAddressError("LÃ¼tfen Ã¶nce teslimat adresi bilgilerinizi tamamlayÄ±nÄ±z.");
                    }
                  } else {
                    handleCompleteOrder();
                  }
                }}
                className="w-full bg-rose-400 hover:bg-rose-500 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-md transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                {activeStep === 1 ? "Ã–DEME ADIMINA GEÃ‡ >" : "SÄ°PARÄ°ÅÄ° TAMAMLA"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
