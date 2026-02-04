import { Component, input, model } from '@angular/core';
import { MatRadioModule } from '@angular/material/radio';
import { RadioConfig } from '../../../types/component.types';

const DEFAULT_CONFIG: RadioConfig = {
  options: []
};

@Component({
  selector: 'orca-radio',
  standalone: true,
  imports: [MatRadioModule],
  template: `
    <mat-radio-group [value]="value()" (change)="onChange($event.value)">
      @for (option of config().options; track option.value) {
        <mat-radio-button 
          [value]="option.value" 
          [disabled]="option.disabled"
          [color]="'primary'"
        >
          {{ option.label }}
        </mat-radio-button>
      }
    </mat-radio-group>
  `,
  styleUrl: './radio.component.scss',
})
export class RadioComponent {
  config = input<RadioConfig, Partial<RadioConfig> | undefined>(DEFAULT_CONFIG, {
    transform: (value) => ({ ...DEFAULT_CONFIG, ...value })
  });

  value = model<unknown>();

  onChange(val: unknown) {
    this.value.set(val);
  }
}
