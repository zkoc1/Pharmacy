/**
 * NestJS uygulaması başlangıç noktası.
 * CORS, Swagger ve validation pipe yapılandırması.
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS — Next.js frontend'den gelen isteklere izin ver
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Global doğrulama boru hattı
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  // API öneki: /api/v1/...
  app.setGlobalPrefix('api/v1');

  // Swagger belgesi
  const config = new DocumentBuilder()
    .setTitle('OnbSağlık API')
    .setDescription('onbsaglik.com REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`OnbSağlık API çalışıyor: http://localhost:${port}`);
  console.log(`Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();
