import type { Meta, StoryObj } from '@storybook/angular';
import { DesignSystem } from './design-system';
import { expect } from 'storybook/test';

const meta: Meta<DesignSystem> = {
  component: DesignSystem,
  title: 'DesignSystem',
};
export default meta;

type Story = StoryObj<DesignSystem>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/design-system/gi)).toBeTruthy();
  },
};
