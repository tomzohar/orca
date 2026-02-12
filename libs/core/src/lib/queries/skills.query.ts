import { inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { SkillsService } from '../services/skills.service';

export const skillsKeys = {
    all: ['skills'] as const,
};

export function injectSkillsQuery() {
    const service = inject(SkillsService);

    return injectQuery(() => ({
        queryKey: skillsKeys.all,
        queryFn: () => service.getSkills(),
        staleTime: 10 * 60 * 1000, // 10 minutes - skills don't change often
        refetchOnWindowFocus: false,
    }));
}
