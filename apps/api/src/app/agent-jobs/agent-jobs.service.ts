import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentJobEntity } from './entities/agent-job.entity';
import { AGENT_JOBS_REPOSITORY, IAgentJobsRepository } from './repositories/agent-jobs.repository.interface';
import { AGENT_RUNNER, IAgentRunner } from './interfaces/agent-runner.interface';
import { JobCreatedEvent } from './events/agent-job-events';

@Injectable()
export class AgentJobsService {
    private readonly logger = new Logger(AgentJobsService.name);

    constructor(
        @Inject(AGENT_JOBS_REPOSITORY)
        private readonly repository: IAgentJobsRepository,
        @Inject(AGENT_RUNNER)
        private readonly runner: IAgentRunner,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async createJob(prompt: string, assignee?: string): Promise<AgentJobEntity> {
        const job = await this.repository.create({
            prompt,
            assignee,
        });

        this.eventEmitter.emit('agent-job.created', new JobCreatedEvent(job));

        // Fire and forget async processing
        this.runner.run(job).catch((err) =>
            this.logger.error(`Error running job ${job.id}`, err)
        );

        return job;
    }

    async getJobs(assignee?: string): Promise<AgentJobEntity[]> {
        return this.repository.findAll({ assignee });
    }

    async getJob(id: number): Promise<AgentJobEntity> {
        const job = await this.repository.findById(id);
        if (!job) {
            throw new NotFoundException(`Job with ID ${id} not found`);
        }
        return job;
    }
}
