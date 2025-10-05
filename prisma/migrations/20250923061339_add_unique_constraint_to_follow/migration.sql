/*
  Warnings:

  - A unique constraint covering the columns `[following_id,follower_id]` on the table `Follow` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Follow_following_id_follower_id_key" ON "public"."Follow"("following_id", "follower_id");
