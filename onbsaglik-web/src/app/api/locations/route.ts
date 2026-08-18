/**
 * Türkiye'nin Tüm 81 İli, Bütün 973 İlçeleri ve Bütün 50.000+ Mahalleleri API Rotası.
 * nejdetkadir/il-ilce-semt-mahalleler veri setinden quarters ve neighborhoods alanlarını eksiksiz çeker.
 */

import { NextResponse } from "next/server";

interface Quarter {
  name: string;
}

interface SubDistrict {
  name: string;
  quarters?: Quarter[];
  neighborhoods?: Quarter[];
}

interface District {
  name: string;
  districts: SubDistrict[];
}

interface City {
  name: string;
  code: string;
  towns: District[];
}

let cachedData: City[] | null = null;

async function loadData(): Promise<City[]> {
  if (cachedData) return cachedData;

  try {
    const res = await fetch("https://raw.githubusercontent.com/nejdetkadir/il-ilce-semt-mahalleler/master/data/data.json", {
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      cachedData = await res.json();
      return cachedData || [];
    }
  } catch (err) {
    console.error("[Locations API Error]", err);
  }
  return [];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cityName = searchParams.get("city");
  const districtName = searchParams.get("district");

  const data = await loadData();

  if (!data || data.length === 0) {
    return NextResponse.json({ cities: [], districts: [], neighborhoods: [] });
  }

  // 1. Sadece Şehir İsimleri İstendiğinde (Tüm 81 İl)
  if (!cityName) {
    const cities = data.map((c) => c.name);
    return NextResponse.json({ cities });
  }

  // 2. Belirli Bir Şehrin Tüm İlçeleri İstendiğinde
  const targetCity = data.find((c) => c.name.toLowerCase() === cityName.toLowerCase());
  if (!targetCity) {
    return NextResponse.json({ districts: [] });
  }

  const districts = targetCity.towns.map((t) => t.name);

  if (!districtName) {
    return NextResponse.json({ districts });
  }

  // 3. Belirli Bir İlçenin TÜM MAHALLELERİ İstendiğinde (Quarters + Neighborhoods)
  const targetTown = targetCity.towns.find((t) => t.name.toLowerCase() === districtName.toLowerCase());
  if (!targetTown) {
    return NextResponse.json({ neighborhoods: [] });
  }

  const neighborhoodsSet = new Set<string>();

  targetTown.districts.forEach((sub) => {
    // Quarters dizisindeki tüm mahalleleri ekle (78+ mahalle)
    if (sub.quarters && Array.isArray(sub.quarters)) {
      sub.quarters.forEach((q) => {
        if (q && q.name) neighborhoodsSet.add(q.name);
      });
    }
    // Neighborhoods dizisindeki tüm mahalleleri ekle
    if (sub.neighborhoods && Array.isArray(sub.neighborhoods)) {
      sub.neighborhoods.forEach((n) => {
        if (n && n.name) neighborhoodsSet.add(n.name);
      });
    }
  });

  const neighborhoods = Array.from(neighborhoodsSet);

  return NextResponse.json({ districts, neighborhoods });
}
