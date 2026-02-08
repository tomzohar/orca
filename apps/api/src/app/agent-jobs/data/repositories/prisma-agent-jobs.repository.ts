import { Injectable } from '@nestjs/common';
import { Prisma, AgentType as PrismaAgentType } from '../../../../../prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { AgentJobEntity, AgentJobStatus, AgentType } from '../../domain/entities/agent-job.entity';
import type { IAgentJobsRepository } from '../../domain/interfaces/agent-jobs.repository.interface';

type AgentJobWithRelations = Prisma.AgentJobGetPayload<{
    include: { logs: true; artifacts: true };
}>;

@Injectable()
export class PrismaAgentJobsRepository implements IAgentJobsRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: { prompt: string; assignee?: string; type?: AgentType }): Promise<AgentJobEntity> {
        const job = await this.prisma.agentJob.create({
            data: {
                prompt: data.prompt,
                assignee: data.assignee,
                type: data.type ? PrismaAgentType[data.type] : PrismaAgentType.LANGGRAPH,
            },
            include: { logs: true, artifacts: true },
        });
        return this.mapToEntity(job);
    }

    async findById(id: number): Promise<AgentJobEntity | null> {
        const job = await this.prisma.agentJob.findUnique({
            where: { id },
            include: { logs: true, artifacts: true },
        });
        return job ? this.mapToEntity(job) : null;
    }

    async update(id: number, data: Partial<AgentJobEntity>): Promise<AgentJobEntity> {
        // Only update basic scalar fields. Logs and Artifacts should be added via Add methods
        const updateData: Prisma.AgentJobUpdateInput = {};
        if (data.status) updateData.status = data.status;
        if (data.assignee !== undefined) updateData.assignee = data.assignee;

        // logs/artifacts in 'data' are ignored here as they are handled separately or read-only in this context

        const updated = await this.prisma.agentJob.update({
            where: { id },
            data: updateData,
            include: { logs: true, artifacts: true },
        });
        return this.mapToEntity(updated);
    }

    async findAll(filters?: { assignee?: string }): Promise<AgentJobEntity[]> {
        const jobs = await this.prisma.agentJob.findMany({
            where: {
                assignee: filters?.assignee,
            },
            include: { logs: true, artifacts: true },
            orderBy: { createdAt: 'desc' },
        });
        return jobs.map((j) => this.mapToEntity(j));
    }

    async addLog(jobId: number, message: string): Promise<AgentJobEntity> {
        await this.prisma.agentJobLog.create({
            data: {
                jobId,
                message,
            },
        });
        // Fetch updated job to return full entity
        return this.findById(jobId) as Promise<AgentJobEntity>;
    }

    async addArtifact(jobId: number, artifact: { filename: string; content: string }): Promise<AgentJobEntity> {
        await this.prisma.agentJobArtifact.create({
            data: {
                jobId,
                filename: artifact.filename,
                content: artifact.content,
            },
        });
        // Fetch updated job
        return this.findById(jobId) as Promise<AgentJobEntity>;
    }

    private mapToEntity(dbJob: AgentJobWithRelations): AgentJobEntity {
        return new AgentJobEntity({
            id: dbJob.id,
            prompt: dbJob.prompt,
            assignee: dbJob.assignee ?? undefined,
            status: dbJob.status as AgentJobStatus,
            type: AgentType[dbJob.type],
            logs: dbJob.logs.map(l => ({
                id: l.id,
                message: l.message,
                timestamp: l.timestamp
            })),
            artifacts: dbJob.artifacts.map(a => ({
                id: a.id,
                filename: a.filename,
                content: a.content,
                createdAt: a.createdAt
            })),
            createdAt: dbJob.createdAt,
            updatedAt: dbJob.updatedAt,
        });
    }
}
