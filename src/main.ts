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

  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3002',

    // Canlı Admin Panel
    'https://florea-admin-blpq5rirz-bi-buket-nese.vercel.app',
  ];

  app.enableCors({
    origin: (
      origin,
      callback,
    ) => {
      // Postman, Swagger, server-to-server vb.
      if (!origin) {
        callback(null, true);
        return;
      }

      if (
        allowedOrigins.includes(
          origin,
        )
      ) {
        callback(null, true);
        return;
      }

      // Vercel preview deployment'ları
      if (
        origin.endsWith(
          '.vercel.app',
        )
      ) {
        callback(null, true);
        return;
      }

      callback(
        new Error(
          `CORS tarafından izin verilmeyen origin: ${origin}`,
        ),
        false,
      );
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
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