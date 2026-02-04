import type { Meta, StoryObj } from '@storybook/angular';
import { SwitchComponent } from './switch.component';

const meta: Meta<SwitchComponent> = {
    title: 'Components/Selection/Switch',
    component: SwitchComponent,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<SwitchComponent>;

export const Default: Story = {
    args: {
        checked: false,
    },
    render: (args) => ({
        props: args,
        template: `<orca-switch [checked]="checked">Switch Label</orca-switch>`
    }),
};

export const Active: Story = {
    args: {
        checked: true,
    },
    render: (args) => ({
        props: args,
        template: `<orca-switch [checked]="checked">Active</orca-switch>`
    }),
};

export const Disabled: Story = {
    args: {
        config: { disabled: true },
        checked: true,
    },
    render: (args) => ({
        props: args,
        template: `<orca-switch [config]="config" [checked]="checked">Disabled</orca-switch>`
    }),
};
