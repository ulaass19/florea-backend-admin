-- CreateTable
CREATE TABLE "Balloon" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "heroImage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Balloon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BalloonImage" (
    "id" TEXT NOT NULL,
    "balloonId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BalloonImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BalloonVariant" (
    "id" TEXT NOT NULL,
    "balloonId" TEXT NOT NULL,
    "name" TEXT,
    "color" TEXT,
    "size" TEXT,
    "heliumIncluded" BOOLEAN NOT NULL DEFAULT false,
    "price" DECIMAL(10,2) NOT NULL,
    "stockEnabled" BOOLEAN NOT NULL DEFAULT false,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BalloonVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Balloon_slug_key" ON "Balloon"("slug");

-- CreateIndex
CREATE INDEX "Balloon_isActive_idx" ON "Balloon"("isActive");

-- CreateIndex
CREATE INDEX "Balloon_isFeatured_idx" ON "Balloon"("isFeatured");

-- CreateIndex
CREATE INDEX "Balloon_createdAt_idx" ON "Balloon"("createdAt");

-- CreateIndex
CREATE INDEX "BalloonImage_balloonId_idx" ON "BalloonImage"("balloonId");

-- CreateIndex
CREATE INDEX "BalloonImage_sortOrder_idx" ON "BalloonImage"("sortOrder");

-- CreateIndex
CREATE INDEX "BalloonVariant_balloonId_idx" ON "BalloonVariant"("balloonId");

-- CreateIndex
CREATE INDEX "BalloonVariant_isActive_idx" ON "BalloonVariant"("isActive");

-- CreateIndex
CREATE INDEX "BalloonVariant_sortOrder_idx" ON "BalloonVariant"("sortOrder");

-- AddForeignKey
ALTER TABLE "BalloonImage" ADD CONSTRAINT "BalloonImage_balloonId_fkey" FOREIGN KEY ("balloonId") REFERENCES "Balloon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalloonVariant" ADD CONSTRAINT "BalloonVariant_balloonId_fkey" FOREIGN KEY ("balloonId") REFERENCES "Balloon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
