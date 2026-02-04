import type { Meta, StoryObj } from '@storybook/angular';
import { RadioComponent } from './radio.component';

const meta: Meta<RadioComponent> = {
    title: 'Components/Selection/Radio',
    component: RadioComponent,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<RadioComponent>;

export const Default: Story = {
    args: {
        config: {
            options: [
                { label: 'Option A', value: 'a' },
                { label: 'Option B', value: 'b' },
            ]
        },
        value: 'a',
    },
    render: (args) => ({
        props: args,
        template: `<orca-radio [config]="config" [value]="value"></orca-radio>`
    }),
};

export const Disabled: Story = {
    args: {
        config: {
            options: [
                { label: 'Option A', value: 'a', disabled: true },
                { label: 'Option B', value: 'b' },
            ]
        },
        value: 'b',
    },
    render: (args) => ({
        props: args,
        template: `<orca-radio [config]="config" [value]="value"></orca-radio>`
    }),
};
