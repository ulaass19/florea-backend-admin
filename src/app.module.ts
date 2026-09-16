import {
  Module,
} from '@nestjs/common';

import {
  AuthModule,
} from './auth/auth.module';

import {
  BalloonsModule,
} from './balloons/balloons.module';

import {
  CategoriesModule,
} from './categories/categories.module';

import {
  PrismaModule,
} from './prisma/prisma.module';

import {
  ProductsModule,
} from './products/products.module';

import {
  UploadsModule,
} from './uploads/uploads.module';

import {
  CollectionsModule,
} from './collections/collections.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    BalloonsModule,
    UploadsModule,
    CollectionsModule
  ],
})
export class AppModule {}