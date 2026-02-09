import { Body, Controller, Get, NotFoundException, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from '../application/projects.service';
import { CreateProjectDto } from '../domain/dtos/create-project.dto';
import { DetectProjectResponseDto } from '../domain/dtos/detect-project-response.dto';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new project' })
    @ApiResponse({ status: 201, description: 'The project has been successfully created.' })
    @UsePipes(new ValidationPipe({ transform: true }))
    async create(@Body() createProjectDto: CreateProjectDto) {
        return this.projectsService.create(createProjectDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all projects' })
    async findAll() {
        return this.projectsService.findAll();
    }

    @Get('detect')
    @ApiOperation({ summary: 'Detect current project from working directory' })
    @ApiResponse({
        status: 200,
        description: 'Returns the detected project (or null) and working directory information',
        type: DetectProjectResponseDto
    })
    async detectCurrentProject(): Promise<DetectProjectResponseDto> {
        return this.projectsService.detectProject();
    }

    @Get(':slug')
    @ApiOperation({ summary: 'Get project by slug' })
    async findOne(@Param('slug') slug: string) {
        const project = await this.projectsService.findBySlug(slug);
        if (!project) {
            // return 404, but let's keep it simple for now or throw NotFoundException
            // The service returns null, so we should handle it.
            // For now, let NestJS handle the response (it will be 200 OK with null body or we throw)
            // Ideally: throw new NotFoundException()
            throw new NotFoundException('Project not found');
        }
        return project;
    }
}
