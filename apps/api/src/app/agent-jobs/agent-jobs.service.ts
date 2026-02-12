import { Inject, Injectable, Logger, NotFoundException, forwardRef } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentJobEntity, AgentJobStatus, AgentType } from './domain/entities/agent-job.entity';
import { JobCreatedEvent } from './domain/events/agent-job-events';
import {
  AGENT_JOBS_REPOSITORY,
  type IAgentJobsRepository,
} from './domain/interfaces/agent-jobs.repository.interface';
import {
  AGENT_RUNNER,
  type IAgentRunner,
} from './domain/interfaces/agent-runner.interface';
import { ProjectsService } from '../projects/application/projects.service';

@Injectable()
export class AgentJobsService {
  private readonly logger = new Logger(AgentJobsService.name);

  constructor(
    @Inject(AGENT_JOBS_REPOSITORY)
    private readonly repository: IAgentJobsRepository,
    @Inject(AGENT_RUNNER)
    private readonly runnerFactory: (type: AgentType) => IAgentRunner,
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => ProjectsService))
    private readonly projectsService: ProjectsService,
  ) { }

  async createJob(
    prompt: string,
    assignee?: string,
    type: AgentType = AgentType.FILE_SYSTEM,
    projectId?: number,
  ): Promise<AgentJobEntity> {
    if (!projectId) {
      throw new Error('Project ID is required to create an agent job');
    }

    // Create job with project relation loaded automatically by repository
    // The repository includes project details (rootPath, includes, excludes) in the returned entity
    const job = await this.repository.create({
      prompt,
      assignee,
      type,
      projectId,
    });

    // Validate that project context was loaded
    if (!job.project) {
      throw new Error(`Project ${projectId} not found or could not be loaded`);
    }

    this.eventEmitter.emit('agent-job.created', new JobCreatedEvent(job));

    // Fire and forget async processing
    // The job entity includes full project context (rootPath, includes, excludes) loaded by repository.
    // Note: The runner's internal try-catch will handle most errors and update job status to FAILED.
    // This catch block handles errors that occur before the runner's error handling kicks in.
    const runner = this.runnerFactory(job.type);

    runner
      .run(job)
      .catch(async (err: unknown) => {
        this.logger.error(`Critical error running job ${job.id}`, err);
        // Attempt to mark job as failed if runner didn't handle it
        try {
          await this.repository.update(job.id, {
            status: AgentJobStatus.FAILED
          });
          await this.repository.addLog(
            job.id,
            `Critical Error: ${err instanceof Error ? err.message : String(err)}`
          );
        } catch (updateError: unknown) {
          this.logger.error(`Failed to update job status after error`, updateError);
        }
      });

    return job;
  }

  async getJobs(assignee?: string, projectId?: number): Promise<AgentJobEntity[]> {
    return this.repository.findAll({ assignee, projectId });
  }

  async getJob(id: number): Promise<AgentJobEntity> {
    const job = await this.repository.findById(id);
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }
}
