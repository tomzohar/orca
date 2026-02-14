import type { AgentJobEntity, AgentType, AgentJobComment, TaskType, AgentJobStatus } from '../entities/agent-job.entity';

export const AGENT_JOBS_REPOSITORY = Symbol('AGENT_JOBS_REPOSITORY');

export interface IAgentJobsRepository {
  create(data: {
    prompt: string;
    createdById: number;
    assignedAgentId?: number;
    type?: AgentType;
    projectId?: number;
    parentJobId?: number;
    taskType?: TaskType;
    status?: AgentJobStatus;
  }): Promise<AgentJobEntity>;
  findById(id: number): Promise<AgentJobEntity | null>;
  update(id: number, data: Partial<AgentJobEntity>): Promise<AgentJobEntity>;
  findAll(filters?: {
    createdById?: number;
    assignedAgentId?: number;
    projectId?: number;
    parentJobId?: number;
  }): Promise<AgentJobEntity[]>;
  addLog(jobId: number, message: string): Promise<AgentJobEntity>;
  addArtifact(
    jobId: number,
    artifact: { filename: string; content: string },
  ): Promise<AgentJobEntity>;
  addComment(
    jobId: number,
    data: { authorId: number; content: string; metadata?: Record<string, unknown> },
  ): Promise<AgentJobComment>;
  getComments(jobId: number): Promise<AgentJobComment[]>;
}
