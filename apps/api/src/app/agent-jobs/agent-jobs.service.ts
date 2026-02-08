import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentJobEntity, AgentType } from './domain/entities/agent-job.entity';
import { JobCreatedEvent } from './domain/events/agent-job-events';
import { AGENT_JOBS_REPOSITORY, type IAgentJobsRepository } from './domain/interfaces/agent-jobs.repository.interface';
import { AGENT_RUNNER, type IAgentRunner } from './domain/interfaces/agent-runner.interface';

@Injectable()
export class AgentJobsService {
    private readonly logger = new Logger(AgentJobsService.name);

    constructor(
        @Inject(AGENT_JOBS_REPOSITORY)
        private readonly repository: IAgentJobsRepository,
        @Inject(AGENT_RUNNER)
        private readonly runnerFactory: (type: AgentType) => IAgentRunner,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async createJob(prompt: string, assignee?: string, type: AgentType = AgentType.LANGGRAPH): Promise<AgentJobEntity> {
        const job = await this.repository.create({
            prompt,
            assignee,
            type,
        });

        this.eventEmitter.emit('agent-job.created', new JobCreatedEvent(job));

        // Fire and forget async processing
        const runner = this.runnerFactory(job.type);
        runner.run(job).catch((err) =>
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
