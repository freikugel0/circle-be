/*
  Warnings:

  - A unique constraint covering the columns `[thread_id,reply_id,created_by]` on the table `Like` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Like" DROP CONSTRAINT "Like_thread_id_fkey";

-- DropIndex
DROP INDEX "public"."Like_thread_id_created_by_key";

-- AlterTable
ALTER TABLE "public"."Like" ADD COLUMN     "reply_id" INTEGER,
ALTER COLUMN "thread_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Like_thread_id_reply_id_created_by_key" ON "public"."Like"("thread_id", "reply_id", "created_by");

-- AddForeignKey
ALTER TABLE "public"."Like" ADD CONSTRAINT "Like_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."Thread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Like" ADD CONSTRAINT "Like_reply_id_fkey" FOREIGN KEY ("reply_id") REFERENCES "public"."Reply"("id") ON DELETE SET NULL ON UPDATE CASCADE;
