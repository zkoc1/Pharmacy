/**
 * Ürün iş mantığı — veritabanı ile etkileşim.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Product } from './product.entity';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}

  /** Tüm aktif ürünleri listele (müşteri API) */
  async findAll(params: {
    category?: string;
    brand?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { category, brand, search, page = 1, limit = 24 } = params;

    const where: FindOptionsWhere<Product> = { status: 'active' };
    if (category) where.categorySlug = category;
    if (brand) where.brandSlug = brand;

    const qb = this.repo.createQueryBuilder('p')
      .where('p.status = :status', { status: 'active' });

    if (category) qb.andWhere('p.category_slug = :category', { category });
    if (brand) qb.andWhere('p.brand_slug = :brand', { brand });
    if (search) {
      qb.andWhere('(LOWER(p.name) LIKE :q OR LOWER(p.brand) LIKE :q)', {
        q: `%${search.toLowerCase()}%`,
      });
    }

    const total = await qb.getCount();
    const products = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { products, total, page, limit };
  }

  /** Slug ile tek ürün */
  async findBySlug(slug: string): Promise<Product> {
    const product = await this.repo.findOne({ where: { slug, status: 'active' } });
    if (!product) throw new NotFoundException(`Ürün bulunamadı: ${slug}`);
    return product;
  }

  /** Admin: tüm ürünler (taslak dahil) */
  async findAllAdmin() {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  /** Admin: ürün güncelle (fiyat, stok, durum) */
  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.repo.findOneBy({ id });
    if (!product) throw new NotFoundException(`Ürün bulunamadı: #${id}`);
    Object.assign(product, dto);
    return this.repo.save(product);
  }
}
