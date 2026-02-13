import { Injectable } from '@nestjs/common';
import {
  Prisma,
  AgentType as PrismaAgentType,
  TaskType as PrismaTaskType,
  MergeStatus as PrismaMergeStatus,
} from '../../../../../prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  AgentJobEntity,
  AgentJobStatus,
  AgentType,
  AgentJobComment,
  TaskType,
  MergeStatus,
} from '../../domain/entities/agent-job.entity';
import type { IAgentJobsRepository } from '../../domain/interfaces/agent-jobs.repository.interface';

type AgentJobWithRelations = Prisma.AgentJobGetPayload<{
  include: {
    logs: true;
    artifacts: true;
    comments: true;
    project: true;
    createdBy: true;
    assignedAgent: true;
    childJobs: true;
  };
}>;

@Injectable()
export class PrismaAgentJobsRepository implements IAgentJobsRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: {
    prompt: string;
    createdById: number;
    assignedAgentId?: number;
    type?: AgentType;
    projectId?: number;
    parentJobId?: number;
    taskType?: TaskType;
    status?: AgentJobStatus;
  }): Promise<AgentJobEntity> {
    const job = await this.prisma.agentJob.create({
      data: {
        prompt: data.prompt,
        createdById: data.createdById,
        assignedAgentId: data.assignedAgentId,
        projectId: data.projectId,
        parentJobId: data.parentJobId,
        type: data.type
          ? PrismaAgentType[data.type]
          : PrismaAgentType.FILE_SYSTEM,
        taskType: data.taskType
          ? PrismaTaskType[data.taskType]
          : PrismaTaskType.CODING,
        status: data.status || AgentJobStatus.PENDING,
      },
      include: {
        logs: true,
        artifacts: true,
        comments: true,
        project: true,
        createdBy: true,
        assignedAgent: true,
        childJobs: true,
      },
    });
    return this.mapToEntity(job);
  }

  async findById(id: number): Promise<AgentJobEntity | null> {
    const job = await this.prisma.agentJob.findUnique({
      where: { id },
      include: {
        logs: true,
        artifacts: true,
        comments: true,
        project: true,
        createdBy: true,
        assignedAgent: true,
        childJobs: true,
      },
    });
    return job ? this.mapToEntity(job) : null;
  }

  async update(
    id: number,
    data: Partial<AgentJobEntity>,
  ): Promise<AgentJobEntity> {
    // Only update basic scalar fields. Logs and Artifacts should be added via Add methods
    const updateData: Prisma.AgentJobUpdateInput = {};
    if (data.status) updateData.status = data.status;
    if (data.gitBranch !== undefined) updateData.gitBranch = data.gitBranch;
    if (data.taskType) updateData.taskType = PrismaTaskType[data.taskType];
    if (data.mergeStatus) updateData.mergeStatus = PrismaMergeStatus[data.mergeStatus];
    if (data.assignedAgentId !== undefined) {
      // Use Prisma's relation syntax for updating foreign keys
      updateData.assignedAgent = data.assignedAgentId
        ? { connect: { id: data.assignedAgentId } }
        : { disconnect: true };
    }

    // logs/artifacts in 'data' are ignored here as they are handled separately or read-only in this context

    const updated = await this.prisma.agentJob.update({
      where: { id },
      data: updateData,
      include: {
        logs: true,
        artifacts: true,
        comments: true,
        project: true,
        createdBy: true,
        assignedAgent: true,
        childJobs: true,
      },
    });
    return this.mapToEntity(updated);
  }

  async findAll(filters?: {
    createdById?: number;
    assignedAgentId?: number;
    projectId?: number;
    parentJobId?: number;
  }): Promise<AgentJobEntity[]> {
    const jobs = await this.prisma.agentJob.findMany({
      where: {
        createdById: filters?.createdById,
        assignedAgentId: filters?.assignedAgentId,
        projectId: filters?.projectId,
        parentJobId: filters?.parentJobId,
      },
      include: {
        logs: true,
        artifacts: true,
        comments: true,
        project: true,
        createdBy: true,
        assignedAgent: true,
        childJobs: true,
      },
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

  async addArtifact(
    jobId: number,
    artifact: { filename: string; content: string },
  ): Promise<AgentJobEntity> {
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

  async addComment(
    jobId: number,
    data: { authorId: number; content: string; metadata?: Record<string, any> },
  ): Promise<AgentJobComment> {
    const comment = await this.prisma.agentJobComment.create({
      data: {
        jobId,
        authorId: data.authorId,
        content: data.content,
        metadata: data.metadata,
      },
    });
    return {
      id: comment.id,
      jobId: comment.jobId,
      authorId: comment.authorId,
      content: comment.content,
      metadata: comment.metadata as Record<string, any> | undefined,
      createdAt: comment.createdAt,
    };
  }

  async getComments(jobId: number): Promise<AgentJobComment[]> {
    const comments = await this.prisma.agentJobComment.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' }, // Newest first
    });
    return comments.map((c) => ({
      id: c.id,
      jobId: c.jobId,
      authorId: c.authorId,
      content: c.content,
      metadata: c.metadata as Record<string, any> | undefined,
      createdAt: c.createdAt,
    }));
  }

  private mapToEntity(dbJob: AgentJobWithRelations): AgentJobEntity {
    return new AgentJobEntity({
      id: dbJob.id,
      prompt: dbJob.prompt,
      status: dbJob.status as AgentJobStatus,
      type: AgentType[dbJob.type],
      projectId: dbJob.projectId ?? undefined,
      project: dbJob.project
        ? {
          rootPath: dbJob.project.rootPath,
          includes: dbJob.project.includes,
          excludes: dbJob.project.excludes,
        }
        : undefined,
      createdById: dbJob.createdById,
      assignedAgentId: dbJob.assignedAgentId ?? undefined,
      parentJobId: dbJob.parentJobId ?? undefined,
      childJobs: dbJob.childJobs?.map((child) => ({
        id: child.id,
        prompt: child.prompt,
        status: child.status as AgentJobStatus,
        type: AgentType[child.type],
        taskType: TaskType[child.taskType],
        mergeStatus: MergeStatus[child.mergeStatus],
        createdAt: child.createdAt,
        updatedAt: child.updatedAt,
      })) as AgentJobEntity[] | undefined,
      gitBranch: dbJob.gitBranch ?? undefined,
      taskType: TaskType[dbJob.taskType],
      mergeStatus: MergeStatus[dbJob.mergeStatus],
      logs: dbJob.logs.map((l) => ({
        id: l.id,
        message: l.message,
        timestamp: l.timestamp,
      })),
      artifacts: dbJob.artifacts.map((a) => ({
        id: a.id,
        filename: a.filename,
        content: a.content,
        createdAt: a.createdAt,
      })),
      comments: dbJob.comments.map((c) => ({
        id: c.id,
        jobId: c.jobId,
        authorId: c.authorId,
        content: c.content,
        metadata: c.metadata as Record<string, any> | undefined,
        createdAt: c.createdAt,
      })),
      createdAt: dbJob.createdAt,
      updatedAt: dbJob.updatedAt,
    });
  }
}
