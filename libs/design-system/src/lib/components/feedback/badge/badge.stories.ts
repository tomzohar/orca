import { Meta, StoryObj } from '@storybook/angular';
import { BadgeComponent } from './badge.component';

const meta: Meta<BadgeComponent> = {
  title: 'Components/Feedback/Badge',
  component: BadgeComponent,
  tags: ['autodocs'],
  argTypes: {
    config: {
      description: 'Configuration object for the badge',
      control: 'object',
    },
  },
};

export default meta;
type Story = StoryObj<BadgeComponent>;

export const Success: Story = {
  args: {
    config: {
      text: 'Completed',
      variant: 'success',
    },
  },
};

export const Info: Story = {
  args: {
    config: {
      text: 'Running',
      variant: 'info',
    },
  },
};

export const Warning: Story = {
  args: {
    config: {
      text: 'Waiting',
      variant: 'warning',
    },
  },
};

export const Error: Story = {
  args: {
    config: {
      text: 'Failed',
      variant: 'error',
    },
  },
};

export const Neutral: Story = {
  args: {
    config: {
      text: 'Pending',
      variant: 'neutral',
    },
  },
};

export const SmallSize: Story = {
  args: {
    config: {
      text: 'Small Badge',
      variant: 'info',
      size: 'sm',
    },
  },
};

export const MediumSize: Story = {
  args: {
    config: {
      text: 'Medium Badge',
      variant: 'success',
      size: 'md',
    },
  },
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
        <orca-badge [config]="{ text: 'Success', variant: 'success' }" />
        <orca-badge [config]="{ text: 'Info', variant: 'info' }" />
        <orca-badge [config]="{ text: 'Warning', variant: 'warning' }" />
        <orca-badge [config]="{ text: 'Error', variant: 'error' }" />
        <orca-badge [config]="{ text: 'Neutral', variant: 'neutral' }" />
      </div>
    `,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
        <orca-badge [config]="{ text: 'Small', variant: 'info', size: 'sm' }" />
        <orca-badge [config]="{ text: 'Medium', variant: 'info', size: 'md' }" />
      </div>
    `,
  }),
};
