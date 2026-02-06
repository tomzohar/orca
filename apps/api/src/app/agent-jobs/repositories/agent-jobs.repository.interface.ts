import { AgentJobEntity } from '../entities/agent-job.entity';

export const AGENT_JOBS_REPOSITORY = Symbol('AGENT_JOBS_REPOSITORY');

export interface IAgentJobsRepository {
    create(data: { prompt: string; assignee?: string }): Promise<AgentJobEntity>;
    findById(id: number): Promise<AgentJobEntity | null>;
    update(id: number, data: Partial<AgentJobEntity>): Promise<AgentJobEntity>;
    findAll(filters?: { assignee?: string }): Promise<AgentJobEntity[]>;
}
