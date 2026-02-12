import { Module, forwardRef } from '@nestjs/common';
import { ProjectsController } from './api/projects.controller';
import { ProjectsService } from './application/projects.service';
import { PROJECTS_REPOSITORY } from './domain/projects.repository.interface';
import { PrismaProjectsRepository } from './data/prisma-projects.repository';
import { PrismaModule } from '../prisma/prisma.module'; // Adjust path if needed
import { AgentJobsModule } from '../agent-jobs/agent-jobs.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [PrismaModule, UsersModule, forwardRef(() => AgentJobsModule)],
    controllers: [ProjectsController],
    providers: [
        ProjectsService,
        {
            provide: PROJECTS_REPOSITORY,
            useClass: PrismaProjectsRepository,
        },
    ],
    exports: [ProjectsService],
})
export class ProjectsModule { }
