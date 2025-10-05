/*
  Warnings:

  - A unique constraint covering the columns `[thread_id,created_by]` on the table `Like` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Like_thread_id_created_by_key" ON "public"."Like"("thread_id", "created_by");
