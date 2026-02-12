import type { Meta, StoryObj } from '@storybook/angular';
import { SidebarComponent } from './sidebar.component';
import { IconName } from '../../types/component.types';

const meta: Meta<SidebarComponent> = {
  title: 'Components/Sidebar',
  component: SidebarComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<SidebarComponent>;

export const Default: Story = {
  args: {
    config: {
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: { name: IconName.dashboard }, isActive: true },
        { id: 'orchestration', label: 'Orchestration', icon: { name: IconName.view_kanban } },
        { id: 'intervention', label: 'Intervention', icon: { name: IconName.construction } },
        { id: 'agents', label: 'Agents', icon: { name: IconName.settings } },
        { id: 'design-system', label: 'Design System', icon: { name: IconName.code } },
        { id: 'settings', label: 'Settings', icon: { name: IconName.settings } },
      ],
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="height: 900px; display: flex; background: #000c21; --sidebar-width: 239px;">
        <orca-sidebar [config]="config">
          <div header>
            <h2 style="color: #2979ff; font-size: 20px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin: 0; font-family: 'Inter', sans-serif;">ORCA</h2>
          </div>
          <div footer class="user-profile">
            <div class="avatar">H</div>
            <div class="info">
              <span class="name">Human Operator</span>
              <span class="role">God Mode</span>
            </div>
          </div>
        </orca-sidebar>
      </div>
    `,
    styles: [
      `
      .user-profile {
        display: flex;
        align-items: center;
        gap: 16px;
        width: 100%;
        .avatar {
          background-color: #00E5FF;
          color: #001021;
          width: 40px;
          height: 40px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-family: 'Inter', sans-serif;
        }
        .info {
          display: flex;
          flex-direction: column;
          .name { color: white; font-size: 14px; font-weight: 600; }
          .role { color: #b0bec5; font-size: 12px; }
        }
      }
    `,
    ],
  }),
};
