import { inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { AppLayoutService } from '../services/app-layout.service';

export const appLayoutKeys = {
    all: ['appLayout'] as const,
    config: () => [...appLayoutKeys.all, 'config'] as const,
};

export function injectAppLayoutConfig() {
    const service = inject(AppLayoutService);
    // injectQuery returns a Signal<CreateQueryResult<AppLayoutConfig>>
    return injectQuery(() => ({
        queryKey: appLayoutKeys.config(),
        queryFn: () => service.getLayoutConfig(),
        staleTime: Infinity, // Config rarely changes
    }));
}
