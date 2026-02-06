export enum AgentJobStatus {
    PENDING = 'PENDING',
    RUNNING = 'RUNNING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

export interface AgentJobLog {
    message: string;
    timestamp: string;
}

export interface AgentJobArtifact {
    filename: string;
    content: string;
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
