import 'dotenv/config';

import {
  ValidationPipe,
} from '@nestjs/common';

import {
  NestFactory,
} from '@nestjs/core';

import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';

import {
  NestExpressApplication,
} from '@nestjs/platform-express';

import {
  join,
} from 'path';

import {
  AppModule,
} from './app.module';

async function bootstrap() {
  const app =
    await NestFactory.create<NestExpressApplication>(
      AppModule,
    );

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3002',
    ],

    credentials: true,
  });

  app.useStaticAssets(
    join(
      process.cwd(),
      'uploads',
    ),
    {
      prefix: '/uploads/',
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig =
    new DocumentBuilder()
      .setTitle('Florea API')
      .setDescription(
        'Florea e-ticaret ve admin paneli için backend API dokümantasyonu',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .addTag(
        'Auth',
        'Admin authentication',
      )
      .addTag(
        'Products',
        'Ürün yönetimi',
      )
      .addTag(
        'Categories',
        'Kategori yönetimi',
      )
      .addTag(
        'Uploads',
        'Görsel yükleme',
      )
      .build();

  const swaggerDocument =
    SwaggerModule.createDocument(
      app,
      swaggerConfig,
    );

  SwaggerModule.setup(
    'api',
    app,
    swaggerDocument,
    {
      swaggerOptions: {
        persistAuthorization:
          true,
      },
    },
  );

  const port =
    process.env.PORT ?? 3001;

  await app.listen(port);

  console.log(
    `🚀 Florea API: http://localhost:${port}`,
  );

  console.log(
    `📚 Swagger: http://localhost:${port}/api`,
  );
}

bootstrap();