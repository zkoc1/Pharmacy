// Server Component - Ürünleri grid yapısında listeler
import React from 'react';
import type { Product } from '@/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  title?: string;
}

export default function ProductGrid({ products, title }: ProductGridProps) {
  return (
    <div className="w-full py-8">
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 border-b pb-4">
          {title}
        </h2>
      )}
      
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <span className="text-4xl mb-4">🔍</span>
          <p className="text-lg font-medium">Ürün bulunamadı</p>
          <p className="text-sm mt-1">Lütfen farklı bir kategori veya arama terimi deneyin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
