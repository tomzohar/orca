import { AgentJobEntity, AgentType } from '../entities/agent-job.entity';

export const AGENT_JOBS_REPOSITORY = Symbol('AGENT_JOBS_REPOSITORY');

export interface IAgentJobsRepository {
  create(data: {
    prompt: string;
    assignee?: string;
    type?: AgentType;
  }): Promise<AgentJobEntity>;
  findById(id: number): Promise<AgentJobEntity | null>;
  update(id: number, data: Partial<AgentJobEntity>): Promise<AgentJobEntity>;
  findAll(filters?: { assignee?: string }): Promise<AgentJobEntity[]>;
  addLog(jobId: number, message: string): Promise<AgentJobEntity>;
  addArtifact(
    jobId: number,
    artifact: { filename: string; content: string },
  ): Promise<AgentJobEntity>;
}
