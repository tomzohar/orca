import { inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ProjectsService } from '../services/projects.service';

export const projectDetectionKeys = {
    all: ['projectDetection'] as const,
    current: () => [...projectDetectionKeys.all, 'current'] as const,
};

export function injectProjectDetection() {
    const service = inject(ProjectsService);
    // injectQuery returns a Signal<CreateQueryResult<ProjectDetectionResult>>
    return injectQuery(() => ({
        queryKey: projectDetectionKeys.current(),
        queryFn: () => service.detectProject(),
        staleTime: 5 * 60 * 1000, // 5 minutes - project detection doesn't change often
        refetchOnWindowFocus: false, // Don't refetch on window focus
    }));
}
