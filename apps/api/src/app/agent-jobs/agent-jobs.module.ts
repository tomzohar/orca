import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AgentJobsController } from './agent-jobs.controller';
import { AgentJobsService } from './agent-jobs.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AGENT_JOBS_REPOSITORY } from './repositories/agent-jobs.repository.interface';
import { PrismaAgentJobsRepository } from './repositories/prisma-agent-jobs.repository';
import { AGENT_RUNNER } from './interfaces/agent-runner.interface';
import { LocalAgentRunner } from './services/local-agent-runner';
import { DockerAgentRunner } from './services/docker-agent-runner';
import { ARTIFACT_STORAGE } from './interfaces/artifact-storage.interface';
import { DbArtifactStorage } from './services/db-artifact-storage';
import { LlmModule } from '../shared/llm/llm.module';
import { AgentType } from './entities/agent-job.entity';

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
