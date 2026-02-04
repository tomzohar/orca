import { Component, input, model } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CheckboxConfig } from '../../../types/component.types';

const DEFAULT_CONFIG: CheckboxConfig = {
  disabled: false,
  indeterminate: false
};

@Component({
  selector: 'orca-checkbox',
  standalone: true,
  imports: [MatCheckboxModule],
  template: `
    <mat-checkbox
      [checked]="checked()"
      [disabled]="config().disabled!"
      [indeterminate]="config().indeterminate!"
      [color]="'primary'"
      (change)="onChange($event.checked)"
    >
      <ng-content></ng-content>
    </mat-checkbox>
  `,
  styleUrl: './checkbox.component.scss',
})
export class CheckboxComponent {
  config = input<CheckboxConfig, Partial<CheckboxConfig> | undefined>(DEFAULT_CONFIG, {
    transform: (value) => ({ ...DEFAULT_CONFIG, ...value })
  });

  checked = model<boolean>(false);

  onChange(value: boolean) {
    this.checked.set(value);
  }
}
