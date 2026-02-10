import type { Meta, StoryObj } from '@storybook/angular';
import { TagInputComponent } from './tag-input.component';
import { signal } from '@angular/core';

const meta: Meta<TagInputComponent> = {
    title: 'Components/Tags',
    component: TagInputComponent,
    tags: ['autodocs'],
    argTypes: {
        label: {
            control: 'text',
            description: 'Label for the input field'
        },
        placeholder: {
            control: 'text',
            description: 'Placeholder text for the input'
        },
        disabled: {
            control: 'boolean',
            description: 'Whether the input is disabled'
        },
        tags: {
            control: 'object',
            description: 'Array of tags'
        }
    }
};

export default meta;
type Story = StoryObj<TagInputComponent>;

export const Default: Story = {
    args: {
        label: 'Exclude Patterns',
        placeholder: 'Add pattern and press Enter',
        disabled: false,
        tags: []
    }
};

export const WithInitialTags: Story = {
    args: {
        label: 'Exclude Patterns',
        placeholder: 'Add pattern and press Enter',
        disabled: false,
        tags: ['**/node_modules/**', '**/.git/**', '**/dist/**']
    }
};

export const Disabled: Story = {
    args: {
        label: 'Exclude Patterns',
        placeholder: 'Add pattern and press Enter',
        disabled: true,
        tags: ['**/node_modules/**', '**/.git/**']
    }
};

export const NoLabel: Story = {
    args: {
        label: '',
        placeholder: 'Add tags',
        disabled: false,
        tags: ['tag1', 'tag2', 'tag3']
    }
};

export const Interactive: Story = {
    args: {
        label: 'Custom Tags',
        placeholder: 'Type and press Enter',
        disabled: false,
        tags: ['example']
    },
    render: (args) => ({
        props: {
            ...args,
            tags: signal(args.tags || [])
        }
    })
};
