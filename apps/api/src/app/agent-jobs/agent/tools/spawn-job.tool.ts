import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { TaskType, AgentType } from '../../domain/entities/agent-job.entity';
import { ToolFactory, ToolCategory, ToolContext } from '../../registry/tool-registry.service';

export const spawnJobToolFactory: ToolFactory = {
  metadata: {
    name: 'spawn_job',
    description: 'Create a child job for delegating work to another agent',
    category: ToolCategory.ORCHESTRATION,
    requirements: {
      repositoryRequired: true,
    },
  },
  canActivate: (context: ToolContext) => {
    // Only orchestrators can spawn jobs
    return context.job?.taskType === TaskType.ORCHESTRATOR;
  },
  create: (context: ToolContext) => {
    return new DynamicStructuredTool({
      name: 'spawn_job',
      description: 'Creates a new child job for task delegation. The job runs asynchronously - monitor via comments.',
      schema: z.object({
        prompt: z.string().describe('Clear task description for the child job'),
        agentType: z.enum(['DOCKER', 'FILE_SYSTEM']).describe('DOCKER for coding, FILE_SYSTEM for orchestration'),
        taskType: z.enum(['CODING', 'ORCHESTRATOR', 'REVIEW']).optional().describe('Type of task (defaults to CODING)'),
      }),
      func: async ({ prompt, agentType, taskType }) => {
        // Create child job
        const childJob = await context.repository.create({
          prompt,
          type: agentType as AgentType,
          projectId: context.projectId ?? 0,
          parentJobId: context.jobId,
          createdById: context.job?.createdById ?? 0,
          taskType: (taskType as TaskType) || TaskType.CODING,
        });

        // Post comment to parent job
        const authorId = context.job?.assignedAgentId || context.job?.createdById || 0;
        await context.repository.addComment(context.jobId, {
          authorId,
          content: `Spawned child job #${childJob.id}: ${prompt}`,
          metadata: {
            type: 'CHILD_JOB_SPAWNED',
            childJobId: childJob.id,
            agentType,
            taskType: taskType || 'CODING',
          },
        });

        return `Child job #${childJob.id} created successfully. Monitor its progress via read_comments.`;
      },
    });
  },
};
