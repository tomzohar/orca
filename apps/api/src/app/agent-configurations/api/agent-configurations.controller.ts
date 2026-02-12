import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AgentConfigurationsService } from '../application/agent-configurations.service';
import { CreateAgentConfigurationDto } from '../domain/dtos/create-agent-configuration.dto';
import { UpdateAgentConfigurationDto } from '../domain/dtos/update-agent-configuration.dto';

@ApiTags('agent-configurations')
@Controller('agent-configurations')
export class AgentConfigurationsController {
    constructor(private readonly service: AgentConfigurationsService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new agent configuration' })
    @ApiResponse({ status: 201, description: 'The configuration has been successfully created.' })
    @UsePipes(new ValidationPipe({ transform: true }))
    async create(@Body() dto: CreateAgentConfigurationDto) {
        return this.service.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all agent configurations or filter by project' })
    @ApiQuery({ name: 'projectId', required: false, type: Number })
    async findAll(@Query('projectId', new ParseIntPipe({ optional: true })) projectId?: number) {
        if (projectId) {
            return this.service.findByProject(projectId);
        }
        return this.service.findAll();
    }

    @Get(':idOrSlug')
    @ApiOperation({ summary: 'Get agent configuration by ID or slug' })
    async findOne(@Param('idOrSlug') idOrSlug: string) {
        const id = parseInt(idOrSlug, 10);

        // Try by ID first
        if (!isNaN(id)) {
            try {
                return await this.service.findOne(id);
            } catch (error) {
                // Fall through to slug lookup
            }
        }

        // Try by slug
        const config = await this.service.findBySlug(idOrSlug);
        if (!config) {
            throw new NotFoundException('Agent configuration not found');
        }
        return config;
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update an agent configuration' })
    @UsePipes(new ValidationPipe({ transform: true }))
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateAgentConfigurationDto
    ) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an agent configuration' })
    @ApiResponse({ status: 200, description: 'The configuration has been successfully deleted.' })
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.service.delete(id);
        return { message: 'Agent configuration deleted successfully' };
    }
}
