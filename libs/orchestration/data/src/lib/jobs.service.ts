import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Job } from '@orca/orchestration-types';

export interface CreateJobDto {
    prompt: string;
    type: 'FILE_SYSTEM' | 'DOCKER';
    projectId: number;
}

export interface CreateJobResponse {
    id: number;
}

@Injectable({
    providedIn: 'root',
})
export class JobsService {
    private readonly http = inject(HttpClient);

    /**
     * Fetches all jobs for a specific project
     * @param projectId The ID of the project to fetch jobs for
     */
    getJobs(projectId: number): Observable<Job[]> {
        return this.http.get<Job[]>(`/api/agent-jobs`, {
            params: {
                projectId: projectId.toString(),
            },
        });
    }

    /**
     * Creates a new agent job
     * @param dto Job creation data
     * @returns Observable with the created job ID
     */
    createJob(dto: CreateJobDto): Observable<CreateJobResponse> {
        return this.http.post<CreateJobResponse>('/api/agent-jobs', dto);
    }
}
