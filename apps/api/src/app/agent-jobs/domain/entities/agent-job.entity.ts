export enum AgentJobStatus {
    PENDING = 'PENDING',
    RUNNING = 'RUNNING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    WAITING_FOR_USER = 'WAITING_FOR_USER',
}

export enum AgentType {
    CLAUDE_SDK = 'CLAUDE_SDK',
    LANGGRAPH = 'LANGGRAPH',
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
    type: AgentType;
    logs: AgentJobLog[];
    artifacts: AgentJobArtifact[];
    createdAt: Date;
    updatedAt: Date;

    constructor(partial: Partial<AgentJobEntity>) {
        Object.assign(this, partial);
    }
}
