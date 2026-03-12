-- CreateEnum
CREATE TYPE "CompanionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateTable
CREATE TABLE "Companion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "bio" TEXT,
    "tagline" TEXT,
    "ethnicity" TEXT,
    "bodyType" TEXT,
    "hairColor" TEXT,
    "eyeColor" TEXT,
    "height" INTEGER,
    "languages" TEXT[],
    "services" TEXT[],
    "availability" TEXT,
    "city" TEXT NOT NULL,
    "region" TEXT,
    "country" TEXT NOT NULL DEFAULT 'US',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "pricePerHour" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "CompanionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Companion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanionImage" (
    "id" TEXT NOT NULL,
    "companionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "s3Key" TEXT NOT NULL,
    "thumbUrl" TEXT NOT NULL,
    "mediumUrl" TEXT NOT NULL,
    "fullUrl" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "blurHash" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanionImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoriesOnCompanions" (
    "companionId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "CategoriesOnCompanions_pkey" PRIMARY KEY ("companionId","categoryId")
);

-- CreateIndex
CREATE INDEX "Companion_status_idx" ON "Companion"("status");

-- CreateIndex
CREATE INDEX "Companion_city_idx" ON "Companion"("city");

-- CreateIndex
CREATE INDEX "Companion_featured_idx" ON "Companion"("featured");

-- CreateIndex
CREATE INDEX "Companion_createdAt_idx" ON "Companion"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "CompanionImage_companionId_position_idx" ON "CompanionImage"("companionId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- AddForeignKey
ALTER TABLE "CompanionImage" ADD CONSTRAINT "CompanionImage_companionId_fkey" FOREIGN KEY ("companionId") REFERENCES "Companion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriesOnCompanions" ADD CONSTRAINT "CategoriesOnCompanions_companionId_fkey" FOREIGN KEY ("companionId") REFERENCES "Companion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriesOnCompanions" ADD CONSTRAINT "CategoriesOnCompanions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
