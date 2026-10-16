'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonBg: string;
  buttonTextCol: string;
  href: string;
  productAlt: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    image: '/banners/banner-sac-bakimi-bioxcin.png',
    title: 'Saç Dökülmesine Karşı Etkili Destek',
    subtitle: 'Yoğun bakım. Güçlü formül. Sağlıklı saçlar için profesyonel destek.',
    buttonText: 'İNCELEYİN',
    buttonBg: 'bg-black hover:bg-neutral-800 text-white',
    buttonTextCol: 'text-white',
    href: '/kategori/sac-bakimi',
    productAlt: 'Bioxcin Forte Saç Dökülmesine Karşı Şampuan',
  },
  {
    id: 2,
    image: '/banners/banner-nutraxin-d3k2.png',
    title: "D3 ve K2'nin Güçlü Uyumu",
    subtitle: "Vitamin D3 ve K2'nin sinerjik etkisiyle formüle edilen Nutraxin D3K2, aktif yaşamı desteklemek için tasarlandı.",
    buttonText: 'İNCELEYİN',
    buttonBg: 'bg-white hover:bg-neutral-100 text-neutral-900',
    buttonTextCol: 'text-neutral-900',
    href: '/kategori/vitamin-ve-takviye',
    productAlt: 'Nutraxin Vitamin D3 K2 Takviyesi',
  },
  {
    id: 3,
    image: '/banners/banner-cocuk-vitamin.png',
    title: 'Çocuklar İçin Günlük Vitamin Desteği',
    subtitle: 'Çocuklara özel formül. Güvenilir destek. Mutlu ve enerjik günler için.',
    buttonText: 'İNCELEYİN',
    buttonBg: 'bg-black hover:bg-neutral-800 text-white',
    buttonTextCol: 'text-white',
    href: '/kategori/anne-bebek',
    productAlt: 'Pharmaton Kiddi Growth Çocuk Vitamini',
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5500);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl mx-2 sm:mx-4 my-2 sm:my-4 shadow-xl group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{ height: 'clamp(360px, 42vw, 540px)' }}
    >
      {/* Slaytlar */}
      {SLIDES.map((slide, index) => {
        const isActive = index === current;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Arka Plan Banner Görseli */}
            <Image
              src={slide.image}
              alt={slide.productAlt}
              fill
              priority={index === 0}
              className="object-cover object-right md:object-center"
              sizes="(max-width: 768px) 100vw, (max-width: 1400px) 95vw, 1400px"
            />

            {/* Metin Okunabilirliği İçin Yumuşak Sol Gölge */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent sm:via-black/25 sm:to-transparent" />

            {/* Metin & Buton Alanı */}
            <div className="relative z-20 h-full flex flex-col justify-center px-6 sm:px-12 lg:px-20 max-w-xl lg:max-w-2xl text-white">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight sm:leading-tight drop-shadow-md">
                {slide.title}
              </h1>

              <p className="mt-3 sm:mt-4 text-xs sm:text-base lg:text-lg text-white/90 font-normal leading-relaxed drop-shadow-sm max-w-lg">
                {slide.subtitle}
              </p>

              <div className="mt-6 sm:mt-8">
                <Link
                  href={slide.href}
                  className={`inline-flex items-center justify-center px-7 sm:px-9 py-3 sm:py-3.5 rounded-sm font-bold text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 ${slide.buttonBg}`}
                >
                  {slide.buttonText}
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      {/* Sol / Sağ Ok Butonları */}
      <button
        onClick={prevSlide}
        aria-label="Önceki Slayt"
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-xs flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Sonraki Slayt"
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-xs flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Alt Gösterge Noktaları (Pagination Dots) */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            aria-label={`Slayt ${idx + 1}`}
            className={`transition-all duration-300 rounded-full h-2 cursor-pointer ${
              idx === current ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
