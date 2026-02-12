/**
 * Job status representing workflow stages
 */
export enum JobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  WAITING_FOR_USER = 'WAITING_FOR_USER',
}

/**
 * Agent execution type
 */
export enum AgentType {
  DOCKER = 'DOCKER',
  FILE_SYSTEM = 'FILE_SYSTEM',
}

/**
 * Job log entry
 */
export interface JobLog {
  id: number;
  message: string;
  timestamp: string;
}

/**
 * Job artifact (generated file)
 */
export interface JobArtifact {
  id: number;
  filename: string;
  content: string;
  createdAt: string;
}

/**
 * Core Job entity from backend
 */
export interface Job {
  id: string;
  type: AgentType;
  prompt: string;
  status: JobStatus;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
  logs: JobLog[];
  artifacts: JobArtifact[];
}

/**
 * UI model for job display in kanban
 * Extends Job with computed display properties
 */
export interface JobUIModel extends Job {
  /**
   * Formatted creation date for display
   */
  formattedCreatedAt: string;
}
