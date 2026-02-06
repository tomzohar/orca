import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { IconConfig } from '../../types/component.types';

const DEFAULT_CONFIG: IconConfig = {
    name: '',
    size: 'md',
};

@Component({
    selector: 'orca-icon',
    standalone: true,
    imports: [NgClass, MatIconModule],
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
        .xs { font-size: $icon-xs; width: $icon-xs; height: $icon-xs; }
        .sm { font-size: $icon-sm; width: $icon-sm; height: $icon-sm; }
        .md { font-size: $icon-md; width: $icon-md; height: $icon-md; }
        .lg { font-size: $icon-lg; width: $icon-lg; height: $icon-lg; }
        .xl { font-size: $icon-xl; width: $icon-xl; height: $icon-xl; }
    `]
})
export class IconComponent {
    config = input<IconConfig, Partial<IconConfig> | undefined>(DEFAULT_CONFIG, {
        transform: (value) => ({ ...DEFAULT_CONFIG, ...value })
    });
}
