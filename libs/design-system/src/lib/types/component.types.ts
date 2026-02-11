import { Injector } from '@angular/core';

export type DesignSystemColor = 'primary' | 'accent' | 'warn';

export interface ButtonConfig {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    icon?: IconConfig;
}

export interface InputConfig {
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    hint?: string;
    type?: string;
    rows?: number;
    prefixIcon?: IconConfig;
    size?: 'sm' | 'md';
}

export interface CheckboxConfig {
    disabled?: boolean;
    indeterminate?: boolean;
}

export interface RadioOption {
    label: string;
    value: unknown;
    disabled?: boolean;
}

export interface RadioConfig {
    options: RadioOption[];
}

export interface SwitchConfig {
    disabled?: boolean;
}

export interface AlertConfig {
    type?: 'success' | 'info' | 'warning' | 'error';
    title?: string;
    showIcon?: boolean;
}

export interface CardConfig {
    variant?: 'elevated' | 'outlined';
    title?: string;
    subtitle?: string;
    showActions?: boolean;
}

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface IconConfig {
    name: string;
    size?: IconSize;
    color?: string;
}

export type ProgressBarSize = 'sm' | 'lg' | 'xl';
export type ProgressBarMode = 'determinate' | 'indeterminate';

export interface ProgressBarConfig {
    value?: number;
    mode?: ProgressBarMode;
    size?: ProgressBarSize;
    color?: DesignSystemColor;
}

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerConfig {
    size?: SpinnerSize;
    color?: DesignSystemColor;
    strokeWidth?: number;
    diameter?: number;
}

export enum IconName {
    search = 'search',
    home = 'home',
    settings = 'settings',
    menu = 'menu',
    close = 'close',
    check = 'check',
    error = 'error',
    warning = 'warning',
    info = 'info',
    add = 'add',
    remove = 'remove',
    edit = 'edit',
    delete = 'delete',
    arrow_forward = 'arrow_forward',
    arrow_back = 'arrow_back',
    expand_more = 'expand_more',
    expand_less = 'expand_less',
    view_kanban = 'view_kanban',
    dashboard = 'dashboard',
    link = 'link'
}

export type DialogSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface DialogAction extends ButtonConfig {
    label: string;
    id: string;
}

export interface DialogConfig {
    title?: string;
    subtitle?: string;
    size?: DialogSize;
    showCloseButton?: boolean;
    disableClose?: boolean;
    hasBackdrop?: boolean;
    backdropClass?: string;
    actions?: DialogAction[];
}

export interface DropdownOption<T> {
    label: string;
    value: T;
    disabled?: boolean;
}

export interface DropdownConfig<T> {
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    hint?: string;
    options: DropdownOption<T>[];
}

export interface MenuItem {
    id?: string;
    label: string;
    icon?: string;
    action?: (item: MenuItem) => void;
    disabled?: boolean;
    route?: string | any[];
    queryParams?: Record<string, any>;
    divider?: boolean; // useful for separators
    danger?: boolean; // red color for delete etc
}

export interface MenuConfig {
    triggerIcon?: string;
    triggerLabel?: string;
    triggerVariant?: 'icon' | 'button' | 'ghost'; // defaults to icon
    items: MenuItem[];
    xPosition?: 'before' | 'after';
    yPosition?: 'above' | 'below';
}

export interface TabConfig {
    label: string;
    icon?: string;
    disabled?: boolean;
}

export interface TabsConfig {
    tabs: TabConfig[];
    selectedIndex?: number;
    alignment?: 'start' | 'center';
    animationDuration?: string;
    disableRipple?: boolean;
    headerPosition?: 'above' | 'below';
}

export type SidePanelPosition = 'left' | 'right';
export type SidePanelSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface SidePanelConfig {
    title?: string;
    subtitle?: string;
    position?: SidePanelPosition;
    size?: SidePanelSize;
    showCloseButton?: boolean;
    disableClose?: boolean;
    hasBackdrop?: boolean;
    backdropClass?: string;
    injector?: Injector;
}
