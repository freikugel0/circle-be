/*
  Warnings:

  - You are about to drop the column `updated_at` on the `Follow` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Like" DROP CONSTRAINT "Like_updated_by_fkey";

-- AlterTable
ALTER TABLE "public"."Follow" DROP COLUMN "updated_at";
