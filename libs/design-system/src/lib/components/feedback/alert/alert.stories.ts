import type { Meta, StoryObj } from '@storybook/angular';
import { AlertComponent } from './alert.component';

const meta: Meta<AlertComponent> = {
    title: 'Components/Feedback/Alert',
    component: AlertComponent,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<AlertComponent>;

export const Success: Story = {
    args: {
        config: {
            type: 'success',
            title: 'Success',
        }
    },
    render: (args) => ({
        props: args,
        template: `<orca-alert [config]="config">Your changes have been saved successfully.</orca-alert>`
    }),
};

export const Info: Story = {
    args: {
        config: {
            type: 'info',
            title: 'Information',
        }
    },
    render: (args) => ({
        props: args,
        template: `<orca-alert [config]="config">New updates are available for your account.</orca-alert>`
    }),
};

export const Warning: Story = {
    args: {
        config: {
            type: 'warning',
            title: 'Warning',
        }
    },
    render: (args) => ({
        props: args,
        template: `<orca-alert [config]="config">Your subscription will expire soon.</orca-alert>`
    }),
};

export const Error: Story = {
    args: {
        config: {
            type: 'error',
            title: 'Error',
        }
    },
    render: (args) => ({
        props: args,
        template: `<orca-alert [config]="config">Unable to connect to the server. Please try again.</orca-alert>`
    }),
};
