-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('ORCHESTRATOR', 'CODING', 'REVIEW');

-- CreateEnum
CREATE TYPE "MergeStatus" AS ENUM ('PENDING', 'READY', 'CONFLICT', 'MERGED');

-- AlterTable
ALTER TABLE "AgentJob" ADD COLUMN "parentJobId" INTEGER,
ADD COLUMN "gitBranch" TEXT,
ADD COLUMN "taskType" "TaskType" NOT NULL DEFAULT 'CODING',
ADD COLUMN "mergeStatus" "MergeStatus" NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "AgentJob" ADD CONSTRAINT "AgentJob_parentJobId_fkey" FOREIGN KEY ("parentJobId") REFERENCES "AgentJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
