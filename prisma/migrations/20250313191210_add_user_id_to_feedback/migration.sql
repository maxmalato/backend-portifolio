/*
  Warnings:

  - Added the required column `userId` to the `Feedback` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "userId" TEXT NOT NULL;
