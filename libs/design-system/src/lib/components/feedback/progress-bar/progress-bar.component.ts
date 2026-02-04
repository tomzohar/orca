import { Component, input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ProgressBarConfig } from '../../../types/component.types';

const DEFAULT_CONFIG: ProgressBarConfig = {
    value: 0,
    mode: 'determinate',
    size: 'lg',
    color: 'primary'
};

@Component({
    selector: 'orca-progress-bar',
    standalone: true,
    imports: [MatProgressBarModule],
    template: `
        <div class="orca-progress-bar-container" [class]="config().size">
            <mat-progress-bar
                [mode]="config().mode!"
                [value]="config().value"
                [color]="config().color"
            ></mat-progress-bar>
        </div>
    `,
    styles: [`
        .orca-progress-bar-container {
            width: 100%;
        }
        ::ng-deep .sm {
            height: 4px;
        }
        ::ng-deep .lg {
            height: 8px;
        }
        ::ng-deep .xl {
            height: 12px;
        }
        /* Overriding material defaults to support our sizes */
        ::ng-deep .sm .mat-mdc-progress-bar { --mdc-linear-progress-track-height: 4px; }
        ::ng-deep .lg .mat-mdc-progress-bar { --mdc-linear-progress-track-height: 8px; }
        ::ng-deep .xl .mat-mdc-progress-bar { --mdc-linear-progress-track-height: 12px; }
    `]
})
export class ProgressBarComponent {
    config = input<ProgressBarConfig, Partial<ProgressBarConfig> | undefined>(DEFAULT_CONFIG, {
        transform: (value) => ({ ...DEFAULT_CONFIG, ...value })
    });
}
