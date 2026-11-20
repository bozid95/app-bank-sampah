-- CreateTable
CREATE TABLE "AppConfig" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "appName" TEXT NOT NULL DEFAULT 'Bank Sampah',
    "organizationName" TEXT NOT NULL DEFAULT 'Bank Sampah',
    "tagline" TEXT NOT NULL DEFAULT 'Tabung sampahmu, kumpulkan saldonya',
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#1f7a4d',
    "accountNumberPrefix" TEXT NOT NULL DEFAULT 'BS',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    "receiptFooter" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("id")
);

