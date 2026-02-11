import type { Project } from './project.entity';

/**
 * High-level project type detection based on marker files
 */
export type ProjectType = 'javascript' | 'typescript' | 'python' | 'unknown';

/**
 * Information about the current working directory
 */
export interface WorkingDirectoryInfo {
    path: string;
    projectType: ProjectType;
}

/**
 * Result of project detection operation
 */
export interface ProjectDetectionResult {
    project: Project | null;
    workingDirectory: WorkingDirectoryInfo;
}
