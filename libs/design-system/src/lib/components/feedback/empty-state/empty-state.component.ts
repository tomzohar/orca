import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../button/button.component';
import { ButtonConfig } from '../../../types/component.types';

export interface EmptyStateConfig {
    imgSrc?: string;
    title?: string;
    description?: string;
    action?: ButtonConfig & { label?: string };
}

@Component({
    selector: 'orca-empty-state',
    standalone: true,
    imports: [CommonModule, ButtonComponent],
    templateUrl: './empty-state.component.html',
    styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
    /**
     * Configuration for the empty state
     */
    config = input<EmptyStateConfig>({});
}
