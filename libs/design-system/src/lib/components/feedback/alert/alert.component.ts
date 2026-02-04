import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AlertConfig } from '../../../types/component.types';

const DEFAULT_CONFIG: AlertConfig = {
  type: 'info',
  title: '',
  showIcon: true
};

@Component({
  selector: 'orca-alert',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="orca-alert" [class]="config().type">
      @if (config().showIcon) {
        <mat-icon class="orca-alert-icon">{{ iconName() }}</mat-icon>
      }
      <div class="orca-alert-content">
        @if (config().title) {
           <div class="orca-alert-title">{{ config().title }}</div>
        }
        <div class="orca-alert-message">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styleUrl: './alert.component.scss',
})
export class AlertComponent {
  config = input<AlertConfig, Partial<AlertConfig> | undefined>(DEFAULT_CONFIG, {
    transform: (value) => ({ ...DEFAULT_CONFIG, ...value })
  });

  iconName = computed(() => {
    switch (this.config().type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  });
}
