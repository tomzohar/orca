import type { Meta, StoryObj } from '@storybook/angular';
import { TabsComponent } from './tabs.component';
import { moduleMetadata } from '@storybook/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const meta: Meta<TabsComponent> = {
    title: 'Components/Tabs',
    component: TabsComponent,
    tags: ['autodocs'],
    decorators: [
        moduleMetadata({
            imports: [BrowserAnimationsModule],
        }),
    ],
    argTypes: {
        config: { control: 'object' },
    },
};

export default meta;
type Story = StoryObj<TabsComponent>;

export const Default: Story = {
    args: {
        config: {
            tabs: [
                { label: 'Overview' },
                { label: 'Details' },
                { label: 'Settings' },
            ],
            selectedIndex: 0,
        },
    },
};


// Re-defining WithIcons to use valid icons from type definition
export const WithIconsCorrect: Story = {
    name: 'With Icons',
    args: {
        config: {
            tabs: [
                { label: 'Home', icon: 'home' },
                { label: 'Search', icon: 'search' },
                { label: 'Settings', icon: 'settings' },
            ],
        },
    },
};


export const Centered: Story = {
    args: {
        config: {
            tabs: [
                { label: 'Tab 1' },
                { label: 'Tab 2' },
                { label: 'Tab 3' },
            ],
            alignment: 'center',
        },
    },
};

export const WithDisabledTab: Story = {
    args: {
        config: {
            tabs: [
                { label: 'Enabled Tab', icon: 'check' },
                { label: 'Disabled Tab', icon: 'block', disabled: true }, // 'block' might not be valid, let's check or remove icon
                { label: 'Another Tab' },
            ],
        },
    },
};

export const HeaderBelow: Story = {
    args: {
        config: {
            tabs: [
                { label: 'Top' },
                { label: 'Middle' },
                { label: 'Bottom' },
            ],
            headerPosition: 'below',
        },
    },
};
