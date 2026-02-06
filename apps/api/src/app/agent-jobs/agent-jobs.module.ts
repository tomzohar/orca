import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AgentJobsController } from './agent-jobs.controller';
import { AgentJobsService } from './agent-jobs.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AGENT_JOBS_REPOSITORY } from './repositories/agent-jobs.repository.interface';
import { PrismaAgentJobsRepository } from './repositories/prisma-agent-jobs.repository';
import { AGENT_RUNNER } from './interfaces/agent-runner.interface';
import { SimulatedAgentRunner } from './services/simulated-agent-runner';
import { ARTIFACT_STORAGE } from './interfaces/artifact-storage.interface';
import { DbArtifactStorage } from './services/db-artifact-storage';

@Module({
    imports: [
        PrismaModule,
        EventEmitterModule.forRoot(),
    ],
    controllers: [AgentJobsController],
    providers: [
        AgentJobsService,
        {
            provide: AGENT_JOBS_REPOSITORY,
            useClass: PrismaAgentJobsRepository,
        },
        {
            provide: AGENT_RUNNER,
            useClass: SimulatedAgentRunner,
        },
        {
            provide: ARTIFACT_STORAGE,
            useClass: DbArtifactStorage,
        },
    ],
})
export class AgentJobsModule { }
