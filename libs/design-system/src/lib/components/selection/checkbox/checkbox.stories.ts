import type { Meta, StoryObj } from '@storybook/angular';
import { CheckboxComponent } from './checkbox.component';

const meta: Meta<CheckboxComponent> = {
    title: 'Components/Selection/Checkbox',
    component: CheckboxComponent,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<CheckboxComponent>;

export const Default: Story = {
    args: {
        checked: false,
    },
    render: (args) => ({
        props: args,
        template: `<orca-checkbox [checked]="checked">Checkbox Label</orca-checkbox>`
    }),
};

export const Selected: Story = {
    args: {
        checked: true,
    },
    render: (args) => ({
        props: args,
        template: `<orca-checkbox [checked]="checked">Selected</orca-checkbox>`
    }),
};

export const Indeterminate: Story = {
    args: {
        config: { indeterminate: true },
    },
    render: (args) => ({
        props: args,
        template: `<orca-checkbox [config]="config">Indeterminate</orca-checkbox>`
    }),
};

export const Disabled: Story = {
    args: {
        config: { disabled: true },
        checked: true,
    },
    render: (args) => ({
        props: args,
        template: `<orca-checkbox [config]="config" [checked]="checked">Disabled</orca-checkbox>`
    }),
};
