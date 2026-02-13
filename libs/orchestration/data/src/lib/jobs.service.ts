import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Job, AgentType, JobComment } from '@orca/orchestration-types';

export interface CreateJobDto {
    prompt: string;
    type: AgentType;
    projectId: number;
}

export interface CreateJobResponse {
    id: number;
}

export interface CreateCommentDto {
    content: string;
    metadata?: Record<string, any>;
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

    /**
     * Add a comment to a job
     * @param jobId The job ID to add the comment to
     * @param authorId The ID of the user posting the comment
     * @param dto Comment creation data
     * @returns Observable with the created comment
     */
    addComment(jobId: number, authorId: number, dto: CreateCommentDto): Observable<JobComment> {
        return this.http.post<JobComment>(`/api/agent-jobs/${jobId}/comments`, dto, {
            params: { authorId: authorId.toString() },
        });
    }

    /**
     * Get all comments for a job
     * @param jobId The job ID to get comments for
     * @returns Observable with the list of comments
     */
    getComments(jobId: number): Observable<JobComment[]> {
        return this.http.get<JobComment[]>(`/api/agent-jobs/${jobId}/comments`);
    }
}
