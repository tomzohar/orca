import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AgentConfigurationsController } from './api/agent-configurations.controller';
import { AgentConfigurationsService } from './application/agent-configurations.service';
import { PrismaAgentConfigurationsRepository } from './data/prisma-agent-configurations.repository';
import { AGENT_CONFIGURATIONS_REPOSITORY } from './domain/agent-configurations.repository.interface';

@Module({
    imports: [PrismaModule],
    controllers: [AgentConfigurationsController],
    providers: [
        AgentConfigurationsService,
        {
            provide: AGENT_CONFIGURATIONS_REPOSITORY,
            useClass: PrismaAgentConfigurationsRepository,
        },
    ],
    exports: [AgentConfigurationsService],
})
export class AgentConfigurationsModule {}
