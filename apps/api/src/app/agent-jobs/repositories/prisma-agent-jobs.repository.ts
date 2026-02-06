import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AgentJobEntity, AgentJobStatus, AgentJobLog, AgentJobArtifact } from '../entities/agent-job.entity';
import { IAgentJobsRepository } from './agent-jobs.repository.interface';
import { AgentJob } from '../../../../prisma/client';

@Injectable()
export class PrismaAgentJobsRepository implements IAgentJobsRepository {
    constructor(private readonly prisma: PrismaService) { }

    private mapToEntity(dbJob: AgentJob): AgentJobEntity {
        return new AgentJobEntity({
            id: dbJob.id,
            prompt: dbJob.prompt,
            assignee: dbJob.assignee ?? undefined,
            status: dbJob.status as AgentJobStatus,
            logs: dbJob.logs as unknown as AgentJobLog[],
            artifacts: dbJob.artifacts as unknown as AgentJobArtifact[],
            createdAt: dbJob.createdAt,
            updatedAt: dbJob.updatedAt,
        });
    }

    async create(data: { prompt: string; assignee?: string }): Promise<AgentJobEntity> {
        const job = await this.prisma.agentJob.create({
            data: {
                prompt: data.prompt,
                assignee: data.assignee,
            },
        });
        return this.mapToEntity(job);
    }

    async findById(id: number): Promise<AgentJobEntity | null> {
        const job = await this.prisma.agentJob.findUnique({
            where: { id },
        });
        return job ? this.mapToEntity(job) : null;
    }

    async update(id: number, data: Partial<AgentJobEntity>): Promise<AgentJobEntity> {
        // Note: We need to handle mapped fields if they differ
        const updated = await this.prisma.agentJob.update({
            where: { id },
            data: {
                prompt: data.prompt,
                assignee: data.assignee,
                status: data.status,
                logs: data.logs as unknown as any,
                artifacts: data.artifacts as unknown as any,
            },
        });
        return this.mapToEntity(updated);
    }

    async findAll(filters?: { assignee?: string }): Promise<AgentJobEntity[]> {
        const jobs = await this.prisma.agentJob.findMany({
            where: {
                assignee: filters?.assignee,
            },
            orderBy: { createdAt: 'desc' },
        });
        return jobs.map((j) => this.mapToEntity(j));
    }
}
