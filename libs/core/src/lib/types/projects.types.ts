export type ProjectType = 'javascript' | 'typescript' | 'python' | 'unknown';

export interface WorkingDirectory {
    path: string;
    projectType: ProjectType;
}

export interface Project {
    id: number;
    name: string;
    slug: string;
    rootPath: string;
    description: string | null;
    includes: string[];
    excludes: string[];
    ownerId: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProjectDetectionResult {
    project: Project | null;
    workingDirectory: WorkingDirectory;
}

export interface CreateProjectRequest {
    name: string;
    rootPath: string;
    description?: string;
    includes?: string[];
    excludes?: string[];
}

