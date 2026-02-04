import { Component, computed, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SpinnerConfig } from '../../../types/component.types';

const DEFAULT_CONFIG: SpinnerConfig = {
    size: 'md',
    color: 'primary',
};

@Component({
    selector: 'orca-spinner',
    standalone: true,
    imports: [MatProgressSpinnerModule],
    template: `
        <div class="orca-spinner-container" [class]="config().size">
            <mat-progress-spinner
                [mode]="'indeterminate'"
                [color]="config().color"
                [diameter]="diameter()"
                [strokeWidth]="config().strokeWidth || strokeWidth()"
            ></mat-progress-spinner>
        </div>
    `,
    styles: [`
        .orca-spinner-container {
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
    `]
})
export class SpinnerComponent {
    config = input<SpinnerConfig, Partial<SpinnerConfig> | undefined>(DEFAULT_CONFIG, {
        transform: (value) => ({ ...DEFAULT_CONFIG, ...value })
    });

    diameter = computed(() => {
        const diameter = this.config().diameter;
        if (diameter) return diameter;
        switch (this.config().size) {
            case 'sm': return 24;
            case 'md': return 40;
            case 'lg': return 64;
            default: return 40;
        }
    });

    strokeWidth = computed(() => {
        switch (this.config().size) {
            case 'sm': return 3;
            case 'md': return 4;
            case 'lg': return 6;
            default: return 4;
        }
    });
}
