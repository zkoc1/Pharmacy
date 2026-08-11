import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'payment_token' })
  paymentToken: string;

  @Column({ type: 'jsonb' })
  items: { productId: number; name: string; price: number; quantity: number }[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'paid' | 'cancelled';

  @Column({ type: 'jsonb', nullable: true })
  customerInfo: Record<string, string>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
