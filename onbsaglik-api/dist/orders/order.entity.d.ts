export declare class Order {
    id: number;
    paymentToken: string;
    items: {
        productId: number;
        name: string;
        price: number;
        quantity: number;
    }[];
    total: number;
    status: 'pending' | 'paid' | 'cancelled';
    customerInfo: Record<string, string>;
    createdAt: Date;
}
