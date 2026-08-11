/**
 * Kök modül — tüm modülleri buraya bağlarız.
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { UploadModule } from './upload/upload.module';
import { Product } from './products/product.entity';
import { Order } from './orders/order.entity';
import { User } from './auth/user.entity';

@Module({
  imports: [
    // Ortam değişkenleri global olarak yüklenir
    ConfigModule.forRoot({ isGlobal: true }),

    // PostgreSQL bağlantısı
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        url: cfg.get('DATABASE_URL'),
        entities: [Product, Order, User],
        synchronize: cfg.get('NODE_ENV') !== 'production',
        ssl: cfg.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),

    ProductsModule,
    AuthModule,
    OrdersModule,
    UploadModule,
  ],
})
export class AppModule {}
