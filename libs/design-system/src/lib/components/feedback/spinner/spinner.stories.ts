import type { Meta, StoryObj } from '@storybook/angular';
import { SpinnerComponent } from './spinner.component';

const meta: Meta<SpinnerComponent> = {
    title: 'Components/Feedback/Spinner',
    component: SpinnerComponent,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<SpinnerComponent>;

export const Default: Story = {
    args: {
        config: { size: 'md' }
    }
};

export const Sizes: Story = {
    render: (args) => ({
        props: args,
        template: `
            <div style="display: flex; gap: 32px; align-items: center;">
                <orca-spinner [config]="{ size: 'sm' }"></orca-spinner>
                <orca-spinner [config]="{ size: 'md' }"></orca-spinner>
                <orca-spinner [config]="{ size: 'lg' }"></orca-spinner>
            </div>
        `
    })
};

export const Custom: Story = {
    args: {
        config: { diameter: 100, strokeWidth: 10, color: 'warn' }
    }
};
