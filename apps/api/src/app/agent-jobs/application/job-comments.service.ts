import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { AgentJobComment } from '../domain/entities/agent-job.entity';
import { JobCommentAddedEvent } from '../domain/events/agent-job-events';
import {
  AGENT_JOBS_REPOSITORY,
  type IAgentJobsRepository,
} from '../domain/interfaces/agent-jobs.repository.interface';

@Injectable()
export class JobCommentsService {
  private readonly logger = new Logger(JobCommentsService.name);

  constructor(
    @Inject(AGENT_JOBS_REPOSITORY)
    private readonly repository: IAgentJobsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  /**
   * Add a comment to a job
   * @param jobId - The job ID to add the comment to
   * @param authorId - The ID of the user/agent posting the comment
   * @param content - The comment content
   * @param metadata - Optional structured metadata
   * @returns The created comment
   */
  async addComment(
    jobId: number,
    authorId: number,
    content: string,
    metadata?: Record<string, unknown>,
  ): Promise<AgentJobComment> {
    // Validate job exists
    const job = await this.repository.findById(jobId);
    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    // Add comment
    const comment = await this.repository.addComment(jobId, {
      authorId,
      content,
      metadata,
    });

    // Emit event for real-time updates
    this.eventEmitter.emit(
      'agent-job.comment-added',
      new JobCommentAddedEvent(jobId, comment),
    );

    this.logger.log(`Comment added to job ${jobId} by user ${authorId}`);

    return comment;
  }

  /**
   * Get all comments for a job
   * @param jobId - The job ID to get comments for
   * @returns Array of comments
   */
  async getComments(jobId: number): Promise<AgentJobComment[]> {
    // Validate job exists
    const job = await this.repository.findById(jobId);
    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    return this.repository.getComments(jobId);
  }
}
