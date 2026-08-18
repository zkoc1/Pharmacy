/**
 * Kök modül — tüm modülleri buraya bağlarız.
 * DATABASE_URL yoksa veritabanı bağlantısı atlanır (geliştirme modunda API çalışmaya devam eder).
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

    // PostgreSQL bağlantısı — URL yoksa sessizce atla
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const dbUrl = cfg.get<string>('DATABASE_URL');

        // DB URL yoksa veya placeholder ise dummy SQLite bağlantısı kur
        const hasDb = dbUrl && !dbUrl.includes('[SUPABASE') && !dbUrl.includes('YOUR-');

        if (!hasDb) {
          console.warn(
            '\n⚠️  DATABASE_URL tanımlı değil veya placeholder — DB bağlantısı atlandı.\n' +
            '   Supabase şifrenizi .env dosyasına ekleyin:\n' +
            '   DATABASE_URL=postgresql://postgres.ickjbiywqzvrxtcccmrw:ŞİFRENİZ@aws-0-eu-central-1.pooler.supabase.com:6543/postgres\n'
          );
          // Bağlantı yapmadan devam et (entities yüklenmez ama API ayağa kalkar)
          return {
            type: 'postgres' as const,
            url: 'postgresql://localhost:5432/dummy',
            entities: [Product, Order, User],
            synchronize: false,
            retryAttempts: 0,     // Tekrar deneme yok
            retryDelay: 0,
            connectTimeoutMS: 100,
          };
        }

        return {
          type: 'postgres' as const,
          url: dbUrl,
          entities: [Product, Order, User],
          synchronize: cfg.get('NODE_ENV') !== 'production',
          ssl: { rejectUnauthorized: false }, // Supabase için zorunlu
          retryAttempts: 3,
          retryDelay: 3000,
          connectTimeoutMS: 10000,
        };
      },
    }),

    ProductsModule,
    AuthModule,
    OrdersModule,
    UploadModule,
  ],
})
export class AppModule {}
