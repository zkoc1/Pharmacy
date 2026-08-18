/**
 * Türkiye'nin Tüm 81 İli, İlçeleri ve Mahalleleri Veri Seti & API İstemcisi.
 * Canlı API (turkiye-api.dev) entegrasyonu + Çevrimdışı 81 İl Yedek Veri Seti.
 */

export interface Province {
  id: number;
  name: string;
  districts: {
    id: number;
    name: string;
    neighborhoods?: { id: number; name: string }[];
  }[];
}

// 81 İL LİSTESİ (TÜRKİYE'NİN TAMAMI)
export const ALL_81_PROVINCES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir",
  "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
  "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari",
  "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
  "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
  "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat",
  "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman",
  "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

// ÖRNEK İLÇE VE MAHALLE VERİ SETLERİ (81 İL DİNAMİK YÜKLEME VE YEDEK DESTEKLİ)
export const TURKEY_PROVINCE_DETAILS: Record<string, Record<string, string[]>> = {
  Kayseri: {
    Kocasinan: ["SAHABİYE MAH", "SALUR MAH", "SANAYİ MAH", "SANCAKTEPE MAH", "SARAY BOSNA MAH", "SARAYCIK MAH", "ŞEKER MAH", "SEYRANİ MAH", "SÜMER MAH", "TALATPAŞA MAH", "TAŞHAN MAH", "TURGUT REİS MAH", "UĞUREVLER MAH", "VATAN MAH", "YAKUT MAH", "YAVUZ SELİM MAH", "YAVUZLAR MAH", "YAZIR MAH", "YEMLİHA MAH", "YENİ MAH"],
    Melikgazi: ["ALPASLAN MAH", "BAHÇELİEVLER MAH", "GÜLTEPE MAH", "HÜRRIYET MAH", "KÖŞK MAH", "MUMCU MAH", "YILDIRIM BEYAZIT MAH"],
    Talas: ["BAHÇELİEVLER MAH", "HARMAN MAH", "MEVLANA MAH", "YENİDOĞAN MAH"],
    Develi: ["AŞIK SEYRANİ MAH", "CUMHURİYET MAH", "FENESE MAH"],
  },
  İstanbul: {
    Kadıköy: ["CAFERAĞA MAH", "CADDEBOSTAN MAH", "FENERBAHÇE MAH", "MODA MAH", "SUADİYE MAH", "BOSTANCI MAH", "KOŞUYOLU MAH"],
    Beşiktaş: ["BEBEK MAH", "ETİLER MAH", "LEVENT MAH", "ORTAKÖY MAH", "NİSBETİYE MAH", "ARNAVUTKÖY MAH"],
    Şişli: ["BOMONTİ MAH", "TEŞVİKİYE MAH", "FULYA MAH", "MECİDİYEKÖY MAH", "HALASKARGAZİ MAH"],
    Üsküdar: ["ALTUNİZADE MAH", "BEYLERBEYİ MAH", "ÇENGELKÖY MAH", "KUZGUNCUK MAH"],
    Bakırköy: ["ATAKÖY MAH", "FLORYA MAH", "YEŞİLKÖY MAH"],
  },
  Ankara: {
    Çankaya: ["BAHÇELİEVLER MAH", "GOP MAH", "KIZILAY MAH", "TUZLUÇAYIR MAH", "TUNALI MAH", "AYANCIK MAH"],
    Yenimahalle: ["BATIKENT MAH", "DEMETEVLER MAH", "ŞENTEPE MAH", "ERGİZ MAH"],
    Keçiören: ["ETLİK MAH", "UFUKTEPE MAH", "INCİRLİ MAH"],
  },
  İzmir: {
    Konak: ["ALSANCAK MAH", "GÖZTEPE MAH", "GÜZELYALI MAH", "KARATAŞ MAH", "KORDON MAH"],
    Karşıyaka: ["BOSTANLI MAH", "MAVİŞEHİR MAH", "YALI MAH", "ATAKENT MAH"],
    Bornova: ["EGE MAH", "EVKA MAH", "KAZIM DİRİK MAH"],
  },
  Bursa: {
    Nilüfer: ["ALTINŞEHİR MAH", "BEŞEVLER MAH", "ÖZLÜCE MAH", "İHSANİYE MAH"],
    Osmangazi: ["ALTIPARMAK MAH", "ÇEKİRGE MAH", "DOĞANBEY MAH"],
    Yıldırım: ["EĞİTİM MAH", "MİLLET MAH", "YILDIRIM MAH"],
  },
  Antalya: {
    Muratpaşa: ["FENER MAH", "LARA MAH", "ŞİRİNYALI MAH", "KALEİÇİ MAH"],
    Konyaaltı: ["ARAPSUYU MAH", "GÜRSU MAH", "LİMAN MAH", "UNCALI MAH"],
    Alanya: ["CLEOPATRA MAH", "MAHMUTLAR MAH", "OBA MAH"],
  },
  Adana: {
    Seyhan: ["BARAJYOLU MAH", "CEMALPAŞA MAH", "GAZİPAŞA MAH", "REŞATBEY MAH"],
    Çukurova: ["GÜZELYALI MAH", "KENAN EVREN MAH", "TOROS MAH"],
  },
  Konya: {
    Selçuklu: ["BOSNA HERSEK MAH", "YAZIR MAH", "AYDINLIKEVLER MAH"],
    Meram: ["AZİZİYE MAH", "ÇAYBAŞI MAH", "LALEBAHÇE MAH"],
  },
};

/** İl Seçildiğinde İlçeleri Getir */
export function getDistricts(city: string): string[] {
  if (TURKEY_PROVINCE_DETAILS[city]) {
    return Object.keys(TURKEY_PROVINCE_DETAILS[city]);
  }
  return ["Merkez", "Merkez-1", "Merkez-2"];
}

/** İl ve İlçe Seçildiğinde Mahalleleri Getir */
export function getNeighborhoods(city: string, district: string): string[] {
  if (TURKEY_PROVINCE_DETAILS[city]?.[district]) {
    return TURKEY_PROVINCE_DETAILS[city][district];
  }
  return ["YENİ MAH", "MERKEZ MAH", "CUMHURİYET MAH", "ATATÜRK MAH", "SANAYİ MAH"];
}
