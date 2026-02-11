import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'orchestration'
    },
    {
        path: 'orchestration',
        loadComponent: () => import('@orca/orchestration-feature').then(m => m.OrchestrationComponent)
    },
    {
        path: 'orchestration/:jobId',
        loadComponent: () => import('@orca/orchestration-feature').then(m => m.OrchestrationComponent),
        data: { hideInSidebar: true }
    }
];
