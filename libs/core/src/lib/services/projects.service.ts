import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ProjectDetectionResult, Project, CreateProjectRequest } from '../types/projects.types';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
    private http = inject(HttpClient);

    /**
     * Detects the current project based on the working directory
     * @returns Promise with project detection result
     */
    async detectProject(): Promise<ProjectDetectionResult> {
        return firstValueFrom(
            this.http.get<ProjectDetectionResult>('/api/projects/detect')
        );
    }

    /**
     * Creates a new project
     * @param request - Project creation data
     * @returns Promise with created project
     */
    async createProject(request: CreateProjectRequest): Promise<Project> {
        return firstValueFrom(
            this.http.post<Project>('/api/projects', request)
        );
    }
}
