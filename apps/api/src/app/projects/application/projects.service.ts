import { ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IProjectsRepository } from '../domain/projects.repository.interface';
import { Project } from '../domain/project.entity';
import { CreateProjectDto } from '../domain/dtos/create-project.dto';
import type { ProjectDetectionResult, ProjectType } from '../domain/types';
import { existsSync } from 'fs';
import { join } from 'path';

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

    /**
     * Detects the current project based on working directory
     * @returns ProjectDetectionResult with matched project (or null) and working directory info
     */
    async detectProject(): Promise<ProjectDetectionResult> {
        const cwd = process.cwd();

        try {
            // Fetch all projects from repository
            const projects = await this.projectsRepository.findAll();

            // Find exact match: cwd === project.rootPath
            const matchedProject = projects.find(project => project.rootPath === cwd) || null;

            // Detect project type
            const projectType = this.detectProjectType(cwd);

            return {
                project: matchedProject,
                workingDirectory: {
                    path: cwd,
                    projectType
                }
            };
        } catch (error) {
            // Log error but don't throw - always return a valid response
            this.logger.error(`Error detecting project: ${error.message}`, error.stack);

            return {
                project: null,
                workingDirectory: {
                    path: cwd,
                    projectType: 'unknown'
                }
            };
        }
    }

    /**
     * Detects project type based on marker files in the given directory
     * Priority: typescript > javascript > python > unknown
     */
    private detectProjectType(dirPath: string): ProjectType {
        try {
            // Check for TypeScript (highest priority)
            if (existsSync(join(dirPath, 'tsconfig.json'))) {
                return 'typescript';
            }

            // Check for JavaScript (must not have tsconfig.json)
            if (existsSync(join(dirPath, 'package.json'))) {
                return 'javascript';
            }

            // Check for Python
            const pythonMarkers = ['requirements.txt', 'pyproject.toml', 'setup.py'];
            for (const marker of pythonMarkers) {
                if (existsSync(join(dirPath, marker))) {
                    return 'python';
                }
            }

            return 'unknown';
        } catch (error) {
            // If file system check fails, default to unknown
            this.logger.warn(`Error detecting project type: ${error.message}`);
            return 'unknown';
        }
    }
}
