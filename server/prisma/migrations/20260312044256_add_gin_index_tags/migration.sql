-- CreateIndex
CREATE INDEX "Companion_tags_idx" ON "Companion" USING GIN ("tags");
