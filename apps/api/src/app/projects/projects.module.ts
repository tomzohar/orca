import { Module } from '@nestjs/common';
import { ProjectsController } from './api/projects.controller';
import { ProjectsService, PROJECTS_REPOSITORY } from './application/projects.service';
import { PrismaProjectsRepository } from './data/prisma-projects.repository';
import { PrismaModule } from '../prisma/prisma.module'; // Adjust path if needed

@Module({
    imports: [PrismaModule],
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
