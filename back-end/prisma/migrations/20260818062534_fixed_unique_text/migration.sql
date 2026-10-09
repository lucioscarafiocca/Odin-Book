/*
  Warnings:

  - A unique constraint covering the columns `[text]` on the table `Comment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Comment_text_key" ON "Comment"("text");
