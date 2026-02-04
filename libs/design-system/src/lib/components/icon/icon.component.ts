import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { IconConfig } from '../../types/component.types';

const DEFAULT_CONFIG: IconConfig = {
    name: '',
    size: 'md',
};

@Component({
    selector: 'orca-icon',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    template: `
        <mat-icon 
            [ngClass]="['orca-icon', config().size!]"
            [style.color]="config().color"
        >
            {{ config().name }}
        </mat-icon>
    `,
    styles: [`
        .orca-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        .xs { font-size: 16px; width: 16px; height: 16px; }
        .sm { font-size: 20px; width: 20px; height: 20px; }
        .md { font-size: 24px; width: 24px; height: 24px; }
        .lg { font-size: 32px; width: 32px; height: 32px; }
        .xl { font-size: 48px; width: 48px; height: 48px; }
    `]
})
export class IconComponent {
    config = input<IconConfig, Partial<IconConfig> | undefined>(DEFAULT_CONFIG, {
        transform: (value) => ({ ...DEFAULT_CONFIG, ...value })
    });
}
