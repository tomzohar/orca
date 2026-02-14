import { Meta, StoryObj } from '@storybook/angular';
import { AvatarComponent } from './avatar.component';

const meta: Meta<AvatarComponent> = {
  title: 'Components/Avatar',
  component: AvatarComponent,
  tags: ['autodocs'],
  argTypes: {
    config: {
      description: 'Configuration object for the avatar',
      control: 'object',
    },
  },
};

export default meta;
type Story = StoryObj<AvatarComponent>;

// Basic examples
export const WithImage: Story = {
  args: {
    config: {
      src: '/assets/avatar-example.jpg',
      alt: 'User avatar',
      size: 'md',
      shape: 'circular',
    },
  },
};

export const WithInitials: Story = {
  args: {
    config: {
      initials: 'JD',
      size: 'md',
      shape: 'circular',
    },
  },
};

export const WithGeneratedInitials: Story = {
  args: {
    config: {
      name: 'John Doe',
      size: 'md',
      shape: 'circular',
    },
  },
};

export const WithIcon: Story = {
  args: {
    config: {
      size: 'md',
      shape: 'circular',
      showIcon: true,
    },
  },
};

// Size variants
export const AllSizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
        <div style="text-align: center;">
          <orca-avatar [config]="{ initials: 'SM', size: 'sm' }" />
          <div style="margin-top: 8px; font-size: 12px;">Small (32px)</div>
        </div>
        <div style="text-align: center;">
          <orca-avatar [config]="{ initials: 'MD', size: 'md' }" />
          <div style="margin-top: 8px; font-size: 12px;">Medium (48px)</div>
        </div>
        <div style="text-align: center;">
          <orca-avatar [config]="{ initials: 'LG', size: 'lg' }" />
          <div style="margin-top: 8px; font-size: 12px;">Large (64px)</div>
        </div>
        <div style="text-align: center;">
          <orca-avatar [config]="{ initials: 'XL', size: 'xl' }" />
          <div style="margin-top: 8px; font-size: 12px;">Extra Large (96px)</div>
        </div>
      </div>
    `,
  }),
};

// Shape variants
export const Shapes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
        <div style="text-align: center;">
          <orca-avatar [config]="{ initials: 'JD', shape: 'circular', size: 'lg' }" />
          <div style="margin-top: 8px; font-size: 12px;">Circular</div>
        </div>
        <div style="text-align: center;">
          <orca-avatar [config]="{ initials: 'JD', shape: 'square', size: 'lg' }" />
          <div style="margin-top: 8px; font-size: 12px;">Square</div>
        </div>
      </div>
    `,
  }),
};

// Status indicators
export const WithStatus: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
        <div style="text-align: center;">
          <orca-avatar [config]="{
            initials: 'ON',
            size: 'lg',
            showStatus: true,
            status: 'online'
          }" />
          <div style="margin-top: 8px; font-size: 12px;">Online</div>
        </div>
        <div style="text-align: center;">
          <orca-avatar [config]="{
            initials: 'OF',
            size: 'lg',
            showStatus: true,
            status: 'offline'
          }" />
          <div style="margin-top: 8px; font-size: 12px;">Offline</div>
        </div>
        <div style="text-align: center;">
          <orca-avatar [config]="{
            initials: 'AW',
            size: 'lg',
            showStatus: true,
            status: 'away'
          }" />
          <div style="margin-top: 8px; font-size: 12px;">Away</div>
        </div>
        <div style="text-align: center;">
          <orca-avatar [config]="{
            initials: 'BY',
            size: 'lg',
            showStatus: true,
            status: 'busy'
          }" />
          <div style="margin-top: 8px; font-size: 12px;">Busy</div>
        </div>
      </div>
    `,
  }),
};

// Custom colors
export const CustomColors: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
        <orca-avatar [config]="{
          initials: 'BL',
          size: 'lg',
          backgroundColor: '#1976d2',
          textColor: 'white'
        }" />
        <orca-avatar [config]="{
          initials: 'GR',
          size: 'lg',
          backgroundColor: '#388e3c',
          textColor: 'white'
        }" />
        <orca-avatar [config]="{
          initials: 'OR',
          size: 'lg',
          backgroundColor: '#f57c00',
          textColor: 'white'
        }" />
        <orca-avatar [config]="{
          initials: 'PU',
          size: 'lg',
          backgroundColor: '#7b1fa2',
          textColor: 'white'
        }" />
      </div>
    `,
  }),
};

// Image with fallback
export const ImageWithFallback: Story = {
  name: 'Image with Fallback to Initials',
  render: () => ({
    template: `
      <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
        <div style="text-align: center;">
          <orca-avatar [config]="{
            src: '/assets/valid-image.jpg',
            name: 'Valid Image',
            size: 'lg'
          }" />
          <div style="margin-top: 8px; font-size: 12px;">Valid Image</div>
        </div>
        <div style="text-align: center;">
          <orca-avatar [config]="{
            src: '/assets/invalid-image.jpg',
            name: 'Broken Image',
            size: 'lg'
          }" />
          <div style="margin-top: 8px; font-size: 12px;">Broken Image (shows initials)</div>
        </div>
      </div>
    `,
  }),
};

// Use cases
export const UserList: Story = {
  name: 'Use Case: User List',
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; max-width: 300px;">
        <div style="display: flex; align-items: center; gap: 12px; padding: 8px;">
          <orca-avatar [config]="{
            name: 'Alice Johnson',
            size: 'sm',
            showStatus: true,
            status: 'online'
          }" />
          <div>
            <div style="font-weight: 500;">Alice Johnson</div>
            <div style="color: #666; font-size: 12px;">Product Manager</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; padding: 8px;">
          <orca-avatar [config]="{
            name: 'Bob Smith',
            size: 'sm',
            showStatus: true,
            status: 'away'
          }" />
          <div>
            <div style="font-weight: 500;">Bob Smith</div>
            <div style="color: #666; font-size: 12px;">Developer</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; padding: 8px;">
          <orca-avatar [config]="{
            name: 'Carol Davis',
            size: 'sm',
            showStatus: true,
            status: 'offline'
          }" />
          <div>
            <div style="font-weight: 500;">Carol Davis</div>
            <div style="color: #666; font-size: 12px;">Designer</div>
          </div>
        </div>
      </div>
    `,
  }),
};

export const ProfileHeader: Story = {
  name: 'Use Case: Profile Header',
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: 20px; padding: 24px; background: #f5f5f5; border-radius: 8px;">
        <orca-avatar [config]="{
          name: 'Sarah Wilson',
          size: 'xl',
          showStatus: true,
          status: 'online'
        }" />
        <div>
          <h2 style="margin: 0 0 4px 0;">Sarah Wilson</h2>
          <p style="margin: 0; color: #666;">Senior Software Engineer</p>
          <p style="margin: 4px 0 0 0; color: #888; font-size: 14px;">
            San Francisco, CA • Joined March 2022
          </p>
        </div>
      </div>
    `,
  }),
};

// Interactive examples
export const SmallSize: Story = {
  args: {
    config: {
      initials: 'SM',
      size: 'sm',
    },
  },
};

export const MediumSize: Story = {
  args: {
    config: {
      initials: 'MD',
      size: 'md',
    },
  },
};

export const LargeSize: Story = {
  args: {
    config: {
      initials: 'LG',
      size: 'lg',
    },
  },
};

export const ExtraLargeSize: Story = {
  args: {
    config: {
      initials: 'XL',
      size: 'xl',
    },
  },
};

export const CircularShape: Story = {
  args: {
    config: {
      initials: 'CI',
      shape: 'circular',
      size: 'lg',
    },
  },
};

export const SquareShape: Story = {
  args: {
    config: {
      initials: 'SQ',
      shape: 'square',
      size: 'lg',
    },
  },
};

export const OnlineStatus: Story = {
  args: {
    config: {
      initials: 'ON',
      size: 'lg',
      showStatus: true,
      status: 'online',
    },
  },
};

export const CustomContent: Story = {
  name: 'With Custom Content',
  render: () => ({
    template: `
      <orca-avatar [config]="{ size: 'lg', shape: 'circular' }">
        <span style="font-size: 24px;">🎨</span>
      </orca-avatar>
    `,
  }),
};