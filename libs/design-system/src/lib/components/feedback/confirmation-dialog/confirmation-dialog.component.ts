import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { DialogConfig } from '../../../types/component.types';

export interface ConfirmationDialogData {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

const DEFAULT_DATA: ConfirmationDialogData = {
  title: 'Confirm',
  message: 'Are you sure?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  danger: false,
};

@Component({
  selector: 'orca-confirmation-dialog',
  standalone: true,
  imports: [DialogComponent],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent {
  private readonly dialogRef = inject(DialogRef<boolean>);
  readonly data = inject(DIALOG_DATA) as ConfirmationDialogData;

  readonly config = {
    ...DEFAULT_DATA,
    ...this.data,
  };

  readonly dialogConfig: DialogConfig = {
    title: this.config.title,
    size: 'sm',
    showCloseButton: true,
    actions: [
      {
        id: 'cancel',
        label: this.config.cancelText!,
        variant: 'ghost' as const,
      },
      {
        id: 'confirm',
        label: this.config.confirmText!,
        variant: 'primary' as const,
      },
    ],
  };

  onClose(): void {
    this.dialogRef.close(false);
  }

  onActionClick(actionId: string): void {
    if (actionId === 'confirm') {
      this.dialogRef.close(true);
    } else {
      this.dialogRef.close(false);
    }
  }
}
