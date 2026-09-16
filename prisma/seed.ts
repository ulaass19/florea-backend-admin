import 'dotenv/config';

import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';

import {
  AdminRole,
  PrismaClient,
} from '../generated/prisma/client';

const connectionString =
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL .env dosyasında tanımlı değil.',
  );
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const email = 'admin@florea.com';

  const password =
    process.env.ADMIN_SEED_PASSWORD;

  if (!password) {
    throw new Error(
      'ADMIN_SEED_PASSWORD .env dosyasında tanımlı değil.',
    );
  }

  const passwordHash =
    await bcrypt.hash(password, 12);

  const admin =
    await prisma.adminUser.upsert({
      where: {
        email,
      },

      update: {
        name: 'Ulaş',
        passwordHash,
        role: AdminRole.SUPER_ADMIN,
        isActive: true,
      },

      create: {
        name: 'Ulaş',
        email,
        passwordHash,
        role: AdminRole.SUPER_ADMIN,
        isActive: true,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

  console.log(
    '✅ SUPER_ADMIN hazır:',
    admin,
  );
}

main()
  .catch((error) => {
    console.error(
      '❌ Seed hatası:',
      error,
    );

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });