import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { spawn } from 'child_process';
import * as path from 'path';
import { AgentJobEntity, AgentJobStatus } from '../entities/agent-job.entity';
import { JobLogAddedEvent, JobStatusChangedEvent } from '../events/agent-job-events';
import { IAgentRunner } from '../interfaces/agent-runner.interface';
import { AGENT_JOBS_REPOSITORY, IAgentJobsRepository } from '../repositories/agent-jobs.repository.interface';

@Injectable()
export class DockerAgentRunner implements IAgentRunner {
    private readonly logger = new Logger(DockerAgentRunner.name);

    constructor(
        @Inject(AGENT_JOBS_REPOSITORY)
        private readonly repository: IAgentJobsRepository,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async run(job: AgentJobEntity): Promise<void> {
        this.logger.log(`Starting Docker job ${job.id}`);
        await this.updateStatus(job.id, AgentJobStatus.RUNNING);

        try {
            // Project Root (where the monorepo lives)
            // Assuming this service runs in /app/apps/api/src/...
            // We need to resolve the root of the repo.
            const projectRoot = path.resolve(process.cwd()); // This should be the repo root if run via nx

            this.logger.log(`Mounting project root: ${projectRoot}`);

            // Prepare Environment Variables for the container
            const startCommand = JSON.stringify({
                type: 'job',
                jobId: job.id,
                prompt: job.prompt
            });

            // Spawn Docker Process
            // -v: Bind mount project root to /app
            // -e: Pass Agent config
            // orca-agent:latest: The image we built
            const dockerProcess = spawn('docker', [
                'run',
                '--rm', // Remove container after exit
                '-v', `${projectRoot}:/app`,
                '-w', '/app',
                '-e', `ANTHROPIC_API_KEY=${process.env.ANTHROPIC_API_KEY}`,
                // Pass instruction as ENV for now, or CMD
                '-e', `AGENT_INSTRUCTION=${job.prompt}`,
                'orca-agent:latest',
                // TODO: The actual command to run inside (e.g., python main.py)
                // For MVP, just echoing to prove it works
                'echo', `"[AGENT] Received instruction: ${job.prompt}"`
            ]);

            // Stream Logs
            dockerProcess.stdout.on('data', async (data) => {
                const message = data.toString().trim();
                // Filter empty lines
                if (message) {
                    this.logger.log(`[Docker] ${message}`);
                    await this.addLog(job.id, message);
                }
            });

            dockerProcess.stderr.on('data', async (data) => {
                const message = data.toString().trim();
                if (message) {
                    this.logger.error(`[Docker Error] ${message}`);
                    await this.addLog(job.id, `[STDERR] ${message}`);
                }
            });

            // Wait for exit
            const exitCode = await new Promise<number>((resolve) => {
                dockerProcess.on('close', (code) => {
                    resolve(code ?? 0);
                });
            });

            if (exitCode === 0) {
                await this.addLog(job.id, 'Job Completed successfully (Container Exited 0).');
                await this.updateStatus(job.id, AgentJobStatus.COMPLETED);
            } else {
                await this.addLog(job.id, `Job Failed (Container Exited ${exitCode}).`);
                await this.updateStatus(job.id, AgentJobStatus.FAILED);
            }

        } catch (error) {
            this.logger.error(`Job ${job.id} failed to launch Docker`, error);
            await this.addLog(job.id, `System Error: ${error.message}`);
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
        // Optimization: Batch logs or debounce in production
        const updatedJob = await this.repository.addLog(jobId, message);
        const log = updatedJob.logs[updatedJob.logs.length - 1];
        this.eventEmitter.emit(
            'agent-job.log-added',
            new JobLogAddedEvent(jobId, { ...log, jobId })
        );
    }
}
