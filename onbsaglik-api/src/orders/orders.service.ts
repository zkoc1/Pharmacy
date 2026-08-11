import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
  ) {}

  async create(data: Partial<Order>) {
    const order = this.repo.create(data);
    return this.repo.save(order);
  }

  async updateStatus(paymentToken: string, status: Order['status']) {
    await this.repo.update({ paymentToken }, { status });
  }

  async findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }
}
