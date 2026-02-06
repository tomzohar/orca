import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AgentJobsController } from './agent-jobs.controller';
import { AgentJobsService } from './agent-jobs.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AGENT_JOBS_REPOSITORY } from './repositories/agent-jobs.repository.interface';
import { PrismaAgentJobsRepository } from './repositories/prisma-agent-jobs.repository';

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
    ],
})
export class AgentJobsModule { }
