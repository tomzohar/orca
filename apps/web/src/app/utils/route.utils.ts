import { Route } from '@angular/router';
import { IconName } from '@orca/design-system';

export interface SidebarRoute {
    path: string;
    label: string;
    icon: string;
}

export function getSidebarRoutes(routes: Route[]): SidebarRoute[] {
    return routes
        .filter(route => route.path && route.path !== '' && !route.redirectTo && !route.data?.['hideInSidebar'])
        .map(route => ({
            path: `/${route.path}`,
            label: capitalize(route.path || ''),
            icon: getIconForRoute(route.path || '')
        }));
}

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function getIconForRoute(path: string): string {
    const iconMap: Record<string, IconName> = {
        'orchestration': IconName.view_kanban,
        'dashboard': IconName.dashboard,
        'settings': IconName.settings
    };
    return iconMap[path] || 'link';
}
