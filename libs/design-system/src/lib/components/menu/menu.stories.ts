import type { Meta, StoryObj } from '@storybook/angular';
import { MenuComponent } from './menu.component';
import { moduleMetadata } from '@storybook/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

const meta: Meta<MenuComponent> = {
    title: 'Components/Menu',
    component: MenuComponent,
    tags: ['autodocs'],
    decorators: [
        moduleMetadata({
            imports: [BrowserAnimationsModule, RouterTestingModule],
        }),
    ],
};

export default meta;
type Story = StoryObj<MenuComponent>;

export const Default: Story = {
    args: {
        config: {
            items: [
                { label: 'Item 1', icon: 'settings' },
                { label: 'Item 2', icon: 'logout' },
            ],
        },
    },
};

export const WithButtonTrigger: Story = {
    args: {
        config: {
            triggerVariant: 'button',
            triggerLabel: 'Actions',
            triggerIcon: 'expand_more',
            items: [
                { label: 'Edit', icon: 'edit' },
                { label: 'Delete', icon: 'delete', danger: true },
            ],
        },
    },
};

export const WithDivider: Story = {
    args: {
        config: {
            triggerVariant: 'icon',
            items: [
                { label: 'Profile', icon: 'person' },
                { label: 'Settings', icon: 'settings' },
                { label: '', divider: true },
                { label: 'Logout', icon: 'logout', danger: true },
            ]
        }
    }
};
