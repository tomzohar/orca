import { ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PROJECTS_REPOSITORY } from '../domain/projects.repository.interface';
import type { IProjectsRepository } from '../domain/projects.repository.interface';
import { Project } from '../domain/project.entity';
import { CreateProjectDto } from '../domain/dtos/create-project.dto';
import type { ProjectDetectionResult, ProjectType } from '../domain/types';
import { existsSync } from 'fs';
import { join } from 'path';
import { UsersService } from '../../users/application/users.service';

@Injectable()
export class ProjectsService {
    private readonly logger = new Logger(ProjectsService.name);

    constructor(
        @Inject(PROJECTS_REPOSITORY)
        private readonly projectsRepository: IProjectsRepository,
        private readonly usersService: UsersService
    ) { }

    async create(dto: CreateProjectDto): Promise<Project> {
        const slug = dto.slug || this.generateSlug(dto.name);

        // Check for existing slug
        const existing = await this.projectsRepository.findBySlug(slug);
        if (existing) {
            throw new ConflictException(`Project with slug '${slug}' already exists`);
        }

        // Create or get Human user for this project
        const owner = await this.usersService.ensureProjectOwner(slug);

        const project = Project.create(
            dto.name,
            slug,
            dto.rootPath,
            owner.id,
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
    private generateSlug(text: string): string {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    /**
     * Generates a human-readable project name from the directory path
     * Uses the basename of the path (last segment)
     */
    private generateProjectNameFromPath(path: string): string {
        const segments = path.split('/').filter(s => s.length > 0);
        return segments[segments.length - 1] || 'project';
    }

    /**
     * Generates a unique slug using parent directory + basename
     * Example: /Users/tom/projects/orca => 'projects-orca'
     */
    private generateUniqueSlug(path: string): string {
        const segments = path.split('/').filter(s => s.length > 0);

        if (segments.length < 2) {
            // Fallback: use only basename if path is too shallow
            return this.generateSlug(segments[segments.length - 1] || 'project');
        }

        // Use last 2 segments for uniqueness: parent-basename
        const parent = segments[segments.length - 2];
        const basename = segments[segments.length - 1];

        return this.generateSlug(`${parent}-${basename}`);
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
            let matchedProject = projects.find(project => project.rootPath === cwd) || null;

            // Detect project type
            const projectType = this.detectProjectType(cwd);

            // Auto-create project if detected but not in DB
            if (!matchedProject && projectType !== 'unknown') {
                this.logger.log(`Auto-creating project for detected ${projectType} project at ${cwd}`);

                const name = this.generateProjectNameFromPath(cwd);
                const slug = this.generateUniqueSlug(cwd);

                // Create or get Human user for this project
                const owner = await this.usersService.ensureProjectOwner(slug);

                const project = Project.create(
                    name,
                    slug,
                    cwd,
                    owner.id
                );

                // Set default includes and excludes
                project.includes = ['**/*'];
                project.excludes = ['**/node_modules/**', '**/.git/**'];

                matchedProject = await this.projectsRepository.create(project);
                this.logger.log(`Auto-created project: ${matchedProject.name} (${matchedProject.slug})`);
            }

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
