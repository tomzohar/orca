import { Meta, StoryObj } from '@storybook/angular';
import { SidePanelComponent } from './side-panel.component';

const meta: Meta<SidePanelComponent> = {
    title: 'Components/Feedback/Side Panel',
    component: SidePanelComponent,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<SidePanelComponent>;

export const JobDetails: Story = {
    args: {
        config: {
            title: 'Job Details',
            subtitle: 'View and manage job information',
            position: 'right',
            size: 'md',
        }
    },
    render: (args) => ({
        props: args,
        template: `
            <orca-side-panel-container [config]="config">
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <section>
                        <h3>Agent Job #12345</h3>
                        <p style="color: var(--text-secondary);">Created 2 hours ago</p>
                    </section>
                    
                    <section>
                        <h4>Status</h4>
                        <div style="padding: 8px 12px; background: rgba(34, 197, 94, 0.1); border-radius: 6px; display: inline-block; color: #22c55e;">
                            Running
                        </div>
                    </section>
                    
                    <section>
                        <h4>Description</h4>
                        <p>Refactor the authentication service to use the new JWT token system with refresh token support.</p>
                    </section>
                    
                    <section>
                        <h4>Agent Type</h4>
                        <p>CLAUDE_SDK (Deep Mode)</p>
                    </section>
                    
                    <section>
                        <h4>Logs</h4>
                        <div style="background: #111827; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 0.875rem;">
                            <div>[12:34:56] Starting authentication refactor...</div>
                            <div>[12:35:12] Analyzing existing code structure...</div>
                            <div>[12:35:45] Creating new JWT service...</div>
                        </div>
                    </section>
                </div>
            </orca-side-panel-container>
        `
    })
};

export const Navigation: Story = {
    args: {
        config: {
            title: 'Navigation',
            position: 'left',
            size: 'sm',
        }
    },
    render: (args) => ({
        props: args,
        template: `
            <orca-side-panel-container [config]="config">
                <nav style="display: flex; flex-direction: column; gap: 8px;">
                    <a href="#" style="padding: 12px; border-radius: 6px; background: rgba(99, 102, 241, 0.1); color: #818cf8; text-decoration: none;">
                        Dashboard
                    </a>
                    <a href="#" style="padding: 12px; border-radius: 6px; color: var(--text-secondary); text-decoration: none;">
                        Projects
                    </a>
                    <a href="#" style="padding: 12px; border-radius: 6px; color: var(--text-secondary); text-decoration: none;">
                        Agent Jobs
                    </a>
                    <a href="#" style="padding: 12px; border-radius: 6px; color: var(--text-secondary); text-decoration: none;">
                        Settings
                    </a>
                </nav>
            </orca-side-panel-container>
        `
    })
};

export const SizeVariants: Story = {
    render: () => ({
        template: `
            <div style="display: flex; gap: 20px; padding: 20px; background: #0f172a; min-height: 400px; position: relative;">
                <div style="flex: 1; position: relative;">
                    <h4 style="margin-bottom: 12px;">Small (320px)</h4>
                    <orca-side-panel-container [config]="{ title: 'Small Panel', size: 'sm', position: 'left', showCloseButton: false }">
                        <p>Small size panel content</p>
                    </orca-side-panel-container>
                </div>
                
                <div style="flex: 1; position: relative;">
                    <h4 style="margin-bottom: 12px;">Medium (480px)</h4>
                    <orca-side-panel-container [config]="{ title: 'Medium Panel', size: 'md', position: 'left', showCloseButton: false }">
                        <p>Medium size panel content</p>
                    </orca-side-panel-container>
                </div>
                
                <div style="flex: 1; position: relative;">
                    <h4 style="margin-bottom: 12px;">Large (640px)</h4>
                    <orca-side-panel-container [config]="{ title: 'Large Panel', size: 'lg', position: 'left', showCloseButton: false }">
                        <p>Large size panel content</p>
                    </orca-side-panel-container>
                </div>
            </div>
        `
    })
};

export const PositionVariants: Story = {
    render: () => ({
        template: `
            <div style="display: flex; gap: 20px; padding: 20px; background: #0f172a; min-height: 400px;">
                <div style="flex: 1; position: relative;">
                    <h4 style="margin-bottom: 12px;">Left Position</h4>
                    <orca-side-panel-container [config]="{ title: 'Left Panel', position: 'left', size: 'sm' }">
                        <p>Panel slides from the left</p>
                    </orca-side-panel-container>
                </div>
                
                <div style="flex: 1; position: relative;">
                    <h4 style="margin-bottom: 12px;">Right Position</h4>
                    <orca-side-panel-container [config]="{ title: 'Right Panel', position: 'right', size: 'sm' }">
                        <p>Panel slides from the right</p>
                    </orca-side-panel-container>
                </div>
            </div>
        `
    })
};
