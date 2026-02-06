import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentJobEntity, AgentJobStatus } from '../entities/agent-job.entity';
import { JobArtifactAddedEvent, JobLogAddedEvent, JobStatusChangedEvent } from '../events/agent-job-events';
import { IAgentRunner } from '../interfaces/agent-runner.interface';
import { ARTIFACT_STORAGE, IArtifactStorage } from '../interfaces/artifact-storage.interface';
import { AGENT_JOBS_REPOSITORY, IAgentJobsRepository } from '../repositories/agent-jobs.repository.interface';

@Injectable()
export class SimulatedAgentRunner implements IAgentRunner {
    private readonly logger = new Logger(SimulatedAgentRunner.name);

    constructor(
        @Inject(AGENT_JOBS_REPOSITORY)
        private readonly repository: IAgentJobsRepository,
        @Inject(ARTIFACT_STORAGE)
        private readonly artifactStorage: IArtifactStorage,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async run(job: AgentJobEntity): Promise<void> {
        this.logger.log(`Starting job ${job.id}`);

        await this.updateStatus(job.id, AgentJobStatus.RUNNING);

        const steps = [
            { msg: 'Analyzing prompt...', delay: 1000 },
            { msg: 'Planning Agent steps...', delay: 1500 },
            { msg: 'Generating code...', delay: 2000 },
            { msg: 'Verifying solution...', delay: 1000 },
        ];

        for (const step of steps) {
            await new Promise((resolve) => setTimeout(resolve, step.delay));
            await this.addLog(job.id, step.msg);
        }

        // Create Artifact
        const content = `print("Hello from Agent Job ${job.id}")\n# Prompt: ${job.prompt}`;
        const filename = 'main.py';

        const path = await this.artifactStorage.store(job.id, filename, content);

        // Parse ID from path db://<id>
        const artifactId = parseInt(path.replace('db://', ''), 10);

        this.eventEmitter.emit(
            'agent-job.artifact-added',
            new JobArtifactAddedEvent(job.id, artifactId, filename, path)
        );

        // Complete
        await this.addLog(job.id, 'Job Completed');
        await this.updateStatus(job.id, AgentJobStatus.COMPLETED);

        this.logger.log(`Job ${job.id} completed`);
    }

    private async updateStatus(jobId: number, status: AgentJobStatus) {
        const updatedJob = await this.repository.update(jobId, { status });
        this.eventEmitter.emit(
            'agent-job.status-changed',
            new JobStatusChangedEvent(jobId, status, updatedJob)
        );
    }

    private async addLog(jobId: number, message: string) {
        const updatedJob = await this.repository.addLog(jobId, message);
        const log = updatedJob.logs[updatedJob.logs.length - 1]; // Assume last
        this.eventEmitter.emit(
            'agent-job.log-added',
            new JobLogAddedEvent(jobId, { ...log, jobId })
        );
    }
}
