/*
  Warnings:

  - A unique constraint covering the columns `[thread_id,created_by]` on the table `Like` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reply_id,created_by]` on the table `Like` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Like_thread_id_reply_id_created_by_key";

-- CreateIndex
CREATE UNIQUE INDEX "Like_thread_id_created_by_key" ON "public"."Like"("thread_id", "created_by");

-- CreateIndex
CREATE UNIQUE INDEX "Like_reply_id_created_by_key" ON "public"."Like"("reply_id", "created_by");
