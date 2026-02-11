-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Test" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentJob" (
    "id" SERIAL NOT NULL,
    "prompt" TEXT NOT NULL,
    "assignee" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentJobLog" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentJobLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentJobArtifact" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentJobArtifact_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AgentJobLog" ADD CONSTRAINT "AgentJobLog_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "AgentJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentJobArtifact" ADD CONSTRAINT "AgentJobArtifact_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "AgentJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
