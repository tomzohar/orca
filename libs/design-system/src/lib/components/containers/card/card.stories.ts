import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { CardComponent } from './card.component';
import { ButtonComponent } from '../../button/button.component';

const meta: Meta<CardComponent> = {
  title: 'Components/Containers/Card',
  component: CardComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ButtonComponent],
    }),
  ],
};

export default meta;
type Story = StoryObj<CardComponent>;

export const Elevated: Story = {
  args: {
    config: {
      variant: 'elevated',
      title: 'Elevated Card',
      subtitle: 'Standard container for most content.',
      showActions: true,
    }
  },
  render: (args) => ({
    props: args,
    template: `
      <orca-card [config]="config">
        <p>This is the content area of the elevated card. It uses the "Ocean Surface" background color and has a distinct drop shadow.</p>
        <div actions>
          <orca-button [config]="{ variant: 'primary' }">Action</orca-button>
        </div>
      </orca-card>
    `
  }),
};

export const Outlined: Story = {
  args: {
    config: {
      variant: 'outlined',
      title: 'Outlined Card',
      subtitle: 'Used for secondary content.',
      showActions: true,
    }
  },
  render: (args) => ({
    props: args,
    template: `
      <orca-card [config]="config">
        <p>This is the content area of the outlined card. It has a thin border and no shadow, making it feel lighter.</p>
        <div actions>
          <orca-button [config]="{ variant: 'secondary' }">Details</orca-button>
        </div>
      </orca-card>
    `
  }),
};
