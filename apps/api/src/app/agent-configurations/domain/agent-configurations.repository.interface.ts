import type { AgentConfiguration } from './agent-configuration.entity';

export interface IAgentConfigurationsRepository {
    create(config: AgentConfiguration): Promise<AgentConfiguration>;
    findAll(): Promise<AgentConfiguration[]>;
    findByProject(projectId: number): Promise<AgentConfiguration[]>;
    findById(id: number): Promise<AgentConfiguration | null>;
    findBySlug(slug: string): Promise<AgentConfiguration | null>;
    update(id: number, config: Partial<AgentConfiguration>): Promise<AgentConfiguration>;
    delete(id: number): Promise<void>;
}

export const AGENT_CONFIGURATIONS_REPOSITORY = Symbol('AGENT_CONFIGURATIONS_REPOSITORY');
