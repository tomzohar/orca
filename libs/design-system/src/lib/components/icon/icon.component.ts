import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { IconConfig } from '../../types/component.types';

const DEFAULT_CONFIG: IconConfig = {
    name: '',
    size: 'md',
};

@Component({
    selector: 'orca-icon',
    standalone: true,
    imports: [MatIconModule],
    template: `
        <mat-icon 
            [class.orca-icon]="true"
            [class.orca-icon-xs]="config().size === 'xs'"
            [class.orca-icon-sm]="config().size === 'sm'"
            [class.orca-icon-md]="config().size === 'md'"
            [class.orca-icon-lg]="config().size === 'lg'"
            [class.orca-icon-xl]="config().size === 'xl'"
            [style.color]="config().color"
        >{{ config().name }}</mat-icon>
    `,
    styles: [`
        .orca-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
        }
        .orca-icon-xs { font-size: 12px; width: 12px; height: 12px; }
        .orca-icon-sm { font-size: 16px; width: 16px; height: 16px; }
        .orca-icon-md { font-size: 24px; width: 24px; height: 24px; }
        .orca-icon-lg { font-size: 32px; width: 32px; height: 32px; }
        .orca-icon-xl { font-size: 48px; width: 48px; height: 48px; }
    `]
})
export class IconComponent {
    config = input<IconConfig, Partial<IconConfig> | undefined>(DEFAULT_CONFIG, {
        transform: (value) => ({ ...DEFAULT_CONFIG, ...value })
    });
}
