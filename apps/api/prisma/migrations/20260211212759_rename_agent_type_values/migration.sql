-- AlterEnum
-- Recreate AgentType enum with new values: DOCKER, FILE_SYSTEM

-- Drop the default constraint temporarily
ALTER TABLE "AgentJob" ALTER COLUMN "type" DROP DEFAULT;

-- Drop the column that uses the enum
ALTER TABLE "AgentJob" DROP COLUMN "type";

-- Drop the old enum type
DROP TYPE "AgentType";

-- Create the new enum type with new values
CREATE TYPE "AgentType" AS ENUM ('DOCKER', 'FILE_SYSTEM');

-- Add the column back with the new enum type
ALTER TABLE "AgentJob" ADD COLUMN "type" "AgentType" NOT NULL DEFAULT 'FILE_SYSTEM';
