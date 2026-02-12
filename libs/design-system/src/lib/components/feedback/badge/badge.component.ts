import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { BadgeConfig } from '../../../types/component.types';

const DEFAULT_CONFIG: BadgeConfig = {
  text: '',
  variant: 'neutral',
  size: 'md',
};

@Component({
  selector: 'orca-badge',
  standalone: true,
  imports: [],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  config = input<BadgeConfig, Partial<BadgeConfig> | undefined>(DEFAULT_CONFIG, {
    transform: (value) => {
      if (!value) return DEFAULT_CONFIG;
      return { ...DEFAULT_CONFIG, ...value };
    },
  });

  getVariantClass(): string {
    return `badge-${this.config().variant}`;
  }

  getSizeClass(): string {
    return `badge-${this.config().size}`;
  }
}
