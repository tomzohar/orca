import type { Meta, StoryObj } from '@storybook/angular';
import { InputComponent } from './input.component';
import { IconName } from '../../types/component.types';

const meta: Meta<InputComponent> = {
    title: 'Components/Input',
    component: InputComponent,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<InputComponent>;

export const Default: Story = {
    args: {
        config: {
            label: 'Label',
            placeholder: 'Enter text...',
        },
    },
    render: (args) => ({
        props: args,
        template: `<orca-input [config]="config"></orca-input>`,
    }),
};

export const Search: Story = {
    args: {
        config: {
            placeholder: 'Search...',
            prefixIcon: { name: IconName.search, size: 'md' },
        },
    },
    render: (args) => ({
        props: args,
        template: `<div style="max-width: 300px;"><orca-input [config]="config"></orca-input></div>`,
    }),
};

export const Small: Story = {
    args: {
        config: {
            placeholder: 'Small Input...',
            size: 'sm',
            prefixIcon: { name: IconName.search, size: 'sm' },
        },
    },
    render: (args) => ({
        props: args,
        template: `<div style="max-width: 300px;"><orca-input [config]="config"></orca-input></div>`,
    }),
};

export const WithHint: Story = {
    args: {
        config: {
            label: 'Label',
            placeholder: 'Enter text...',
            hint: 'This is a helpful hint.',
        },
    },
    render: (args) => ({
        props: args,
        template: `<orca-input [config]="config"></orca-input>`,
    }),
};

export const WithValue: Story = {
    args: {
        config: {
            label: 'Label',
        },
        value: 'Orca Core',
    },
    render: (args) => ({
        props: args,
        template: `<orca-input [config]="config" [value]="value"></orca-input>`,
    }),
};

export const Focused: Story = {
    args: {
        config: {
            label: 'Active/Focused',
            placeholder: 'Enter text...',
        },
    },
    render: (args) => ({
        props: args,
        template: `<orca-input [config]="config"></orca-input>`,
    }),
};

export const ErrorState: Story = {
    args: {
        config: {
            label: 'Error State',
            error: 'Critical system failure',
            hint: 'Check your logs for details.',
        },
        value: 'Invalid value',
    },
    render: (args) => ({
        props: args,
        template: `<orca-input [config]="config" [value]="value"></orca-input>`,
    }),
};

export const Disabled: Story = {
    args: {
        config: {
            label: 'Disabled',
            disabled: true,
        },
        value: 'System Locked',
    },
    render: (args) => ({
        props: args,
        template: `<orca-input [config]="config" [value]="value"></orca-input>`,
    }),
};
