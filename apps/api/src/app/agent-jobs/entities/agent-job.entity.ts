export enum AgentJobStatus {
    PENDING = 'PENDING',
    RUNNING = 'RUNNING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

export interface AgentJobLog {
    id: number;
    message: string;
    timestamp: Date;
}

export interface AgentJobArtifact {
    id: number;
    filename: string;
    content: string;
    createdAt: Date;
}

export class AgentJobEntity {
    id: number;
    prompt: string;
    assignee?: string;
    status: AgentJobStatus;
    logs: AgentJobLog[];
    artifacts: AgentJobArtifact[];
    createdAt: Date;
    updatedAt: Date;

    constructor(partial: Partial<AgentJobEntity>) {
        Object.assign(this, partial);
    }
}
