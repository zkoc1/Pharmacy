export declare class Product {
    id: number;
    slug: string;
    name: string;
    brand: string;
    brandSlug: string;
    category: string;
    categorySlug: string;
    price: number;
    marketPrice: number;
    stock: number;
    vatRate: number;
    images: string[];
    barcode: string;
    trendyolLink: string;
    status: 'active' | 'draft';
    createdAt: Date;
    updatedAt: Date;
}
