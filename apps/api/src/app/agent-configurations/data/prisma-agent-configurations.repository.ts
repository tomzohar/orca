import { Injectable } from '@nestjs/common';
import type { AgentConfiguration as PrismaAgentConfiguration } from '../../../../prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { IAgentConfigurationsRepository } from '../domain/agent-configurations.repository.interface';
import { AgentConfiguration } from '../domain/agent-configuration.entity';

@Injectable()
export class PrismaAgentConfigurationsRepository implements IAgentConfigurationsRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(config: AgentConfiguration): Promise<AgentConfiguration> {
        const created = await this.prisma.agentConfiguration.create({
            data: {
                name: config.name,
                slug: config.slug,
                description: config.description,
                systemPrompt: config.systemPrompt,
                rules: config.rules,
                skills: config.skills,
                agentType: config.agentType,
                projectId: config.projectId,
                userId: config.userId,
                isActive: config.isActive,
            },
        });
        return this.mapToEntity(created);
    }

    async findAll(): Promise<AgentConfiguration[]> {
        const configs = await this.prisma.agentConfiguration.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return configs.map((c) => this.mapToEntity(c));
    }

    async findByProject(projectId: number): Promise<AgentConfiguration[]> {
        const configs = await this.prisma.agentConfiguration.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
        });
        return configs.map((c) => this.mapToEntity(c));
    }

    async findById(id: number): Promise<AgentConfiguration | null> {
        const config = await this.prisma.agentConfiguration.findUnique({
            where: { id },
        });
        return config ? this.mapToEntity(config) : null;
    }

    async findBySlug(slug: string): Promise<AgentConfiguration | null> {
        const config = await this.prisma.agentConfiguration.findUnique({
            where: { slug },
        });
        return config ? this.mapToEntity(config) : null;
    }

    async update(id: number, config: Partial<AgentConfiguration>): Promise<AgentConfiguration> {
        const updated = await this.prisma.agentConfiguration.update({
            where: { id },
            data: {
                ...config,
                id: undefined,
                createdAt: undefined,
                updatedAt: undefined,
            },
        });
        return this.mapToEntity(updated);
    }

    async delete(id: number): Promise<void> {
        await this.prisma.agentConfiguration.delete({ where: { id } });
    }

    private mapToEntity(prismaConfig: PrismaAgentConfiguration): AgentConfiguration {
        return new AgentConfiguration(
            prismaConfig.id,
            prismaConfig.name,
            prismaConfig.slug,
            prismaConfig.description,
            prismaConfig.systemPrompt,
            prismaConfig.rules,
            prismaConfig.skills,
            prismaConfig.agentType as AgentConfiguration['agentType'],
            prismaConfig.projectId,
            prismaConfig.userId,
            prismaConfig.isActive,
            prismaConfig.createdAt,
            prismaConfig.updatedAt,
        );
    }
}
