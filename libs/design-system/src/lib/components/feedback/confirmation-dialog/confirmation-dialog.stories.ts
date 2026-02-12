import { Meta, StoryObj, moduleMetadata, applicationConfig } from '@storybook/angular';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { DialogService } from '../../../services/dialog.service';
import { ButtonComponent } from '../../button/button.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'orca-confirmation-demo',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <div style="padding: 20px;">
      <orca-button
        [config]="{ variant: 'primary' }"
        (clicked)="openConfirmation()"
      >
        Open Confirmation Dialog
      </orca-button>

      @if (result !== null) {
        <div style="margin-top: 16px; color: #d5d5d5;">
          Result: <strong>{{ result ? 'Confirmed' : 'Cancelled' }}</strong>
        </div>
      }
    </div>
  `,
})
class ConfirmationDemoComponent {
  result: boolean | null = null;


  private dialogService = inject(DialogService);

  openConfirmation() {
    const dialogRef = this.dialogService.open<boolean>(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Item',
        message: 'Are you sure you want to delete this item? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        danger: true,
      },
    });

    dialogRef.closed.subscribe((confirmed) => {
      this.result = confirmed ?? false;
    });
  }
}

const meta: Meta<ConfirmationDialogComponent> = {
  title: 'Components/Feedback/Dialog/Confirmation Dialog',
  component: ConfirmationDialogComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ConfirmationDemoComponent],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
};

export default meta;
type Story = StoryObj<ConfirmationDialogComponent>;

export const Interactive: Story = {
  render: () => ({
    template: '<orca-confirmation-demo></orca-confirmation-demo>',
  }),
};

export const DeleteConfirmation: Story = {
  render: () => ({
    template: '<orca-confirmation-demo></orca-confirmation-demo>',
  }),
  parameters: {
    docs: {
      description: {
        story: 'Example of a destructive action confirmation with danger styling.',
      },
    },
  },
};
