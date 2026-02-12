import { Meta, StoryObj } from '@storybook/angular';
import { TableComponent } from './table.component';
import { IconName } from '../../../types/component.types';

interface JobData {
  id: number;
  status: string;
  type: string;
  prompt: string;
  createdAt: string;
}

const mockJobs: JobData[] = [
  {
    id: 1,
    status: 'COMPLETED',
    type: 'FILE_SYSTEM',
    prompt: 'Create a new authentication module',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
  },
  {
    id: 2,
    status: 'RUNNING',
    type: 'DOCKER',
    prompt: 'Refactor database schema',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
  },
  {
    id: 3,
    status: 'FAILED',
    type: 'FILE_SYSTEM',
    prompt: 'Deploy to production',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: 4,
    status: 'PENDING',
    type: 'DOCKER',
    prompt: 'Run integration tests',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1 day ago
  },
];

const meta: Meta<TableComponent<JobData>> = {
  title: 'Data Display/Table',
  component: TableComponent,
  tags: ['autodocs'],
  argTypes: {
    config: {
      description: 'Configuration object for the table',
      control: 'object',
    },
    rowClicked: {
      description: 'Emitted when a row is clicked',
      action: 'rowClicked',
    },
  },
};

export default meta;
type Story = StoryObj<TableComponent<JobData>>;

const getStatusBadgeConfig = (status: string) => {
  const configs: Record<string, any> = {
    COMPLETED: { text: 'Completed', variant: 'success' },
    RUNNING: { text: 'Running', variant: 'info' },
    FAILED: { text: 'Failed', variant: 'error' },
    PENDING: { text: 'Pending', variant: 'neutral' },
  };
  return configs[status] || { text: status, variant: 'neutral' };
};

export const Default: Story = {
  args: {
    config: {
      data: mockJobs,
      columns: [
        {
          key: 'status',
          label: 'Status',
          type: 'badge',
          sortable: true,
          width: '120px',
          badgeConfig: (job) => getStatusBadgeConfig(job.status),
        },
        {
          key: 'type',
          label: 'Type',
          sortable: true,
          width: '120px',
        },
        {
          key: 'prompt',
          label: 'Prompt',
          pipe: 'truncate',
          width: 'auto',
        },
        {
          key: 'createdAt',
          label: 'Created',
          type: 'text',
          pipe: 'relativeTime',
          sortable: true,
          width: '150px',
        },
      ],
    },
  },
};

export const WithActions: Story = {
  args: {
    config: {
      data: mockJobs,
      columns: [
        {
          key: 'status',
          label: 'Status',
          type: 'badge',
          width: '120px',
          badgeConfig: (job) => getStatusBadgeConfig(job.status),
        },
        {
          key: 'prompt',
          label: 'Prompt',
          pipe: 'truncate',
        },
        {
          key: 'actions',
          label: 'Actions',
          type: 'actions',
          width: '80px',
          actions: [
            {
              label: 'Cancel',
              icon: IconName.cancel,
              onClick: (job) => console.log('Cancel', job),
              visible: (job) => job.status === 'PENDING' || job.status === 'RUNNING',
            },
            {
              label: 'Retry',
              icon: IconName.refresh,
              onClick: (job) => console.log('Retry', job),
              visible: (job) => job.status === 'FAILED',
            },
            {
              label: 'Delete',
              icon: IconName.delete,
              onClick: (job) => console.log('Delete', job),
            },
          ],
        },
      ],
    },
  },
};

export const Loading: Story = {
  args: {
    config: {
      data: [],
      columns: [
        { key: 'status', label: 'Status' },
        { key: 'prompt', label: 'Prompt' },
      ],
      loading: true,
    },
  },
};

export const Empty: Story = {
  args: {
    config: {
      data: [],
      columns: [
        { key: 'status', label: 'Status' },
        { key: 'prompt', label: 'Prompt' },
      ],
      emptyMessage: 'No jobs found. Create your first job to get started.',
    },
  },
};

export const Error: Story = {
  args: {
    config: {
      data: [],
      columns: [
        { key: 'status', label: 'Status' },
        { key: 'prompt', label: 'Prompt' },
      ],
      error: 'Failed to load jobs. Please try again.',
    },
  },
};

export const Sortable: Story = {
  args: {
    config: {
      data: mockJobs,
      columns: [
        {
          key: 'id',
          label: 'ID',
          sortable: true,
          width: '80px',
        },
        {
          key: 'status',
          label: 'Status',
          type: 'badge',
          sortable: true,
          width: '120px',
          badgeConfig: (job) => getStatusBadgeConfig(job.status),
        },
        {
          key: 'prompt',
          label: 'Prompt',
          sortable: true,
        },
        {
          key: 'createdAt',
          label: 'Created',
          pipe: 'relativeTime',
          sortable: true,
          width: '150px',
        },
      ],
      sortable: true,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Click on column headers to sort. Click again to reverse sort order.',
      },
    },
  },
};

export const Clickable: Story = {
  render: (args) => ({
    props: {
      ...args,
      onRowClick: (job: JobData) => {
        console.log('Row clicked:', job);
        alert(`Clicked on job: ${job.prompt}`);
      },
    },
    template: `
      <orca-table
        [config]="{
          ...config,
          onRowClick: onRowClick,
          columns: [
            {
              key: 'status',
              label: 'Status',
              type: 'badge',
              width: '120px',
              badgeConfig: (job) => ({
                text: job.status,
                variant: job.status === 'COMPLETED' ? 'success' : 'info'
              })
            },
            { key: 'prompt', label: 'Prompt' }
          ]
        }"
      />
      <p style="color: #d5d5d5; margin-top: 16px;">
        Click on any row to see the alert
      </p>
    `,
  }),
  args: {
    config: {
      data: mockJobs,
      columns: [],
    },
  },
};
