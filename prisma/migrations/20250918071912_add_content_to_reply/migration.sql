/*
  Warnings:

  - Added the required column `content` to the `Reply` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Reply" ADD COLUMN     "content" TEXT NOT NULL;
