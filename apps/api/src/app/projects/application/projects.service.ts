import { ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IProjectsRepository } from '../domain/projects.repository.interface';
import { Project } from '../domain/project.entity';
import { CreateProjectDto } from '../domain/dtos/create-project.dto';

// Define a token for DI
export const PROJECTS_REPOSITORY = 'PROJECTS_REPOSITORY';

@Injectable()
export class ProjectsService {
    private readonly logger = new Logger(ProjectsService.name);

    constructor(
        @Inject(PROJECTS_REPOSITORY)
        private readonly projectsRepository: IProjectsRepository
    ) { }

    async create(dto: CreateProjectDto): Promise<Project> {
        const slug = dto.slug || this.generateSlug(dto.name);

        // Check for existing slug
        const existing = await this.projectsRepository.findBySlug(slug);
        if (existing) {
            throw new ConflictException(`Project with slug '${slug}' already exists`);
        }

        const project = Project.create(
            dto.name,
            slug,
            dto.rootPath,
            dto.description
        );

        // Override defaults if provided
        if (dto.includes) project.includes = dto.includes;
        if (dto.excludes) project.excludes = dto.excludes;

        return this.projectsRepository.create(project);
    }

    async findAll(): Promise<Project[]> {
        return this.projectsRepository.findAll();
    }

    async findOne(id: number): Promise<Project | null> {
        return this.projectsRepository.findById(id);
    }

    async findBySlug(slug: string): Promise<Project | null> {
        return this.projectsRepository.findBySlug(slug);
    }

    // Helper methods
    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    async getDefaultProject(): Promise<Project> {
        const projects = await this.findAll();
        if (projects.length > 0) {
            return projects[0];
        }
        throw new NotFoundException('No projects found. Please create a project first.');
    }
}
