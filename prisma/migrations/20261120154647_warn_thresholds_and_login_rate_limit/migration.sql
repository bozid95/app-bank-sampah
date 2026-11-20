-- AlterTable
ALTER TABLE "AppConfig" ADD COLUMN     "warnWeightKg" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "warnWithdrawAmount" INTEGER NOT NULL DEFAULT 1000000;

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "resetAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "LoginAttempt_resetAt_idx" ON "LoginAttempt"("resetAt");
