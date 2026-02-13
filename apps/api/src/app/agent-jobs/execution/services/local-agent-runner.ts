import { HumanMessage } from '@langchain/core/messages';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LlmService } from '../../../shared/llm/llm.service';
import { createAgentGraph } from '../../agent/agent.graph';
import {
  AgentJobEntity,
  AgentJobStatus,
  TaskType,
  AgentJobComment,
} from '../../domain/entities/agent-job.entity';
import {
  JobArtifactAddedEvent,
  JobLogAddedEvent,
  JobStatusChangedEvent,
  JobCommentAddedEvent,
} from '../../domain/events/agent-job-events';
import {
  AGENT_JOBS_REPOSITORY,
  type IAgentJobsRepository,
} from '../../domain/interfaces/agent-jobs.repository.interface';
import type { IAgentRunner } from '../../domain/interfaces/agent-runner.interface';
import {
  ARTIFACT_STORAGE,
  type IArtifactStorage,
} from '../../domain/interfaces/artifact-storage.interface';
import { ToolRegistryService } from '../../registry/tool-registry.service';

@Injectable()
export class LocalAgentRunner implements IAgentRunner {
  private readonly logger = new Logger(LocalAgentRunner.name);

  constructor(
    @Inject(AGENT_JOBS_REPOSITORY)
    private readonly repository: IAgentJobsRepository,
    @Inject(ARTIFACT_STORAGE)
    private readonly artifactStorage: IArtifactStorage,
    private readonly eventEmitter: EventEmitter2,
    private readonly llmService: LlmService,
    private readonly toolRegistry: ToolRegistryService,
  ) { }

  async run(job: AgentJobEntity): Promise<void> {
    const startTime = Date.now();
    this.logger.log(`Starting LangGraph job ${job.id} at ${new Date(startTime).toISOString()}`);

    await this.updateStatus(job.id, AgentJobStatus.RUNNING);

    try {
      // 1. Initialize Model
      const model = this.llmService.getModel();

      // 2. Build tool context
      const toolContext = {
        jobId: job.id,
        job,
        projectId: job.projectId,
        projectRootPath: job.project?.rootPath,
        eventCallbacks: {
          onLog: (msg: string) => {
            this.logger.debug(`[Tool: log_progress] message="${msg.substring(0, 100)}${msg.length > 100 ? '...' : ''}"`);
            const log = {
              id: 0,
              jobId: job.id,
              message: msg,
              timestamp: new Date(),
            };
            this.eventEmitter.emit(
              'agent-job.log-added',
              new JobLogAddedEvent(job.id, log),
            );
          },
          onArtifact: (artifactId: number, path: string, filename: string) => {
            this.logger.log(`[Tool: artifact] filename="${filename}", id=${artifactId}`);
            this.eventEmitter.emit(
              'agent-job.artifact-added',
              new JobArtifactAddedEvent(job.id, artifactId, filename, path),
            );
          },
          onComment: (comment: AgentJobComment) => {
            this.logger.log(`[Tool: comment] By ${comment.authorId}`);
            this.eventEmitter.emit(
              'agent-job.comment-added',
              new JobCommentAddedEvent(job.id, comment),
            );
          },
        },
      };

      // 3. Get requested tools for this job
      const requestedTools = this.getRequestedTools(job);
      this.logger.log(`[Setup] Requesting tools: ${requestedTools.join(', ')}`);

      // 4. Create tools using registry
      const tools = this.toolRegistry.createTools(requestedTools, toolContext);
      this.logger.log(`[Setup] Created ${tools.length} tools for job ${job.id}`);

      if (job.project) {
        this.logger.log(`[Setup] Project context: ${job.project.rootPath}`);
      } else {
        this.logger.warn(`Job ${job.id} has no project context. File system tool disabled.`);
      }

      // 5. Create Graph
      const graph = createAgentGraph(model, tools);

      // 6. Execute
      const inputs = {
        messages: [new HumanMessage(job.prompt)],
        jobId: job.id,
      };

      // Stream events from the graph with increased recursion limit for complex tasks
      const stream = await graph.stream(inputs, {
        recursionLimit: 50, // Increased from default 25
      });

      for await (const chunk of stream) {
        // Log graph execution steps for observability
        this.logger.debug(`Graph chunk: ${JSON.stringify(chunk)}`);

        // Process chunk to extract useful information
        // LangGraph chunks contain node updates with messages and state
        if (chunk && typeof chunk === 'object') {
          // Extract node name and content
          const nodeNames = Object.keys(chunk);
          for (const nodeName of nodeNames) {
            const nodeData = chunk[nodeName];

            // Log agent thoughts/actions if available
            if (nodeData?.messages && Array.isArray(nodeData.messages)) {
              for (const message of nodeData.messages) {
                if (message?.content && typeof message.content === 'string') {
                  const content = message.content;
                  // Log significant agent messages to both console and database
                  if (content.length > 0 && !content.startsWith('[Tool:')) {
                    this.logger.log(`[Agent] ${content.substring(0, 200)}${content.length > 200 ? '...' : ''}`);

                    // Also add to job logs so it appears in UI
                    // Only log non-empty, meaningful responses
                    if (content.length > 10) {
                      await this.addLog(job.id, content);
                    }
                  }
                }
              }
            }
          }
        }
      }

      // 7. Complete
      const endTime = Date.now();
      const durationMs = endTime - startTime;
      const durationSec = (durationMs / 1000).toFixed(2);

      this.logger.log(`Job ${job.id} completed successfully in ${durationSec}s`);
      await this.addLog(job.id, `Job Completed successfully. Duration: ${durationSec}s`);
      await this.updateStatus(job.id, AgentJobStatus.COMPLETED);
    } catch (error: unknown) {
      const endTime = Date.now();
      const durationMs = endTime - startTime;
      const durationSec = (durationMs / 1000).toFixed(2);

      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Job ${job.id} failed after ${durationSec}s`, error);
      await this.addLog(job.id, `Job Failed: ${errorMessage} (Duration: ${durationSec}s)`);
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
    const updatedJob = await this.repository.addLog(jobId, message);
    const log = updatedJob.logs[updatedJob.logs.length - 1];
    this.eventEmitter.emit(
      'agent-job.log-added',
      new JobLogAddedEvent(jobId, { ...log, jobId }),
    );
  }

  private getRequestedTools(job: AgentJobEntity): string[] {
    // Base tools for all jobs
    const baseTools = [
      'log_progress',
      'save_artifact',
      'post_comment',
      'read_comments',
    ];

    // Add filesystem tool (registry checks if project exists)
    if (job.projectId) {
      baseTools.push('file_system');
    }

    // Add orchestration tools for orchestrator jobs
    if (job.taskType === TaskType.ORCHESTRATOR) {
      baseTools.push('spawn_job');
      // Future: 'check_child_status', 'collect_results', etc.
    }

    return baseTools;
  }
}
