import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'orchestration'
    },
    {
        path: 'orchestration',
        children: [
            {
                path: '',
                loadComponent: () => import('@orca/orchestration-feature').then(m => m.OrchestrationComponent),
            },
            {
                path: ':jobId',
                loadComponent: () => import('@orca/orchestration-feature').then(m => m.OrchestrationComponent),
            }
        ]
    },
];
