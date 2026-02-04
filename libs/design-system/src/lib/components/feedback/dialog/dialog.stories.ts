import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { DialogComponent } from './dialog.component';
import { ButtonComponent } from '../../button/button.component';

const meta: Meta<DialogComponent> = {
    title: 'Components/Feedback/Dialog',
    component: DialogComponent,
    tags: ['autodocs'],
    decorators: [
        moduleMetadata({
            imports: [ButtonComponent],
        }),
    ],
};

export default meta;
type Story = StoryObj<DialogComponent>;

export const Confirmation: Story = {
    args: {
        config: {
            title: 'Delete Project',
            subtitle: 'This action cannot be undone.',
            size: 'sm',
            actions: [
                { id: 'cancel', label: 'Cancel', variant: 'ghost' },
                { id: 'delete', label: 'Delete', variant: 'primary' }
            ]
        }
    },
    render: (args) => ({
        props: args,
        template: `
            <orca-dialog-container [config]="config">
                <p>Are you sure you want to delete the project <strong>"Agentic Orchestrator"</strong>? All associated data will be permanently removed.</p>
            </orca-dialog-container>
        `
    })
};

export const LargeWithContent: Story = {
    args: {
        config: {
            title: 'System Settings',
            subtitle: 'Configure your orchestration engine.',
            size: 'lg',
            actions: [
                { id: 'save', label: 'Save Changes', variant: 'primary' }
            ]
        }
    },
    render: (args) => ({
        props: args,
        template: `
            <orca-dialog-container [config]="config">
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    <section>
                        <h3>Agent Connectivity</h3>
                        <p>Configure how agents communicate across different environments.</p>
                        <div style="height: 100px; background: #111827; border-radius: 8px; border: 1px dashed #334155; display: flex; align-items: center; justify-content: center; color: #64748b;">
                            Connection Graph Visualization Placeholder
                        </div>
                    </section>
                    <section>
                        <h3>Security & Encryption</h3>
                        <p>Review and update your encryption keys and security protocols.</p>
                    </section>
                </div>
            </orca-dialog-container>
        `
    })
};

export const Sizes: Story = {
    render: (args) => ({
        props: args,
        template: `
            <div style="display: flex; flex-direction: column; gap: 40px; padding: 20px;">
                <orca-dialog-container [config]="{ title: 'Small Dialog', size: 'sm', showCloseButton: false }">
                    Small size (440px)
                </orca-dialog-container>
                
                <orca-dialog-container [config]="{ title: 'Medium Dialog', size: 'md', showCloseButton: false }">
                    Medium size (560px)
                </orca-dialog-container>

                <orca-dialog-container [config]="{ title: 'Extra Small Dialog', size: 'xs', showCloseButton: false }">
                    XS size (320px)
                </orca-dialog-container>
            </div>
        `
    })
};
