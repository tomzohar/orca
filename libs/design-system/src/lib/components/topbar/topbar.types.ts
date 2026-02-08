import { ButtonConfig, IconConfig } from '../../types/component.types';

export interface TopbarAction {
    id: string;
    icon?: IconConfig;
    label?: string;
    tooltip?: string;
    variant?: ButtonConfig['variant'];
}

export interface TopbarConfig {
    title?: string;
    logo?: string;
    showSearch?: boolean;
    actions?: TopbarAction[];
}
