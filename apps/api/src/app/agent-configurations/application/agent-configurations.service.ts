import { ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { CreateAgentConfigurationDto } from '../domain/dtos/create-agent-configuration.dto';
import type { UpdateAgentConfigurationDto } from '../domain/dtos/update-agent-configuration.dto';
import { AgentConfiguration } from '../domain/agent-configuration.entity';
import {
    AGENT_CONFIGURATIONS_REPOSITORY,
    type IAgentConfigurationsRepository,
} from '../domain/agent-configurations.repository.interface';

@Injectable()
export class AgentConfigurationsService {
    private readonly logger = new Logger(AgentConfigurationsService.name);

    constructor(
        @Inject(AGENT_CONFIGURATIONS_REPOSITORY)
        private readonly repository: IAgentConfigurationsRepository,
    ) {}

    async create(dto: CreateAgentConfigurationDto): Promise<AgentConfiguration> {
        const slug = this.generateSlug(dto.name);

        // Check for existing slug
        const existing = await this.repository.findBySlug(slug);
        if (existing) {
            throw new ConflictException(`Agent configuration with slug '${slug}' already exists`);
        }

        const config = AgentConfiguration.create(
            dto.name,
            slug,
            dto.systemPrompt,
            dto.agentType,
            dto.projectId,
            dto.userId,
            dto.description,
            dto.rules,
            dto.skills
        );

        if (dto.isActive !== undefined) {
            config.isActive = dto.isActive;
        }

        this.logger.log(`Creating agent configuration: ${config.name} (${config.slug})`);
        return this.repository.create(config);
    }

    async findAll(): Promise<AgentConfiguration[]> {
        return this.repository.findAll();
    }

    async findByProject(projectId: number): Promise<AgentConfiguration[]> {
        return this.repository.findByProject(projectId);
    }

    async findOne(id: number): Promise<AgentConfiguration> {
        const config = await this.repository.findById(id);
        if (!config) {
            throw new NotFoundException(`Agent configuration with ID ${id} not found`);
        }
        return config;
    }

    async findBySlug(slug: string): Promise<AgentConfiguration | null> {
        return this.repository.findBySlug(slug);
    }

    async update(id: number, dto: UpdateAgentConfigurationDto): Promise<AgentConfiguration> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Agent configuration with ID ${id} not found`);
        }

        // If name is being updated, regenerate slug
        if (dto.name && dto.name !== existing.name) {
            const newSlug = this.generateSlug(dto.name);
            const slugExists = await this.repository.findBySlug(newSlug);
            if (slugExists && slugExists.id !== id) {
                throw new ConflictException(`Agent configuration with slug '${newSlug}' already exists`);
            }
            dto['slug'] = newSlug;
        }

        this.logger.log(`Updating agent configuration: ${id}`);
        return this.repository.update(id, dto as Partial<AgentConfiguration>);
    }

    async delete(id: number): Promise<void> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Agent configuration with ID ${id} not found`);
        }

        this.logger.log(`Deleting agent configuration: ${id}`);
        await this.repository.delete(id);
    }

    private generateSlug(text: string): string {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
}
