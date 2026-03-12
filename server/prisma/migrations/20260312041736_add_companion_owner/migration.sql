-- AlterTable
ALTER TABLE "Companion" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "Companion_userId_idx" ON "Companion"("userId");

-- AddForeignKey
ALTER TABLE "Companion" ADD CONSTRAINT "Companion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
