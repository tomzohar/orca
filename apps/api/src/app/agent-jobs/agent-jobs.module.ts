import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '../prisma/prisma.module';
import { LlmModule } from '../shared/llm/llm.module';
import { AgentJobsService } from './agent-jobs.service';
import { AgentJobsController } from './api/agent-jobs.controller';
import { PrismaAgentJobsRepository } from './data/repositories/prisma-agent-jobs.repository';
import { AgentType } from './domain/entities/agent-job.entity';
import { AGENT_JOBS_REPOSITORY } from './domain/interfaces/agent-jobs.repository.interface';
import { AGENT_RUNNER } from './domain/interfaces/agent-runner.interface';
import { ARTIFACT_STORAGE } from './domain/interfaces/artifact-storage.interface';
import { DockerAgentRunner } from './execution/services/docker-agent-runner';
import { LocalAgentRunner } from './execution/services/local-agent-runner';
import { DbArtifactStorage } from './storage/services/db-artifact-storage';

@Module({
    imports: [
        PrismaModule,
        EventEmitterModule.forRoot(),
        LlmModule,
    ],
    controllers: [AgentJobsController],
    providers: [
        AgentJobsService,
        LocalAgentRunner,
        DockerAgentRunner,
        {
            provide: AGENT_JOBS_REPOSITORY,
            useClass: PrismaAgentJobsRepository,
        },
        {
            provide: AGENT_RUNNER, // Provide AGENT_RUNNER token
            useFactory: (local: LocalAgentRunner, docker: DockerAgentRunner) => {
                return (type: AgentType) => {
                    if (type === AgentType.CLAUDE_SDK) {
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
})
export class AgentJobsModule { }
