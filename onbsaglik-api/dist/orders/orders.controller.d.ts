import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly service;
    constructor(service: OrdersService);
    findAll(): Promise<import("./order.entity").Order[]>;
}
