import { Component, input, model } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SwitchConfig } from '../../../types/component.types';

const DEFAULT_CONFIG: SwitchConfig = {
  disabled: false
};

@Component({
  selector: 'orca-switch',
  standalone: true,
  imports: [MatSlideToggleModule],
  template: `
    <mat-slide-toggle
      [checked]="checked()"
      [disabled]="config().disabled!"
      [color]="'primary'"
      (change)="onChange($event.checked)"
    >
      <ng-content></ng-content>
    </mat-slide-toggle>
  `,
  styleUrl: './switch.component.scss',
})
export class SwitchComponent {
  config = input<SwitchConfig, Partial<SwitchConfig> | undefined>(DEFAULT_CONFIG, {
    transform: (value) => ({ ...DEFAULT_CONFIG, ...value })
  });

  checked = model<boolean>(false);

  onChange(value: boolean) {
    this.checked.set(value);
  }
}
