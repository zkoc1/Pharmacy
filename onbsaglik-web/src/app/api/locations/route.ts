/**
 * Türkiye'nin Tüm 81 İli, Bütün İlçeleri ve Bütün Mahalleleri API Rotası.
 * nejdetkadir/il-ilce-semt-mahalleler açık veri setinden tam listeyi sunar.
 */

import { NextResponse } from "next/server";

interface Neighborhood {
  name: string;
}

interface SubDistrict {
  name: string;
  neighborhoods: Neighborhood[];
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cityName = searchParams.get("city");
  const districtName = searchParams.get("district");

  try {
    if (!cachedData) {
      const res = await fetch("https://raw.githubusercontent.com/nejdetkadir/il-ilce-semt-mahalleler/master/data/data.json", {
        next: { revalidate: 86400 }, // 24 saat önbellek
      });
      if (res.ok) {
        cachedData = await res.json();
      }
    }

    if (!cachedData) {
      return NextResponse.json({ cities: [], districts: [], neighborhoods: [] });
    }

    // 1. Sadece Şehir İsimleri İstendiğinde
    if (!cityName) {
      const cities = cachedData.map((c) => c.name);
      return NextResponse.json({ cities });
    }

    // 2. Belirli Bir Şehrin Tüm İlçeleri İstendiğinde
    const targetCity = cachedData.find((c) => c.name.toLowerCase() === cityName.toLowerCase());
    if (!targetCity) {
      return NextResponse.json({ districts: [] });
    }

    const districts = targetCity.towns.map((t) => t.name);

    if (!districtName) {
      return NextResponse.json({ districts });
    }

    // 3. Belirli Bir İlçenin Tüm Mahalleleri İstendiğinde
    const targetTown = targetCity.towns.find((t) => t.name.toLowerCase() === districtName.toLowerCase());
    if (!targetTown) {
      return NextResponse.json({ neighborhoods: [] });
    }

    const neighborhoods: string[] = [];
    targetTown.districts.forEach((sub) => {
      if (sub.neighborhoods) {
        sub.neighborhoods.forEach((n) => neighborhoods.push(n.name));
      }
    });

    return NextResponse.json({ districts, neighborhoods });
  } catch (err) {
    console.error("[Locations API Error]", err);
    return NextResponse.json({ error: "Lokasyon verisi alınamadı." }, { status: 500 });
  }
}
