import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsService {
    private readonly repo;
    constructor(repo: Repository<Product>);
    findAll(params: {
        category?: string;
        brand?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        products: Product[];
        total: number;
        page: number;
        limit: number;
    }>;
    findBySlug(slug: string): Promise<Product>;
    findAllAdmin(): Promise<Product[]>;
    update(id: number, dto: UpdateProductDto): Promise<Product>;
}
