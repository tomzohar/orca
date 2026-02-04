import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CardConfig } from '../../../types/component.types';

const DEFAULT_CONFIG: CardConfig = {
  variant: 'elevated',
  title: '',
  subtitle: '',
  showActions: false
};

@Component({
  selector: 'orca-card',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <mat-card class="orca-card" [class]="config().variant">
      @if (config().title) {
        <mat-card-header>
          <mat-card-title>{{ config().title }}</mat-card-title>
          @if (config().subtitle) {
            <mat-card-subtitle>{{ config().subtitle }}</mat-card-subtitle>
          }
        </mat-card-header>
      }
      <mat-card-content>
        <ng-content></ng-content>
      </mat-card-content>
      @if (config().showActions) {
        <mat-card-actions>
          <ng-content select="[actions]"></ng-content>
        </mat-card-actions>
      }
    </mat-card>
  `,
  styleUrl: './card.component.scss',
})
export class CardComponent {
  config = input<CardConfig, Partial<CardConfig> | undefined>(DEFAULT_CONFIG, {
    transform: (value) => ({ ...DEFAULT_CONFIG, ...value })
  });
}
