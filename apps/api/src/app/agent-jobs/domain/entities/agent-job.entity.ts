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

export enum TaskType {
  ORCHESTRATOR = 'ORCHESTRATOR',
  CODING = 'CODING',
  REVIEW = 'REVIEW',
}

export enum MergeStatus {
  PENDING = 'PENDING',
  READY = 'READY',
  CONFLICT = 'CONFLICT',
  MERGED = 'MERGED',
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

export interface AgentJobComment {
  id: number;
  jobId: number;
  authorId: number;
  content: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export class AgentJobEntity {
  id: number;
  prompt: string;
  status: AgentJobStatus;
  type: AgentType;
  projectId?: number;
  project?: { rootPath: string; includes: string[]; excludes: string[] }; // Minimal interface to avoid cyclic dependency
  createdById: number;
  assignedAgentId?: number;

  // Job hierarchy
  parentJobId?: number;
  childJobs?: AgentJobEntity[];

  // Git tracking
  gitBranch?: string;

  // Task classification
  taskType: TaskType;
  mergeStatus: MergeStatus;

  logs: AgentJobLog[];
  artifacts: AgentJobArtifact[];
  comments: AgentJobComment[];
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<AgentJobEntity>) {
    Object.assign(this, partial);
  }
}
