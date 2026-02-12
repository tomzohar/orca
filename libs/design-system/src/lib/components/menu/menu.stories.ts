import type { Meta, StoryObj } from '@storybook/angular';
import { MenuComponent } from './menu.component';
import { moduleMetadata } from '@storybook/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { IconName } from '../../types/component.types';

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
                { label: 'Item 1', icon: IconName.settings },
                { label: 'Item 2', icon: IconName.logout },
            ],
        },
    },
};

export const WithButtonTrigger: Story = {
    args: {
        config: {
            triggerVariant: 'button',
            triggerLabel: 'Actions',
            triggerIcon: IconName.expand_more,
            items: [
                { label: 'Edit', icon: IconName.edit },
                { label: 'Delete', icon: IconName.delete, danger: true },
            ],
        },
    },
};

export const WithDivider: Story = {
    args: {
        config: {
            triggerVariant: 'icon',
            items: [
                { label: 'Profile', icon: IconName.person },
                { label: 'Settings', icon: IconName.settings },
                { label: '', divider: true },
                { label: 'Logout', icon: IconName.logout, danger: true },
            ]
        }
    }
};
