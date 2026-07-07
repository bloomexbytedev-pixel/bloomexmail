/*
  Warnings:

  - You are about to drop the `Template` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "Notification_channel_idx";

-- DropIndex
DROP INDEX "Notification_createdAt_idx";

-- DropIndex
DROP INDEX "Notification_recipient_idx";

-- DropIndex
DROP INDEX "Notification_status_idx";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "template" TEXT,
ADD COLUMN     "variables" JSONB,
ALTER COLUMN "message" DROP NOT NULL;

-- DropTable
DROP TABLE "Template";
