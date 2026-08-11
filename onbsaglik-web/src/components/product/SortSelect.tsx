"use client";

/**
 * Sıralama seçici istemci bileşeni.
 * Kategori ve ürün listeleme sayfalarında URL parametrelerini günceller.
 */

import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  defaultValue?: string;
}

export default function SortSelect({ defaultValue }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("siralama", e.target.value);
    } else {
      params.delete("siralama");
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <select
      name="siralama"
      defaultValue={defaultValue || ""}
      onChange={handleChange}
      style={{
        padding: "8px 12px",
        border: "2px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        fontSize: "14px",
        background: "white",
        cursor: "pointer",
      }}
    >
      <option value="">Önerilen Sıralama</option>
      <option value="price_asc">Fiyat: Artan</option>
      <option value="price_desc">Fiyat: Azalan</option>
      <option value="name_asc">A-Z</option>
    </select>
  );
}
