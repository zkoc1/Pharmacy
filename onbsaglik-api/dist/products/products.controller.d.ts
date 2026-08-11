import { ProductsService } from './products.service';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsController {
    private readonly service;
    constructor(service: ProductsService);
    findAll(category?: string, brand?: string, search?: string, page?: number, limit?: number): Promise<{
        products: import("./product.entity").Product[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(slug: string): Promise<import("./product.entity").Product>;
    update(id: number, dto: UpdateProductDto): Promise<import("./product.entity").Product>;
}
