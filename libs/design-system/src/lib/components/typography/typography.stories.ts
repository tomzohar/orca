import type { Meta, StoryObj } from '@storybook/angular';
import { TypographyShowcaseComponent } from './typography-showcase.component';

const meta: Meta<TypographyShowcaseComponent> = {
    title: 'Design System/Typography',
    component: TypographyShowcaseComponent,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<TypographyShowcaseComponent>;

export const Default: Story = {};
