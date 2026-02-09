import type { Meta, StoryObj } from '@storybook/angular';
import { EmptyStateComponent } from './empty-state.component';

const meta: Meta<EmptyStateComponent> = {
    title: 'Components/Empty State',
    component: EmptyStateComponent,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<EmptyStateComponent>;

export const Default: Story = {
    args: {
        config: {
            imgSrc: '/assets/empty-state-img.png',
            title: 'No agents found',
            description: 'You haven\'t created any agents yet. Start by creating your first agent to help you with your tasks.',
            action: { label: 'Create Agent', variant: 'primary' },
        }
    },
};

export const NoImage: Story = {
    args: {
        config: {
            title: 'Empty Inbox',
            description: 'Your inbox is clear. You have no new notifications at this time.',
            action: { label: 'Refresh', variant: 'secondary' },
        }
    },
};

export const Minimal: Story = {
    args: {
        config: {
            title: 'Searching...',
            description: 'We are looking for matching results.',
        }
    },
};

export const OnlyTitle: Story = {
    args: {
        config: {
            title: 'Feature coming soon',
        }
    },
};
