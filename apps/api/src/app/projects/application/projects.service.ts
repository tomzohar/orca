import { ConflictException, Inject, Injectable, Logger, NotFoundException, forwardRef } from '@nestjs/common';
import { PROJECTS_REPOSITORY } from '../domain/projects.repository.interface';
import type { IProjectsRepository } from '../domain/projects.repository.interface';
import { Project } from '../domain/project.entity';
import { CreateProjectDto } from '../domain/dtos/create-project.dto';
import type { ProjectDetectionResult, ProjectType } from '../domain/types';
import { existsSync } from 'fs';
import { join } from 'path';
import { UsersService } from '../../users/application/users.service';
import { AgentConfigurationsService } from '../../agent-configurations/application/agent-configurations.service';
import { AgentType } from '../../agent-jobs/domain/entities/agent-job.entity';

@Injectable()
export class ProjectsService {
    private readonly logger = new Logger(ProjectsService.name);

    constructor(
        @Inject(PROJECTS_REPOSITORY)
        private readonly projectsRepository: IProjectsRepository,
        private readonly usersService: UsersService,
        @Inject(forwardRef(() => AgentConfigurationsService))
        private readonly agentConfigurationsService: AgentConfigurationsService
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

        const createdProject = await this.projectsRepository.create(project);

        // Create default coding agent configuration for the project
        await this.createDefaultAgentConfiguration(createdProject);

        return createdProject;
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

                // Create default coding agent configuration for the new project
                await this.createDefaultAgentConfiguration(matchedProject);
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

    /**
     * Creates a default "Coding Agent" configuration for a new project
     * This is called automatically when a project is initialized
     */
    private async createDefaultAgentConfiguration(project: Project): Promise<void> {
        try {
            // Check if a coding agent config already exists for this project
            const existingConfigs = await this.agentConfigurationsService.findByProject(project.id);
            const codingAgentExists = existingConfigs.some(config =>
                config.slug === 'coding-agent'
            );

            if (codingAgentExists) {
                this.logger.log(`Coding Agent configuration already exists for project: ${project.name}`);
                return;
            }

            // Create default coding agent configuration
            const defaultConfig = {
                name: 'Coding Agent',
                description: 'Default coding assistant for development tasks',
                systemPrompt: `You are an expert software engineer and coding assistant. Your role is to:
- Write clean, maintainable, and well-documented code
- Follow best practices and design patterns
- Provide clear explanations for your decisions
- Test your code thoroughly
- Help debug and fix issues efficiently`,
                rules: `- Always write type-safe code with proper type annotations
- Follow the project's existing code style and conventions
- Write unit tests for new functionality
- Document complex logic with clear comments
- Ask for clarification when requirements are unclear`,
                skills: [], // Empty for now, can be populated later
                agentType: AgentType.DOCKER, // Use Docker for isolation by default
                projectId: project.id,
                userId: project.ownerId,
                isActive: true,
            };

            await this.agentConfigurationsService.create(defaultConfig);
            this.logger.log(`Created default Coding Agent configuration for project: ${project.name}`);
        } catch (error) {
            // Don't fail project creation if agent config creation fails
            this.logger.error(`Failed to create default agent configuration: ${error.message}`, error.stack);
        }
    }
}
