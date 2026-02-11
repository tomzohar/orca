import { Injectable } from '@angular/core';
import { AppLayoutConfig } from '../types/app-layout.types';

@Injectable({ providedIn: 'root' })
export class AppLayoutService {
    private layoutConfig: AppLayoutConfig = {
        sidebar: {
            routes: [
                { path: '/orchestration', label: 'Orchestration', icon: 'view_kanban' },
            ]
        },
    };

    // Service returns a Promise for TanStack Query to consume.
    async getLayoutConfig(): Promise<AppLayoutConfig> {
        return Promise.resolve(this.layoutConfig);
    }

    updateLayoutConfig(config: Partial<AppLayoutConfig>): void {
        this.layoutConfig = {
            ...this.layoutConfig,
            ...config,
            sidebar: {
                ...this.layoutConfig.sidebar,
                ...config.sidebar,
            },
        };
    }
}
