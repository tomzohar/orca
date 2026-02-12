import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { TopbarComponent } from './topbar.component';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import { InputComponent } from '../input/input.component';
import { IconName } from '../../types/component.types';

const meta: Meta<TopbarComponent> = {
  title: 'Components/Topbar',
  component: TopbarComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ButtonComponent, IconComponent, InputComponent],
    }),
  ],
};

export default meta;
type Story = StoryObj<TopbarComponent>;

export const Default: Story = {
  args: {
    config: {
      showSearch: true,
      actions: [
        { id: 'notifications', icon: { name: IconName.info, size: 'sm' }, tooltip: 'Notifications' },
      ],
    },
  },
  render: (args) => ({
    props: args,
    template: `
        <orca-topbar [config]="config" (actionClick)="actionClick($event)">
           <div left style="display: flex; align-items: center; gap: 8px; margin-right: 16px;">
             <div style="background: rgba(105, 240, 174, 0.1); color: #69f0ae; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; letter-spacing: 1px;">SYSTEM: ONLINE</div>
           </div>
           <div right style="display: flex; align-items: center; gap: 8px;">
             <orca-button [config]="{ variant: 'primary', icon: { name: IconName.arrow_forward, color: '#69f0ae', size: 'sm' } }" (clicked)="actionClick({ id: 'play' })"></orca-button>
           </div>
        </orca-topbar>
    `,
  }),
};

export const Simple: Story = {
  args: {
    config: {
      showSearch: false,
      actions: [],
    },
  },
  render: (args) => ({
    props: args,
    template: `
        <orca-topbar [config]="config"></orca-topbar>
    `,
  }),
};
