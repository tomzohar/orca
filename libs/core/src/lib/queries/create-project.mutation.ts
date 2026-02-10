import { inject } from '@angular/core';
import { injectMutation, injectQueryClient } from '@tanstack/angular-query-experimental';
import { ProjectsService } from '../services/projects.service';
import { CreateProjectRequest } from '../types/projects.types';
import { projectDetectionKeys } from './project-detection.query';

export const projectMutationKeys = {
    create: ['createProject'] as const,
};

/**
 * TanStack Query mutation hook for creating a new project
 * Automatically invalidates the project detection query on success
 */
export function injectCreateProject() {
    const service = inject(ProjectsService);
    const queryClient = injectQueryClient();

    // injectMutation returns a Signal<CreateMutationResult<Project, Error, CreateProjectRequest>>
    return injectMutation(() => ({
        mutationKey: projectMutationKeys.create,
        mutationFn: (request: CreateProjectRequest) => service.createProject(request),
        onSuccess: () => {
            // Invalidate and refetch project detection query after successful creation
            queryClient.invalidateQueries({ queryKey: projectDetectionKeys.all });
        },
    }));
}
