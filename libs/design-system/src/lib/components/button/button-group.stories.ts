import { Meta, StoryObj } from '@storybook/angular';
import { ButtonGroupComponent } from './button-group.component';
import { IconName } from '../../types/component.types';

const meta: Meta<ButtonGroupComponent> = {
  title: 'Components/Button Group',
  component: ButtonGroupComponent,
  tags: ['autodocs'],
  argTypes: {
    config: {
      description: 'Configuration object for the button group',
      control: 'object',
    },
    selectionChanged: {
      description: 'Emitted when selection changes',
      action: 'selectionChanged',
    },
  },
};

export default meta;
type Story = StoryObj<ButtonGroupComponent>;

export const Default: Story = {
  args: {
    config: {
      buttons: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' },
      ],
      selected: 'option1',
    },
  },
};

export const WithIcons: Story = {
  args: {
    config: {
      buttons: [
        { label: 'Kanban', value: 'kanban', icon: { name: IconName.view_kanban } },
        { label: 'Table', value: 'table', icon: { name: IconName.view_list } },
      ],
      selected: 'kanban',
    },
  },
};

export const PrimaryVariant: Story = {
  args: {
    config: {
      buttons: [
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' },
      ],
      selected: 'weekly',
      variant: 'primary',
    },
  },
};

export const SecondaryVariant: Story = {
  args: {
    config: {
      buttons: [
        { label: 'Grid', value: 'grid' },
        { label: 'List', value: 'list' },
      ],
      selected: 'grid',
      variant: 'secondary',
    },
  },
};

export const WithDisabled: Story = {
  args: {
    config: {
      buttons: [
        { label: 'Enabled', value: 'enabled' },
        { label: 'Disabled', value: 'disabled', disabled: true },
        { label: 'Also Enabled', value: 'enabled2' },
      ],
      selected: 'enabled',
    },
  },
};

export const Interactive: Story = {
  render: (args) => ({
    props: {
      ...args,
      currentSelection: 'kanban',
      onSelectionChange: (value: string) => {
        console.log('Selection changed to:', value);
      },
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <orca-button-group
          [config]="{
            buttons: [
              { label: 'Kanban', value: 'kanban', icon: { name: 'view_kanban' } },
              { label: 'Table', value: 'table', icon: { name: 'view_list' } }
            ],
            selected: currentSelection
          }"
          (selectionChanged)="currentSelection = $event; onSelectionChange($event)"
        />
        <p style="color: #d5d5d5;">Current selection: <strong>{{ currentSelection }}</strong></p>
      </div>
    `,
  }),
};
