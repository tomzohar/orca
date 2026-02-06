import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentJobEntity, AgentJobStatus } from '../entities/agent-job.entity';
import { JobArtifactAddedEvent, JobLogAddedEvent, JobStatusChangedEvent } from '../events/agent-job-events';
import { IAgentRunner } from '../interfaces/agent-runner.interface';
import { ARTIFACT_STORAGE, IArtifactStorage } from '../interfaces/artifact-storage.interface';
import { AGENT_JOBS_REPOSITORY, IAgentJobsRepository } from '../repositories/agent-jobs.repository.interface';
import { LlmService } from '../../shared/llm/llm.service';
import { createLogTool } from '../agent/tools/log-progress.tool';
import { createSaveArtifactTool } from '../agent/tools/save-artifact.tool';
import { createAgentGraph } from '../agent/agent.graph';
import { HumanMessage } from '@langchain/core/messages';

@Injectable()
export class LangGraphAgentRunner implements IAgentRunner {
    private readonly logger = new Logger(LangGraphAgentRunner.name);

    constructor(
        @Inject(AGENT_JOBS_REPOSITORY)
        private readonly repository: IAgentJobsRepository,
        @Inject(ARTIFACT_STORAGE)
        private readonly artifactStorage: IArtifactStorage,
        private readonly eventEmitter: EventEmitter2,
        private readonly llmService: LlmService,
    ) { }

    async run(job: AgentJobEntity): Promise<void> {
        this.logger.log(`Starting LangGraph job ${job.id}`);

        await this.updateStatus(job.id, AgentJobStatus.RUNNING);

        try {
            // 1. Initialize Model
            const model = this.llmService.getModel();

            // 2. Initialize Tools
            const logTool = createLogTool(job.id, this.repository, (msg) => {
                // We also emit the event here if the tool is called
                const log = { id: 0, jobId: job.id, message: msg, timestamp: new Date() }; // Mock ID/Date for event
                this.eventEmitter.emit(
                    'agent-job.log-added',
                    new JobLogAddedEvent(job.id, log)
                );
            });

            const artifactTool = createSaveArtifactTool(job.id, this.artifactStorage, (path, filename) => {
                // We need to fetch the artifact ID properly, but for now we might need to query or assume.
                // The tool stores it, but we need the ID for the event.
                // Let's rely on the storage returning the path, and we might need to look it up or change the interface.
                // For now, let's parse the ID from the path if it's db://<id>
                let artifactId = 0;
                if (path.startsWith('db://')) {
                    artifactId = parseInt(path.replace('db://', ''), 10);
                }

                this.eventEmitter.emit(
                    'agent-job.artifact-added',
                    new JobArtifactAddedEvent(job.id, artifactId, filename, path)
                );
            });

            const tools = [logTool, artifactTool];

            // 3. Create Graph
            const graph = createAgentGraph(model, tools);

            // 4. Execute
            const inputs = {
                messages: [
                    new HumanMessage(job.prompt),
                ],
                jobId: job.id,
            };

            // Stream events from the graph
            const stream = await graph.stream(inputs);

            for await (const chunk of stream) {
                // We can log internal graph steps if needed
                // For now, we rely on the tools to emit user-facing logs
                this.logger.debug(`Graph chunk: ${JSON.stringify(chunk)}`);
            }

            // 5. Complete
            await this.addLog(job.id, 'Job Completed successfully.');
            await this.updateStatus(job.id, AgentJobStatus.COMPLETED);

        } catch (error) {
            this.logger.error(`Job ${job.id} failed`, error);
            await this.addLog(job.id, `Job Failed: ${error.message}`);
            await this.updateStatus(job.id, AgentJobStatus.FAILED);
        }
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
        const log = updatedJob.logs[updatedJob.logs.length - 1];
        this.eventEmitter.emit(
            'agent-job.log-added',
            new JobLogAddedEvent(jobId, { ...log, jobId })
        );
    }
}
