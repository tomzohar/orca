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
 * Core Job entity from backend
 */
export interface Job {
  id: string;
  prompt: string;
  status: JobStatus;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
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
