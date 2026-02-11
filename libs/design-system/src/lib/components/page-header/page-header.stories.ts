import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { PageHeaderComponent } from './page-header.component';
import { MatButtonModule } from '@angular/material/button';
import { IconComponent } from '../icon/icon.component';

const meta: Meta<PageHeaderComponent> = {
    title: 'Components/Page Header',
    component: PageHeaderComponent,
    tags: ['autodocs'],
    argTypes: {
        title: { control: 'text' },
        subTitle: { control: 'text' },
        icon: { control: 'text' },
    },
    decorators: [
        moduleMetadata({
            imports: [MatButtonModule, IconComponent]
        })
    ]
};

export default meta;
type Story = StoryObj<PageHeaderComponent>;

export const Default: Story = {
    args: {
        title: 'Page Title',
    },
};

export const WithSubtitle: Story = {
    args: {
        title: 'Dashboard',
        subTitle: 'Overview of your project statistics',
    },
};

export const WithIcon: Story = {
    args: {
        title: 'Settings',
        icon: 'settings',
    },
};

export const WithActions: Story = {
    args: {
        title: 'Users',
        subTitle: 'Manage system users',
    },
    render: (args) => ({
        props: args,
        template: `
      <orca-page-header [title]="title" [subTitle]="subTitle">
        <div actions>
          <button mat-flat-button color="primary">Add User</button>
        </div>
      </orca-page-header>
    `,
    }),
};

export const FullFeature: Story = {
    args: {
        title: 'Project Details',
        icon: 'folder',
        subTitle: 'Edit project configuration',
    },
    render: (args) => ({
        props: args,
        template: `
      <orca-page-header [title]="title" [subTitle]="subTitle" [icon]="icon">
        <button start mat-icon-button>
            <orca-icon [config]="{name: 'arrow_back'}"></orca-icon>
        </button>
        <div actions style="display: flex; gap: 8px;">
          <button mat-stroked-button>Cancel</button>
          <button mat-flat-button color="primary">Save Changes</button>
        </div>
      </orca-page-header>
    `,
    }),
};
