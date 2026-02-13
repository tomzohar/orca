import { inject } from '@angular/core';
import { injectQuery, injectMutation, injectQueryClient } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { JobsService, CreateJobDto, CreateCommentDto } from './jobs.service';
import { Job, JobStatus, JobComment } from '@orca/orchestration-types';

export const jobsKeys = {
    all: ['jobs'] as const,
    byProject: (projectId: string) => [...jobsKeys.all, 'project', projectId] as const,
    comments: (jobId: number) => [...jobsKeys.all, 'comments', jobId] as const,
};

/**
 * TanStack Query hook for fetching jobs by project
 * 
 * @param projectIdOrSignal - The project identifier as a string, signal, or function
 * @returns Query result signal containing jobs data, loading state, and error
 */
export function injectJobsQuery(projectIdOrSignal: string | (() => string | undefined | null)) {
    const service = inject(JobsService);

    return injectQuery(() => {
        const projectId = typeof projectIdOrSignal === 'function'
            ? projectIdOrSignal()
            : projectIdOrSignal;

        return {
            queryKey: projectId ? jobsKeys.byProject(projectId) : jobsKeys.all,
            queryFn: async () => {
                if (!projectId) return [];
                return lastValueFrom(service.getJobs(parseInt(projectId, 10)));
            },
            enabled: !!projectId,
            staleTime: 1000 * 60 * 1, // 1 minute
        };
    });
}

/**
 * TanStack Mutation hook for creating a new job
 * Implements optimistic updates and automatic query invalidation
 * 
 * @returns Mutation result with mutate function, loading state, and error
 */
export function injectCreateJobMutation() {
    const service = inject(JobsService);
    const queryClient = injectQueryClient();

    return injectMutation(() => ({
        mutationFn: async (dto: CreateJobDto) => {
            return lastValueFrom(service.createJob(dto));
        },
        onMutate: async (dto: CreateJobDto) => {
            // Cancel any outgoing refetches to prevent optimistic update from being overwritten
            const queryKey = jobsKeys.byProject(dto.projectId.toString());
            await queryClient.cancelQueries({ queryKey });

            // Snapshot the previous value
            const previousJobs = queryClient.getQueryData<Job[]>(queryKey);

            // Optimistically update to the new value
            const optimisticJob: Job = {
                id: `temp-${Date.now()}`, // Temporary ID
                type: dto.type,
                prompt: dto.prompt,
                status: JobStatus.PENDING,
                projectId: dto.projectId,
                createdById: 0, // Placeholder - will be replaced by real value from backend
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                logs: [],
                artifacts: [],
                comments: [],
            };

            queryClient.setQueryData<Job[]>(queryKey, (old) => {
                return old ? [...old, optimisticJob] : [optimisticJob];
            });

            // Return context with snapshot
            return { previousJobs, queryKey };
        },
        onError: (_err, _dto, context) => {
            // Rollback to previous value on error
            if (context?.previousJobs) {
                queryClient.setQueryData(context.queryKey, context.previousJobs);
            }
        },
        onSuccess: (_data, dto) => {
            // Invalidate and refetch jobs query to get the real job from backend
            queryClient.invalidateQueries({
                queryKey: jobsKeys.byProject(dto.projectId.toString())
            });
        },
    }));
}

/**
 * TanStack Query hook for fetching comments for a job
 *
 * @param jobIdOrSignal - The job ID as a number, signal, or function
 * @returns Query result signal containing comments data, loading state, and error
 */
export function injectCommentsQuery(jobIdOrSignal: number | (() => number | undefined | null)) {
    const service = inject(JobsService);

    return injectQuery(() => {
        const jobId = typeof jobIdOrSignal === 'function'
            ? jobIdOrSignal()
            : jobIdOrSignal;

        return {
            queryKey: jobId ? jobsKeys.comments(jobId) : ['comments'],
            queryFn: async () => {
                if (!jobId) return [];
                return lastValueFrom(service.getComments(jobId));
            },
            enabled: !!jobId,
            staleTime: 1000 * 30, // 30 seconds
        };
    });
}

/**
 * TanStack Mutation hook for adding a comment to a job
 * Implements automatic query invalidation
 *
 * @returns Mutation result with mutate function, loading state, and error
 */
export function injectAddCommentMutation() {
    const service = inject(JobsService);
    const queryClient = injectQueryClient();

    return injectMutation(() => ({
        mutationFn: async ({ jobId, authorId, dto }: { jobId: number; authorId: number; dto: CreateCommentDto }) => {
            return lastValueFrom(service.addComment(jobId, authorId, dto));
        },
        onSuccess: (_data, variables) => {
            // Invalidate comments query to refetch the updated list
            queryClient.invalidateQueries({
                queryKey: jobsKeys.comments(variables.jobId)
            });
        },
    }));
}
