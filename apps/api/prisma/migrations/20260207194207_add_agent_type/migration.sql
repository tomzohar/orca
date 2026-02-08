-- CreateEnum
CREATE TYPE "AgentType" AS ENUM ('CLAUDE_SDK', 'LANGGRAPH');

-- AlterTable
ALTER TABLE "AgentJob" ADD COLUMN     "type" "AgentType" NOT NULL DEFAULT 'LANGGRAPH';
