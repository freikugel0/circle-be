/*
  Warnings:

  - You are about to drop the column `updated_by` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by` on the `Reply` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by` on the `Thread` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Like" DROP COLUMN "updated_by";

-- AlterTable
ALTER TABLE "public"."Reply" DROP COLUMN "updated_by";

-- AlterTable
ALTER TABLE "public"."Thread" DROP COLUMN "updated_by";
