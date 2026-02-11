import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { spawn } from 'child_process';
import * as path from 'path';
import {
  AgentJobEntity,
  AgentJobStatus,
} from '../../domain/entities/agent-job.entity';
import {
  JobArtifactAddedEvent,
  JobLogAddedEvent,
  JobStatusChangedEvent,
} from '../../domain/events/agent-job-events';
import {
  AGENT_JOBS_REPOSITORY,
  type IAgentJobsRepository,
} from '../../domain/interfaces/agent-jobs.repository.interface';
import type { IAgentRunner } from '../../domain/interfaces/agent-runner.interface';
import { AskUserMatcher } from '../matchers/ask-user.matcher';
import {
  LogMatcher,
  LogMatcherContext,
} from '../matchers/log-matcher.interface';
import { ToolUseMatcher } from '../matchers/tool-use.matcher';

@Injectable()
export class DockerAgentRunner implements IAgentRunner {
  private readonly logger = new Logger(DockerAgentRunner.name);

  constructor(
    @Inject(AGENT_JOBS_REPOSITORY)
    private readonly repository: IAgentJobsRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
  ) { }

  private readonly matchers: LogMatcher[] = [
    new AskUserMatcher(),
    new ToolUseMatcher(),
  ];

  async run(job: AgentJobEntity): Promise<void> {
    this.logger.log(`Starting Docker job ${job.id}`);

    // Fail fast if the API key is missing or clearly invalid
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY')?.trim();
    if (!apiKey || !apiKey.startsWith('sk-ant-')) {
      const msg =
        'Missing or invalid ANTHROPIC_API_KEY. Ensure a valid Anthropic API key is set in your .env file.';
      this.logger.error(msg);
      await this.addLog(job.id, `Configuration Error: ${msg}`);
      await this.updateStatus(job.id, AgentJobStatus.FAILED);
      return;
    }

    await this.updateStatus(job.id, AgentJobStatus.RUNNING);

    let isWaitingForUser = false;
    try {
      const projectRoot = job.project?.rootPath ?? process.cwd();
      this.logger.log(`Project root: ${projectRoot}`);

      const dockerProcess = spawn('docker', [
        'run',
        '--rm',
        '-v',
        `${projectRoot}:/app`,
        '-w',
        '/app',
        '-e',
        `ANTHROPIC_API_KEY=${apiKey}`,
        '-e',
        `AGENT_INSTRUCTION=${job.prompt}`,
        'orca-agent:latest',
        'npx',
        'tsx',
        '/agent/src/main.ts',
      ]);

      // Start File Watcher
      const fs = await import('fs');
      const fileUpdateTimes = new Map<string, number>();

      const watcher = fs.watch(
        projectRoot,
        { recursive: true },
        async (eventType, filename) => {
          if (
            !filename ||
            filename.includes('.git') ||
            filename.includes('node_modules') ||
            filename.includes('.nx') ||
            filename === '.env'
          )
            return;

          const fullPath = path.resolve(projectRoot, filename);
          const now = Date.now();

          // Debounce: Ignore updates if less than 500ms has passed since last update
          if (fileUpdateTimes.has(fullPath)) {
            const lastUpdate = fileUpdateTimes.get(fullPath);
            if (now - lastUpdate < 500) {
              return;
            }
          }

          // Debounce/Check existence
          try {
            if (fs.existsSync(fullPath)) {
              const stat = fs.statSync(fullPath);
              if (stat.isFile()) {
                // Update timestamp immediately to block subsequent events
                fileUpdateTimes.set(fullPath, now);

                const content = fs.readFileSync(fullPath, 'utf-8');
                // Create artifact
                this.logger.debug(
                  `[File Watcher] Detected change in ${filename}`,
                );
                await this.addArtifact(job.id, filename, content);
              }
            }
          } catch (err) {
            this.logger.error(`Error processing file change: ${filename}`, err);
          }
        },
      );

      // Stream Logs
      dockerProcess.stdout.on('data', async (data) => {
        const message = data.toString().trim();
        if (message) {
          this.logger.log(`[Docker] ${message}`);
          await this.addLog(job.id, message);

          // Execute Matchers
          const context: LogMatcherContext = {
            job,
            log: async (msg) => {
              this.logger.log(msg);
            },
            updateStatus: async (status) =>
              await this.updateStatus(job.id, status as AgentJobStatus),
            setIsWaitingForUser: (val) => {
              isWaitingForUser = val;
            },
          };

          for (const matcher of this.matchers) {
            const match = matcher.match(message);
            if (match) {
              await matcher.handle(context, match);
            }
          }
        }
      });

      dockerProcess.stderr.on('data', async (data) => {
        const message = data.toString().trim();
        if (message) {
          this.logger.error(`[Docker Error] ${message}`);
          await this.addLog(job.id, `ERROR: ${message}`);
        }
      });

      // Wait for exit
      const exitCode = await new Promise<number>((resolve) => {
        dockerProcess.on('close', (code) => {
          watcher.close();
          resolve(code ?? 0);
        });
      });

      if (exitCode === 0) {
        if (!isWaitingForUser) {
          await this.addLog(
            job.id,
            'Job Completed successfully (Container Exited 0).',
          );
          await this.updateStatus(job.id, AgentJobStatus.COMPLETED);
        } else {
          await this.addLog(job.id, 'Job Waiting for User Feedback.');
        }
      } else {
        await this.addLog(job.id, `Job Failed (Container Exited ${exitCode}).`);
        await this.updateStatus(job.id, AgentJobStatus.FAILED);
      }
    } catch (error) {
      this.logger.error(`Job ${job.id} failed to launch Docker`, error);
      await this.addLog(
        job.id,
        `System Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      await this.updateStatus(job.id, AgentJobStatus.FAILED);
    }
  }

  private async updateStatus(jobId: number, status: AgentJobStatus) {
    const updatedJob = await this.repository.update(jobId, { status });
    this.eventEmitter.emit(
      'agent-job.status-changed',
      new JobStatusChangedEvent(jobId, status, updatedJob),
    );
  }

  private async addLog(jobId: number, message: string) {
    // Optimization: Batch logs or debounce in production
    const updatedJob = await this.repository.addLog(jobId, message);
    const log = updatedJob.logs[updatedJob.logs.length - 1];
    this.eventEmitter.emit(
      'agent-job.log-added',
      new JobLogAddedEvent(jobId, { ...log, jobId }),
    );
  }

  private async addArtifact(jobId: number, filename: string, content: string) {
    const updatedJob = await this.repository.addArtifact(jobId, {
      filename,
      content,
    });
    // Assuming the new artifact is the last one
    const artifact = updatedJob.artifacts[updatedJob.artifacts.length - 1];
    if (artifact) {
      this.eventEmitter.emit(
        'agent-job.artifact-added',
        new JobArtifactAddedEvent(
          jobId,
          artifact.id,
          filename,
          `db://${artifact.id}`,
        ),
      );
    }
  }
}
