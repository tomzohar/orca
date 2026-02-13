import { Inject, Injectable, Logger } from '@nestjs/common';
import { DynamicStructuredTool } from '@langchain/core/tools';
import {
  AGENT_JOBS_REPOSITORY,
  type IAgentJobsRepository,
} from '../domain/interfaces/agent-jobs.repository.interface';
import {
  ARTIFACT_STORAGE,
  type IArtifactStorage,
} from '../domain/interfaces/artifact-storage.interface';
import type { AgentJobEntity, AgentJobComment } from '../domain/entities/agent-job.entity';

export enum ToolCategory {
  CORE = 'core',
  FILESYSTEM = 'filesystem',
  ORCHESTRATION = 'orchestration',
  COMMUNICATION = 'communication',
}

export interface ToolRequirements {
  projectRequired?: boolean;
  repositoryRequired?: boolean;
  storageRequired?: boolean;
}

export interface ToolMetadata {
  name: string;
  description: string;
  category: ToolCategory;
  requirements?: ToolRequirements;
}

export interface ToolContext {
  jobId: number;
  job?: AgentJobEntity;
  projectId?: number;
  projectRootPath?: string;
  repository: IAgentJobsRepository;
  artifactStorage: IArtifactStorage;
  eventCallbacks: {
    onLog: (message: string) => void;
    onArtifact: (id: number, path: string, filename: string) => void;
    onComment: (comment: AgentJobComment) => void;
  };
}

export interface ToolFactory {
  metadata: ToolMetadata;
  canActivate?: (context: ToolContext) => boolean;
  create: (context: ToolContext) => DynamicStructuredTool;
}

@Injectable()
export class ToolRegistryService {
  private readonly logger = new Logger(ToolRegistryService.name);
  private readonly registry = new Map<string, ToolFactory>();

  constructor(
    @Inject(AGENT_JOBS_REPOSITORY) private readonly repository: IAgentJobsRepository,
    @Inject(ARTIFACT_STORAGE) private readonly artifactStorage: IArtifactStorage,
  ) {}

  register(factory: ToolFactory): void {
    if (this.registry.has(factory.metadata.name)) {
      this.logger.warn(`Tool "${factory.metadata.name}" already registered, overwriting`);
    }
    this.registry.set(factory.metadata.name, factory);
    this.logger.log(`Registered tool: ${factory.metadata.name} (${factory.metadata.category})`);
  }

  createTools(
    toolNames: string[],
    baseContext: Omit<ToolContext, 'repository' | 'artifactStorage'>
  ): DynamicStructuredTool[] {
    const context: ToolContext = {
      ...baseContext,
      repository: this.repository,
      artifactStorage: this.artifactStorage,
    };

    const tools: DynamicStructuredTool[] = [];

    for (const name of toolNames) {
      const factory = this.registry.get(name);
      if (!factory) {
        this.logger.warn(`Tool "${name}" not found in registry`);
        continue;
      }

      if (factory.canActivate && !factory.canActivate(context)) {
        this.logger.debug(`Tool "${name}" activation check failed, skipping`);
        continue;
      }

      try {
        const tool = factory.create(context);
        tools.push(tool);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to create tool "${name}": ${errorMessage}`);
      }
    }

    this.logger.log(`Created ${tools.length}/${toolNames.length} tools`);
    return tools;
  }

  getToolsByCategory(category: ToolCategory): string[] {
    return Array.from(this.registry.values())
      .filter(f => f.metadata.category === category)
      .map(f => f.metadata.name);
  }

  getAllToolNames(): string[] {
    return Array.from(this.registry.keys());
  }
}
