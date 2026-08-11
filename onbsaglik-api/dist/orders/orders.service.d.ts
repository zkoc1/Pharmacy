import { Repository } from 'typeorm';
import { Order } from './order.entity';
export declare class OrdersService {
    private readonly repo;
    constructor(repo: Repository<Order>);
    create(data: Partial<Order>): Promise<Order>;
    updateStatus(paymentToken: string, status: Order['status']): Promise<void>;
    findAll(): Promise<Order[]>;
}
