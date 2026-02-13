import { Injector, TemplateRef } from '@angular/core';

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

export interface BadgeConfig {
    text: string;
    variant: 'success' | 'info' | 'warning' | 'error' | 'neutral';
    size?: 'sm' | 'md';
}

export interface ButtonGroupConfig {
    buttons: ButtonGroupItem[];
    selected?: string;
    variant?: 'primary' | 'secondary';
}

export interface ButtonGroupItem {
    label?: string;
    value: string;
    icon?: IconConfig;
    disabled?: boolean;
}

export interface TableConfig<T = any> {
    data: T[];
    columns: TableColumn<T>[];
    loading?: boolean;
    error?: string | null;
    emptyMessage?: string;
    sortable?: boolean;
    onRowClick?: (row: T) => void;
}

export interface TableColumn<T = any> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    width?: string;
    type?: 'text' | 'badge' | 'actions' | 'custom';
    pipe?: 'date' | 'relativeTime' | 'truncate';
    badgeConfig?: (row: T) => BadgeConfig;
    actions?: TableAction<T>[];
    template?: TemplateRef<{ $implicit: T }>;
}

export interface TableAction<T = any> {
    label: string;
    icon?: IconName;
    onClick: (row: T) => void;
    visible?: (row: T) => boolean;
    disabled?: (row: T) => boolean;
}

export interface CardConfig {
    variant?: 'elevated' | 'outlined';
    title?: string;
    subtitle?: string;
    showActions?: boolean;
}

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface IconConfig {
    name: IconName;
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
    view_list = 'view_list',
    dashboard = 'dashboard',
    link = 'link',
    javascript = 'javascript',
    css = 'css',
    html = 'html',
    article = 'article',
    construction = 'construction',
    more_vert = 'more_vert',
    cancel = 'cancel',
    refresh = 'refresh',
    format_bold = 'format_bold',
    format_italic = 'format_italic',
    strikethrough_s = 'strikethrough_s',
    title = 'title',
    code = 'code',
    format_list_bulleted = 'format_list_bulleted',
    format_list_numbered = 'format_list_numbered',
    format_quote = 'format_quote',
    logout = "logout",
    person = "person",
    comment = "comment"
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
    multiple?: boolean;
}

export interface MenuItem {
    id?: string;
    label: string;
    icon?: IconName;
    action?: (item: MenuItem) => void;
    disabled?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    route?: string | any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryParams?: Record<string, any>;
    divider?: boolean; // useful for separators
    danger?: boolean; // red color for delete etc
}

export interface MenuConfig {
    triggerIcon?: IconName;
    triggerLabel?: string;
    triggerVariant?: 'icon' | 'button' | 'ghost'; // defaults to icon
    items: MenuItem[];
    xPosition?: 'before' | 'after';
    yPosition?: 'above' | 'below';
}

export interface TabConfig {
    label: string;
    icon?: IconName;
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

export interface ListItem {
    id?: string;
    title: string;
    description?: string;
    icon?: IconName;
    badge?: string;
    content?: string;
    disabled?: boolean;
}

export interface ListConfig {
    items: ListItem[];
    expandable?: boolean;
    showIcons?: boolean;
    multipleExpanded?: boolean;
}

export * from '../components/markdown-editor/markdown-editor.types';
