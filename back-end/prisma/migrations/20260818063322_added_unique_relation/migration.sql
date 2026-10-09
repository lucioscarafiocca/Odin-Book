/*
  Warnings:

  - A unique constraint covering the columns `[authorId,text]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Comment_text_key";

-- CreateIndex
CREATE UNIQUE INDEX "Post_authorId_text_key" ON "Post"("authorId", "text");
