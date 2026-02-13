import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import type { IAgentJobsRepository } from '../../domain/interfaces/agent-jobs.repository.interface';
import { ToolFactory, ToolCategory, ToolContext } from '../../registry/tool-registry.service';

/**
 * Create a tool for posting comments to a job
 * Agents can use this to communicate progress, ask questions, or report completion
 */
export const createPostCommentTool = (
  jobId: number,
  authorId: number,
  repository: IAgentJobsRepository,
) => {
  return new DynamicStructuredTool({
    name: 'post_comment',
    description:
      'Post a comment to the job thread. Use this to communicate progress, ask questions, report completion, or collaborate with other agents.',
    schema: z.object({
      content: z.string().describe('The comment text to post'),
      metadata: z
        .record(z.string(), z.any())
        .optional()
        .describe('Optional structured data as JSON object (e.g., {"status": "complete"})'),
    }),
    func: async ({ content, metadata }) => {
      try {
        const comment = await repository.addComment(jobId, {
          authorId,
          content,
          metadata,
        });
        return `Comment posted successfully (ID: ${comment.id})`;
      } catch (error) {
        return `Error posting comment: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
  });
};

/**
 * Create a tool for reading comments from a job
 * Agents can use this to check for feedback, monitor child job progress, or read human instructions
 */
export const createReadCommentsTool = (
  jobId: number,
  repository: IAgentJobsRepository,
) => {
  return new DynamicStructuredTool({
    name: 'read_comments',
    description:
      'Read comments from the job thread. Use this to check for human feedback, monitor progress, or read instructions from other agents.',
    schema: z.object({
      since: z
        .string()
        .optional()
        .describe(
          'Optional ISO timestamp to only return comments after this time',
        ),
    }),
    func: async ({ since }) => {
      try {
        let comments = await repository.getComments(jobId);

        if (since) {
          const sinceDate = new Date(since);
          comments = comments.filter((c) => c.createdAt > sinceDate);
        }

        if (comments.length === 0) {
          return 'No comments found';
        }

        return JSON.stringify(
          comments.map((c) => ({
            id: c.id,
            authorId: c.authorId,
            content: c.content,
            metadata: c.metadata,
            createdAt: c.createdAt.toISOString(),
          })),
          null,
          2,
        );
      } catch (error) {
        return `Error reading comments: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
  });
};

// Factories for registry
export const postCommentToolFactory: ToolFactory = {
  metadata: {
    name: 'post_comment',
    description: 'Post comments to job threads for communication',
    category: ToolCategory.COMMUNICATION,
    requirements: { repositoryRequired: true },
  },
  create: (context: ToolContext) => {
    const authorId = context.job?.assignedAgentId ?? context.job?.createdById ?? 0;
    return createPostCommentTool(context.jobId, authorId, context.repository);
  },
};

export const readCommentsToolFactory: ToolFactory = {
  metadata: {
    name: 'read_comments',
    description: 'Read comments from job threads for monitoring and coordination',
    category: ToolCategory.COMMUNICATION,
    requirements: { repositoryRequired: true },
  },
  create: (context: ToolContext) => {
    return createReadCommentsTool(context.jobId, context.repository);
  },
};
