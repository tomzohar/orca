-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('HUMAN', 'AGENT');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "type" "UserType" NOT NULL DEFAULT 'HUMAN',
    "systemPrompt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create default Human and Coding Agent users
INSERT INTO "User" ("name", "type", "createdAt", "updatedAt") VALUES ('Human', 'HUMAN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO "User" ("name", "type", "createdAt", "updatedAt") VALUES ('Coding Agent', 'AGENT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Truncate AgentJob to allow schema changes (destructive - acceptable for early development)
TRUNCATE TABLE "AgentJob" CASCADE;

-- AlterTable AgentJob: Remove assignee column and add user relations
ALTER TABLE "AgentJob" DROP COLUMN "assignee";
ALTER TABLE "AgentJob" ADD COLUMN "createdById" INTEGER NOT NULL;
ALTER TABLE "AgentJob" ADD COLUMN "assignedAgentId" INTEGER;

-- AlterTable Project: Add owner relation (nullable first, then set and make NOT NULL)
ALTER TABLE "Project" ADD COLUMN "ownerId" INTEGER;

-- Update existing projects to use the Human user (id = 1)
UPDATE "Project" SET "ownerId" = 1 WHERE "ownerId" IS NULL;

-- Now make it NOT NULL
ALTER TABLE "Project" ALTER COLUMN "ownerId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentJob" ADD CONSTRAINT "AgentJob_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentJob" ADD CONSTRAINT "AgentJob_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
