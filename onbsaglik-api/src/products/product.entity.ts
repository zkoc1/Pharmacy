/** Ürün veritabanı varlığı */
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  @Column()
  brand: string;

  @Column({ name: 'brand_slug' })
  brandSlug: string;

  @Column()
  category: string;

  @Column({ name: 'category_slug' })
  categorySlug: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'market_price', default: 0 })
  marketPrice: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ name: 'vat_rate', default: 10 })
  vatRate: number;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ nullable: true })
  barcode: string;

  @Column({ name: 'trendyol_link', nullable: true })
  trendyolLink: string;

  @Column({ default: 'active' })
  status: 'active' | 'draft';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
