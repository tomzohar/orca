import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ListComponent } from './list.component';

const meta: Meta<ListComponent> = {
  title: 'Components/Containers/List',
  component: ListComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [],
    }),
  ],
};

export default meta;
type Story = StoryObj<ListComponent>;

export const Expandable: Story = {
  args: {
    config: {
      expandable: true,
      showIcons: true,
      multipleExpanded: false,
      items: [
        {
          id: '1',
          title: 'Agent Job #1234',
          description: 'Completed 2 minutes ago',
          icon: 'check',
          badge: '3',
          content: 'This is the detailed content of the first agent job. It includes logs, artifacts, and execution details.',
        },
        {
          id: '2',
          title: 'Agent Job #1233',
          description: 'Running...',
          icon: 'info',
          content: 'This job is currently in progress. You can view real-time logs and monitor its execution.',
        },
        {
          id: '3',
          title: 'Agent Job #1232',
          description: 'Failed',
          icon: 'error',
          badge: '!',
          content: 'This job encountered an error during execution. Check the logs for more details.',
        },
        {
          id: '4',
          title: 'Agent Job #1231',
          description: 'Pending',
          icon: 'warning',
          disabled: true,
          content: 'This job is waiting in the queue.',
        },
      ],
    },
  },
};

export const MultipleExpanded: Story = {
  args: {
    config: {
      expandable: true,
      showIcons: true,
      multipleExpanded: true,
      items: [
        {
          id: '1',
          title: 'Section 1: Overview',
          icon: 'dashboard',
          content: 'This section provides an overview of the system architecture and key components.',
        },
        {
          id: '2',
          title: 'Section 2: Configuration',
          icon: 'settings',
          content: 'Here you can configure various settings for the application.',
        },
        {
          id: '3',
          title: 'Section 3: Advanced',
          icon: 'info',
          content: 'Advanced configuration options for power users.',
        },
      ],
    },
  },
};

export const SimpleList: Story = {
  args: {
    config: {
      expandable: false,
      showIcons: true,
      items: [
        {
          id: '1',
          title: 'Dashboard',
          description: 'View system overview',
          icon: 'dashboard',
        },
        {
          id: '2',
          title: 'Projects',
          description: 'Manage your projects',
          icon: 'view_kanban',
          badge: '5',
        },
        {
          id: '3',
          title: 'Settings',
          description: 'Configure application',
          icon: 'settings',
        },
        {
          id: '4',
          title: 'Help',
          description: 'Get support',
          icon: 'info',
          disabled: true,
        },
      ],
    },
  },
};

export const WithoutIcons: Story = {
  args: {
    config: {
      expandable: true,
      showIcons: false,
      items: [
        {
          id: '1',
          title: 'Item 1',
          content: 'Content for item 1',
        },
        {
          id: '2',
          title: 'Item 2',
          badge: 'New',
          content: 'Content for item 2',
        },
        {
          id: '3',
          title: 'Item 3',
          content: 'Content for item 3',
        },
      ],
    },
  },
};

export const MinimalList: Story = {
  args: {
    config: {
      expandable: false,
      showIcons: false,
      items: [
        {
          id: '1',
          title: 'Simple Item 1',
        },
        {
          id: '2',
          title: 'Simple Item 2',
        },
        {
          id: '3',
          title: 'Simple Item 3',
        },
      ],
    },
  },
};

export const WithBadges: Story = {
  args: {
    config: {
      expandable: false,
      showIcons: true,
      items: [
        {
          id: '1',
          title: 'Inbox',
          icon: 'info',
          badge: '12',
        },
        {
          id: '2',
          title: 'Unread',
          icon: 'warning',
          badge: '5',
        },
        {
          id: '3',
          title: 'Starred',
          icon: 'check',
          badge: '3',
        },
      ],
    },
  },
};
