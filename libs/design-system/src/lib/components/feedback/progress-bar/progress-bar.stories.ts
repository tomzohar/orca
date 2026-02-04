import type { Meta, StoryObj } from '@storybook/angular';
import { ProgressBarComponent } from './progress-bar.component';

const meta: Meta<ProgressBarComponent> = {
    title: 'Components/Feedback/ProgressBar',
    component: ProgressBarComponent,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ProgressBarComponent>;

export const Determinate: Story = {
    args: {
        config: { value: 60, mode: 'determinate' }
    }
};

export const Indeterminate: Story = {
    args: {
        config: { mode: 'indeterminate' }
    }
};

export const Sizes: Story = {
    render: (args) => ({
        props: args,
        template: `
            <div style="display: flex; flex-direction: column; gap: 24px;">
                <orca-progress-bar [config]="{ value: 40, size: 'sm' }"></orca-progress-bar>
                <orca-progress-bar [config]="{ value: 60, size: 'lg' }"></orca-progress-bar>
                <orca-progress-bar [config]="{ value: 80, size: 'xl' }"></orca-progress-bar>
            </div>
        `
    })
};
