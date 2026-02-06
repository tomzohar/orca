import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentJobEntity, AgentJobStatus } from './entities/agent-job.entity';
import { AGENT_JOBS_REPOSITORY, IAgentJobsRepository } from './repositories/agent-jobs.repository.interface';

@Injectable()
export class AgentJobsService {
    private readonly logger = new Logger(AgentJobsService.name);

    constructor(
        @Inject(AGENT_JOBS_REPOSITORY)
        private readonly repository: IAgentJobsRepository,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async createJob(prompt: string, assignee?: string): Promise<AgentJobEntity> {
        const job = await this.repository.create({
            prompt,
            assignee,
        });

        this.eventEmitter.emit('agent-job.created', job);

        // Fire and forget async processing
        this.processJob(job.id).catch((err) =>
            this.logger.error(`Error processing job ${job.id}`, err)
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

    // Simulated async processing
    private async processJob(jobId: number) {
        this.logger.log(`Starting job ${jobId}`);

        // Update to RUNNING
        const runningJob = await this.repository.update(jobId, { status: AgentJobStatus.RUNNING });
        this.eventEmitter.emit('agent-job.updated', runningJob);

        // Simulate thinking/steps
        const steps = [
            { msg: 'Analyzing prompt...', delay: 1000 },
            { msg: 'Planning Agent steps...', delay: 1500 },
            { msg: 'Generating code...', delay: 2000 },
            { msg: 'Verifying solution...', delay: 1000 },
        ];

        const logs = [];

        for (const step of steps) {
            await new Promise(resolve => setTimeout(resolve, step.delay));
            const logEntry = {
                message: step.msg,
                timestamp: new Date().toISOString()
            };
            logs.push(logEntry);

            const current = await this.repository.findById(jobId);
            if (current) {
                const updatedJob = await this.repository.update(jobId, {
                    logs: [...(current.logs || []), logEntry]
                });
                this.eventEmitter.emit('agent-job.updated', updatedJob);
            }
        }

        // Final Artifact
        const artifact = {
            filename: 'main.py',
            content: `print("Hello from Agent Job ${jobId}")\n# Prompt: ...`
        };

        // Update to COMPLETED
        const current = await this.repository.findById(jobId);
        const completedJob = await this.repository.update(jobId, {
            status: AgentJobStatus.COMPLETED,
            logs: [...(current?.logs || []), { message: 'Job Completed', timestamp: new Date().toISOString() }],
            artifacts: [artifact]
        });
        this.eventEmitter.emit('agent-job.updated', completedJob);

        this.logger.log(`Job ${jobId} completed`);
    }
}
