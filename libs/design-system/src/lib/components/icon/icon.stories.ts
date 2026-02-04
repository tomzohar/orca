import { Meta, StoryObj } from '@storybook/angular';
import { IconComponent } from './icon.component';

const meta: Meta<IconComponent> = {
    title: 'Components/Icon',
    component: IconComponent,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<IconComponent>;

export const Default: Story = {
    args: {
        config: { name: 'search' }
    }
};

export const Sizes: Story = {
    render: (args) => ({
        props: args,
        template: `
            <div style="display: flex; gap: 24px; align-items: center;">
                <orca-icon [config]="{ name: 'home', size: 'xs' }"></orca-icon>
                <orca-icon [config]="{ name: 'home', size: 'sm' }"></orca-icon>
                <orca-icon [config]="{ name: 'home', size: 'md' }"></orca-icon>
                <orca-icon [config]="{ name: 'home', size: 'lg' }"></orca-icon>
                <orca-icon [config]="{ name: 'home', size: 'xl' }"></orca-icon>
            </div>
        `
    })
};

export const Colors: Story = {
    render: (args) => ({
        props: args,
        template: `
            <div style="display: flex; gap: 24px; align-items: center;">
                <orca-icon [config]="{ name: 'check', color: '#4caf50' }"></orca-icon>
                <orca-icon [config]="{ name: 'error', color: '#f44336' }"></orca-icon>
                <orca-icon [config]="{ name: 'warning', color: '#ff9800' }"></orca-icon>
                <orca-icon [config]="{ name: 'info', color: '#2196f3' }"></orca-icon>
            </div>
        `
    })
};

export const IconsLibrary: Story = {
    render: (args) => {
        const icons = [
            'search', 'home', 'settings', 'menu', 'close',
            'check', 'error', 'warning', 'info', 'add',
            'remove', 'edit', 'delete', 'arrow_forward',
            'arrow_back', 'expand_more', 'expand_less'
        ];
        return {
            props: { ...args, icons },
            template: `
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 16px;">
                    @for (icon of icons; track icon) {
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px; border: 1px solid #334155; border-radius: 8px; background: #1e293b;">
                            <orca-icon [config]="{ name: icon }"></orca-icon>
                            <span style="font-size: 12px; color: #94a3b8;">{{ icon }}</span>
                        </div>
                    }
                </div>
            `
        };
    }
};
