import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FillAvailableHeightDirective } from './fill-available-height.directive';
import { Component, input } from '@angular/core';

@Component({
  selector: 'orca-demo-container',
  standalone: true,
  imports: [FillAvailableHeightDirective],
  template: `
    <div
      [orcaFillAvailableHeight]="margin()"
      style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 8px;
        padding: 24px;
        color: white;
        overflow: auto;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      "
    >
      <h2 style="margin: 0 0 16px 0;">Fill Available Height Demo</h2>
      <p style="margin: 0 0 12px 0;">
        This container automatically fills the available height from its Y position to the bottom of the viewport.
      </p>
      <p style="margin: 0 0 12px 0;">
        Current margin: <strong>{{ margin() }}px</strong>
      </p>
      <p style="margin: 0;">
        Try resizing your browser window to see the height adjust dynamically!
      </p>
      <div style="margin-top: 24px; padding: 16px; background: rgba(255, 255, 255, 0.1); border-radius: 4px;">
        <p style="margin: 0 0 8px 0;"><strong>Usage:</strong></p>
        <code style="display: block; white-space: pre-wrap; font-size: 12px;">
&lt;div [orcaFillAvailableHeight]="marginValue"&gt;
  Content that fills available height
&lt;/div&gt;
        </code>
      </div>
    </div>
  `,
})
class DemoContainerComponent {
  margin = input<number>(0);
}

const meta: Meta<DemoContainerComponent> = {
  title: 'Directives/Fill Available Height',
  component: DemoContainerComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [FillAvailableHeightDirective],
    }),
  ],
  argTypes: {
    margin: {
      control: { type: 'number', min: 0, max: 200, step: 10 },
      description: 'Margin to subtract from the calculated height (in pixels)',
    },
  },
};

export default meta;
type Story = StoryObj<DemoContainerComponent>;

export const Default: Story = {
  args: {
    margin: 0,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding: 20px;">
        <h1 style="margin: 0 0 8px 0;">Page Header</h1>
        <p style="margin: 0 0 20px 0; color: #666;">
          This content is above the directive container
        </p>
        <orca-demo-container [margin]="margin" />
      </div>
    `,
  }),
};

export const WithMargin: Story = {
  args: {
    margin: 40,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding: 20px;">
        <h1 style="margin: 0 0 8px 0;">Page Header</h1>
        <p style="margin: 0 0 20px 0; color: #666;">
          Notice how the container has a 40px margin from the bottom
        </p>
        <orca-demo-container [margin]="margin" />
      </div>
    `,
  }),
};

export const WithLargeMargin: Story = {
  args: {
    margin: 100,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding: 20px;">
        <h1 style="margin: 0 0 8px 0;">Page Header</h1>
        <p style="margin: 0 0 20px 0; color: #666;">
          With a 100px margin, you can see more space at the bottom
        </p>
        <orca-demo-container [margin]="margin" />
      </div>
    `,
  }),
};

export const InLayout: Story = {
  args: {
    margin: 20,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; height: 100vh;">
        <header style="background: #1e293b; color: white; padding: 16px;">
          <h1 style="margin: 0;">Application Header</h1>
        </header>
        <div style="flex: 1; padding: 20px; background: #f1f5f9;">
          <orca-demo-container [margin]="margin" />
        </div>
      </div>
    `,
  }),
};
