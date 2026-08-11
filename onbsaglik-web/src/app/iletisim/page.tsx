/**
 * İletişim sayfası — /iletisim
 * İletişim formu ve iletişim bilgileri.
 */

"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

// lucide-react'te Instagram ikonu bulunmuyor, SVG olarak tanımlandı
const InstagramIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);
import type { Metadata } from "next";

// Not: 'use client' olan sayfada export const metadata çalışmaz.
// Metadata için parent layout veya ayrı bir metadata.ts dosyası kullanın.

export default function IletisimSayfasi() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Form gönderimi simülasyonu (Faz 2'de e-posta API'sine bağlanacak)
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    setSending(false);
  };

  return (
    <div className="container-custom py-12">
      {/* Başlık */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "12px" }}>
          Bize Ulaşın
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "16px" }}>
          Sorularınız, önerileriniz veya sipariş takibi için bizimle iletişime geçin.
        </p>
      </div>

      <div
        className="grid gap-8"
        style={{ gridTemplateColumns: "1fr 420px" }}
      >
        {/* Form */}
        <div className="card" style={{ padding: "36px" }}>
          {sent ? (
            // Gönderim başarı mesajı
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: "56px", marginBottom: "16px" }}>✅</div>
              <h2 style={{ fontWeight: 700, marginBottom: "8px" }}>Mesajınız İletildi!</h2>
              <p style={{ color: "var(--color-text-muted)" }}>
                En geç 1 iş günü içinde size geri döneceğiz.
              </p>
              <button
                onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                className="btn-outline"
                style={{ marginTop: "24px" }}
              >
                Yeni Mesaj Gönder
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <h2 style={{ fontWeight: 700, fontSize: "20px", marginBottom: "8px" }}>
                Mesaj Gönder
              </h2>

              {/* Ad Soyad + Telefon */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label htmlFor="contact-name" style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                    Ad Soyad *
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Adınız Soyadınız"
                    style={{
                      width: "100%", padding: "10px 14px",
                      border: "2px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "14px", outline: "none",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
                  />
                </div>
                <div>
                  <label htmlFor="contact-phone" style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                    Telefon
                  </label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="0532 XXX XX XX"
                    style={{
                      width: "100%", padding: "10px 14px",
                      border: "2px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "14px", outline: "none",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
                  />
                </div>
              </div>

              {/* E-posta */}
              <div>
                <label htmlFor="contact-email" style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                  E-posta *
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="ornek@email.com"
                  style={{
                    width: "100%", padding: "10px 14px",
                    border: "2px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "14px", outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
                />
              </div>

              {/* Konu seçimi */}
              <div>
                <label htmlFor="contact-subject" style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                  Konu *
                </label>
                <select
                  id="contact-subject"
                  name="subject"
                  required
                  value={form.subject}
                  onChange={handleChange}
                  style={{
                    width: "100%", padding: "10px 14px",
                    border: "2px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "14px", outline: "none",
                    background: "white", cursor: "pointer",
                  }}
                >
                  <option value="">Konu seçin...</option>
                  <option value="siparis">Sipariş Takibi</option>
                  <option value="iade">İade / Değişim</option>
                  <option value="urun">Ürün Hakkında</option>
                  <option value="teknik">Teknik Destek</option>
                  <option value="diger">Diğer</option>
                </select>
              </div>

              {/* Mesaj */}
              <div>
                <label htmlFor="contact-message" style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                  Mesajınız *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Mesajınızı buraya yazın..."
                  rows={5}
                  style={{
                    width: "100%", padding: "10px 14px",
                    border: "2px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "14px", outline: "none",
                    resize: "vertical", fontFamily: "inherit",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="btn-primary"
                style={{ alignSelf: "flex-start", opacity: sending ? 0.7 : 1 }}
              >
                <Send size={16} />
                {sending ? "Gönderiliyor..." : "Mesaj Gönder"}
              </button>
            </form>
          )}
        </div>

        {/* İletişim bilgileri */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Bilgi kartları */}
          {[
            {
              icon: <Mail size={22} />,
              title: "E-posta",
              value: "destek@onbsaglik.com",
              sub: "1 iş günü içinde yanıt",
              href: "mailto:destek@onbsaglik.com",
            },
            {
              icon: <Phone size={22} />,
              title: "Telefon",
              value: "0850 XXX XX XX",
              sub: "Hafta içi 09:00 – 18:00",
              href: "tel:+908500000000",
            },
            {
              icon: <InstagramIcon size={22} />,
              title: "Instagram",
              value: "@onbsaglik",
              sub: "DM ile de ulaşabilirsiniz",
              href: "https://www.instagram.com/onbsaglik",
            },
          ].map((item) => (
            <a
              key={item.title}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="card"
              style={{
                padding: "24px",
                display: "flex",
                alignItems: "flex-start",
                gap: "16px",
                textDecoration: "none",
                color: "inherit",
                transition: "var(--transition)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--gradient-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "2px" }}>
                  {item.title}
                </p>
                <p style={{ fontWeight: 700, fontSize: "15px", marginBottom: "2px" }}>
                  {item.value}
                </p>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                  {item.sub}
                </p>
              </div>
            </a>
          ))}

          {/* SSS kutusu */}
          <div
            className="card"
            style={{
              padding: "24px",
              background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
              border: "2px solid var(--color-primary-light)",
            }}
          >
            <h3 style={{ fontWeight: 700, marginBottom: "12px", fontSize: "15px" }}>
              ❓ Sık Sorulan Sorular
            </h3>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                "Kargo ne zaman teslim edilir?",
                "İade nasıl yapılır?",
                "Ürünler orijinal mi?",
                "Toplu sipariş indirimi var mı?",
              ].map((q) => (
                <li key={q}>
                  <a
                    href="#"
                    style={{
                      fontSize: "13px",
                      color: "var(--color-primary)",
                      textDecoration: "none",
                    }}
                  >
                    → {q}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
