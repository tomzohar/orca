import { IconConfig } from '../../types/component.types';

export interface SidebarItem {
    id: string;
    label: string;
    icon?: IconConfig;
    route?: string;
    isActive?: boolean;
}

export interface SidebarConfig {
    items: SidebarItem[];
}
