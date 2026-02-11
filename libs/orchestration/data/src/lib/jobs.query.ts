import { inject } from '@angular/core';
import { injectQuery, injectMutation, injectQueryClient } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { JobsService, CreateJobDto } from './jobs.service';
import { Job, JobStatus } from '@orca/orchestration-types';

export const jobsKeys = {
    all: ['jobs'] as const,
    byProject: (projectId: string) => [...jobsKeys.all, 'project', projectId] as const,
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
                prompt: dto.prompt,
                status: JobStatus.PENDING,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
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
