export type DesignSystemColor = 'primary' | 'accent' | 'warn';

export interface ButtonConfig {
    variant?: 'primary' | 'secondary' | 'ghost' | 'icon-button';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    icon?: IconConfig;
}

export interface InputConfig {
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    type?: string;
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

export type IconName =
    | 'search' | 'home' | 'settings' | 'menu' | 'close'
    | 'check' | 'error' | 'warning' | 'info' | 'add'
    | 'remove' | 'edit' | 'delete' | 'arrow_forward'
    | 'arrow_back' | 'expand_more' | 'expand_less';

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

export interface DropdownOption {
    label: string;
    value: any;
    disabled?: boolean;
}

export interface DropdownConfig {
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    options: DropdownOption[];
}
