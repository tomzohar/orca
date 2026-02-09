-- AlterTable
ALTER TABLE "AgentJob" ADD COLUMN     "projectId" INTEGER;

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "rootPath" TEXT NOT NULL,
    "description" TEXT,
    "includes" TEXT[] DEFAULT ARRAY['**/*']::TEXT[],
    "excludes" TEXT[] DEFAULT ARRAY['**/node_modules/**', '**/.git/**']::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- AddForeignKey
ALTER TABLE "AgentJob" ADD CONSTRAINT "AgentJob_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
