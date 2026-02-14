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

export enum UserType {
  HUMAN = 'HUMAN',
  AGENT = 'AGENT',
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
 * Comment author details
 */
export interface CommentAuthor {
  id: number;
  name: string;
  type: UserType;
}

/**
 * Job comment
 */
export interface JobComment {
  id: number;
  jobId: number;
  authorId: number;
  author?: CommentAuthor;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

/**
 * Core Job entity from backend
 */
export interface Job {
  id: string;
  title?: string;
  type: AgentType;
  prompt: string;
  status: JobStatus;
  assignee?: string;
  projectId?: number;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  logs: JobLog[];
  artifacts: JobArtifact[];
  comments: JobComment[];
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
