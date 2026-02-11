import { Inject, Injectable, Logger, NotFoundException, forwardRef } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentJobEntity, AgentType } from './domain/entities/agent-job.entity';
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
    type: AgentType = AgentType.LANGGRAPH,
    projectId?: number,
  ): Promise<AgentJobEntity> {
    if (!projectId) {
      throw new Error('Project ID is required to create an agent job');
    }

    const job = await this.repository.create({
      prompt,
      assignee,
      type,
      projectId,
    });

    this.eventEmitter.emit('agent-job.created', new JobCreatedEvent(job));

    // Fire and forget async processing
    const runner = this.runnerFactory(job.type);

    // Inject project context into the job if needed by the runner?
    // The runner should fetch the job which now has projectId (if we loaded it)
    // Actually, we might need to pass the project root path to the runner.
    // The runner usually fetches the job from DB or we pass the entity.
    // The entity we just created has 'projectId'.
    // We should probably fetch the project details to pass rootPath to the runner, 
    // OR the runner should do it.
    // For now, let's assume the runner will resolve it or we pass it.
    // BUT the runner interface `run(job: AgentJobEntity)` takes the entity.
    // The entity has `projectId`. The runner can look it up.
    // HOWEVER, `AgentJobEntity` in `agent-job.entity.ts` does NOT have `Project` relation loaded by default in `create`.
    // We should probably make sure the runner has access to project info.
    // But for this step, let's just create the job properly.

    runner
      .run(job)
      .catch((err) => this.logger.error(`Error running job ${job.id}`, err));

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
