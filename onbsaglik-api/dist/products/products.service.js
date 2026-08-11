"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./product.entity");
let ProductsService = class ProductsService {
    constructor(repo) {
        this.repo = repo;
    }
    async findAll(params) {
        const { category, brand, search, page = 1, limit = 24 } = params;
        const where = { status: 'active' };
        if (category)
            where.categorySlug = category;
        if (brand)
            where.brandSlug = brand;
        const qb = this.repo.createQueryBuilder('p')
            .where('p.status = :status', { status: 'active' });
        if (category)
            qb.andWhere('p.category_slug = :category', { category });
        if (brand)
            qb.andWhere('p.brand_slug = :brand', { brand });
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
    async findBySlug(slug) {
        const product = await this.repo.findOne({ where: { slug, status: 'active' } });
        if (!product)
            throw new common_1.NotFoundException(`Ürün bulunamadı: ${slug}`);
        return product;
    }
    async findAllAdmin() {
        return this.repo.find({ order: { id: 'DESC' } });
    }
    async update(id, dto) {
        const product = await this.repo.findOneBy({ id });
        if (!product)
            throw new common_1.NotFoundException(`Ürün bulunamadı: #${id}`);
        Object.assign(product, dto);
        return this.repo.save(product);
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map