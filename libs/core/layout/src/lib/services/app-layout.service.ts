import { Injectable } from '@angular/core';
import { AppLayoutConfig } from '../types/app-layout.types';

@Injectable({ providedIn: 'root' })
export class AppLayoutService {
    // Service returns a Promise for TanStack Query to consume.
    async getLayoutConfig(): Promise<AppLayoutConfig> {
        return Promise.resolve({
            sidebar: {
                routes: [{ path: '/dashboard', label: 'Dashboard', icon: 'dashboard' }]
            },
            topbar: {
                title: 'Orca',
                logoUrl: 'assets/logo.svg' // Verify actual path
            }
        });
    }
}
