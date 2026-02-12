import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button.component';
import { IconName } from '../../types/component.types';

const meta: Meta<ButtonComponent> = {
    title: 'Components/Button',
    component: ButtonComponent,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Primary: Story = {
    args: {
        config: { variant: 'primary' },
    },
    render: (args) => ({
        props: args,
        template: `<orca-button [config]="config">Primary Button</orca-button>`,
    }),

};

export const Secondary: Story = {
    args: {
        config: { variant: 'secondary' },
    },
    render: (args) => ({
        props: args,
        template: `<orca-button [config]="config">Secondary Button</orca-button>`,
    }),
};

export const Ghost: Story = {
    args: {
        config: { variant: 'ghost' },
    },
    render: (args) => ({
        props: args,
        template: `<orca-button [config]="config">Ghost Button</orca-button>`,
    }),
};

export const Disabled: Story = {
    args: {
        config: { variant: 'ghost', disabled: true },
    },
    render: (args) => ({
        props: args,
        template: `<orca-button [config]="config">Disabled Button</orca-button>`,
    }),
};

export const IconButton: Story = {
    args: {
        config: { variant: 'primary', icon: { name: IconName.settings } },
    },
    render: (args) => ({
        props: args,
        template: `<orca-button [config]="config"></orca-button>`,
    }),
};

export const IconButtonWithText: Story = {
    args: {
        config: { variant: 'ghost', icon: { name: IconName.add } },
    },
    render: (args) => ({
        props: args,
        template: `<orca-button [config]="config">Add Item</orca-button>`,
    }),
};

export const Small: Story = {
    args: {
        config: { variant: 'primary', size: 'sm' },
    },
    render: (args) => ({
        props: args,
        template: `<orca-button [config]="config">Small Button</orca-button>`,
    }),
};

export const Medium: Story = {
    args: {
        config: { variant: 'primary', size: 'md' },
    },
    render: (args) => ({
        props: args,
        template: `<orca-button [config]="config">Medium Button</orca-button>`,
    }),
};

export const SmallWithIcon: Story = {
    args: {
        config: { variant: 'primary', size: 'sm', icon: { name: IconName.add } },
    },
    render: (args) => ({
        props: args,
        template: `<orca-button [config]="config">Small with Icon</orca-button>`,
    }),
};

