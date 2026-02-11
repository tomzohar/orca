-- DropForeignKey
ALTER TABLE "AgentJob" DROP CONSTRAINT "AgentJob_projectId_fkey";

-- DropForeignKey
ALTER TABLE "AgentJobArtifact" DROP CONSTRAINT "AgentJobArtifact_jobId_fkey";

-- DropForeignKey
ALTER TABLE "AgentJobLog" DROP CONSTRAINT "AgentJobLog_jobId_fkey";

-- AddForeignKey
ALTER TABLE "AgentJob" ADD CONSTRAINT "AgentJob_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentJobLog" ADD CONSTRAINT "AgentJobLog_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "AgentJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentJobArtifact" ADD CONSTRAINT "AgentJobArtifact_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "AgentJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
