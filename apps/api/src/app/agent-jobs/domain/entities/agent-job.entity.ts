export enum AgentJobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  WAITING_FOR_USER = 'WAITING_FOR_USER',
}

export enum AgentType {
  DOCKER = 'DOCKER',
  FILE_SYSTEM = 'FILE_SYSTEM',
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
  projectId?: number;
  project?: { rootPath: string; includes: string[]; excludes: string[] }; // Minimal interface to avoid cyclic dependency
  logs: AgentJobLog[];
  artifacts: AgentJobArtifact[];
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<AgentJobEntity>) {
    Object.assign(this, partial);
  }
}
