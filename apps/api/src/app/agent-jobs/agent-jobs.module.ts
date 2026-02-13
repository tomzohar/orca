import { Module, forwardRef, OnModuleInit } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '../prisma/prisma.module';
import { LlmModule } from '../shared/llm/llm.module';
import { AgentJobsService } from './agent-jobs.service';
import { JobCommentsService } from './application/job-comments.service';
import { AgentJobsController } from './api/agent-jobs.controller';
import { PrismaAgentJobsRepository } from './data/repositories/prisma-agent-jobs.repository';
import { AgentType } from './domain/entities/agent-job.entity';
import { AGENT_JOBS_REPOSITORY } from './domain/interfaces/agent-jobs.repository.interface';
import { AGENT_RUNNER } from './domain/interfaces/agent-runner.interface';
import { ARTIFACT_STORAGE } from './domain/interfaces/artifact-storage.interface';
import { DockerAgentRunner } from './execution/services/docker-agent-runner';
import { LocalAgentRunner } from './execution/services/local-agent-runner';
import { DbArtifactStorage } from './storage/services/db-artifact-storage';
import { ProjectsModule } from '../projects/projects.module';
import { UsersModule } from '../users/users.module';
import { ToolRegistryService } from './registry/tool-registry.service';
import {
  logProgressToolFactory,
  saveArtifactToolFactory,
  fileSystemToolFactory,
  postCommentToolFactory,
  readCommentsToolFactory,
  spawnJobToolFactory,
} from './agent/tools';

@Module({
  imports: [PrismaModule, EventEmitterModule.forRoot(), LlmModule, UsersModule, forwardRef(() => ProjectsModule)],
  controllers: [AgentJobsController],
  providers: [
    AgentJobsService,
    JobCommentsService,
    LocalAgentRunner,
    DockerAgentRunner,
    ToolRegistryService,
    {
      provide: AGENT_JOBS_REPOSITORY,
      useClass: PrismaAgentJobsRepository,
    },
    {
      provide: AGENT_RUNNER, // Provide AGENT_RUNNER token
      useFactory: (local: LocalAgentRunner, docker: DockerAgentRunner) => {
        return (type: AgentType) => {
          if (type === AgentType.DOCKER) {
            return docker;
          }
          return local;
        };
      },
      inject: [LocalAgentRunner, DockerAgentRunner],
    },
    {
      provide: ARTIFACT_STORAGE,
      useClass: DbArtifactStorage,
    },
  ],
  exports: [AgentJobsService, JobCommentsService, ToolRegistryService],
})
export class AgentJobsModule implements OnModuleInit {
  constructor(private readonly toolRegistry: ToolRegistryService) {}

  onModuleInit(): void {
    // Register core tools
    this.toolRegistry.register(logProgressToolFactory);
    this.toolRegistry.register(saveArtifactToolFactory);

    // Register communication tools
    this.toolRegistry.register(postCommentToolFactory);
    this.toolRegistry.register(readCommentsToolFactory);

    // Register filesystem tools
    this.toolRegistry.register(fileSystemToolFactory);

    // Register orchestration tools
    this.toolRegistry.register(spawnJobToolFactory);
  }
}
