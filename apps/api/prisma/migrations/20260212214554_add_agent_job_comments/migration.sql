-- CreateTable
CREATE TABLE "AgentJobComment" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentJobComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AgentJobComment" ADD CONSTRAINT "AgentJobComment_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "AgentJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentJobComment" ADD CONSTRAINT "AgentJobComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON UPDATE CASCADE;
