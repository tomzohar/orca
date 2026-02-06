import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DropdownComponent } from './dropdown.component';

const meta: Meta<DropdownComponent> = {
    title: 'Components/Selection/Dropdown',
    component: DropdownComponent,
    decorators: [
        moduleMetadata({
            imports: [CommonModule, BrowserAnimationsModule, DropdownComponent],
        }),
    ],
    tags: ['autodocs'],
    argTypes: {
        config: {
            control: 'object',
        },
        value: {
            control: 'text',
        },
    },
};

export default meta;
type Story = StoryObj<DropdownComponent>;

const options = [
    { label: 'Active', value: 'active' },
    { label: 'Offline', value: 'offline' },
    { label: 'Maintenance', value: 'maintenance' },
];

export const WithHint: Story = {
    args: {
        config: {
            label: 'Select Status',
            placeholder: 'Choose a status',
            hint: 'This is a helpful hint.',
            options: options,
        },
    },
};

export const WithValue: Story = {
    args: {
        config: {
            label: 'Agent Role',
            placeholder: 'Choose a role',
            options: [
                { label: 'Developer', value: 'developer' },
                { label: 'Architect', value: 'architect' },
                { label: 'Product Owner', value: 'po' },
            ],
        },
        value: 'architect',
    },
};

export const Disabled: Story = {
    args: {
        config: {
            label: 'Disabled Dropdown',
            placeholder: 'Cannot select',
            disabled: true,
            options: options,
        },
    },
};

export const Error: Story = {
    args: {
        config: {
            label: 'Dropdown with Error',
            placeholder: 'Choose a status',
            error: 'This field is required',
            options: options,
        },
    },
};

export const LargeList: Story = {
    args: {
        config: {
            label: 'Many Options',
            placeholder: 'Select one',
            options: Array.from({ length: 20 }, (_, i) => ({
                label: `Option ${i + 1}`,
                value: `opt${i + 1}`,
            })),
        },
    },
};
