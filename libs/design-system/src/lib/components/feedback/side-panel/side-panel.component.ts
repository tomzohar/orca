import { Component, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ButtonComponent } from '../../button/button.component';
import { IconName, SidePanelConfig } from '../../../types/component.types';

const DEFAULT_CONFIG: SidePanelConfig = {
    position: 'right',
    size: 'md',
    showCloseButton: true,
    hasBackdrop: true,
};

@Component({
    selector: 'orca-side-panel-container',
    standalone: true,
    imports: [ButtonComponent, NgTemplateOutlet],
    template: `
        <div class="orca-side-panel-container" 
             [class]="'position-' + config().position + ' size-' + config().size">
            @if (config().title || config().showCloseButton || config().headerTemplate) {
                <header class="orca-side-panel-header">
                    <div class="header-text">
                        @if (config().headerTemplate) {
                            <ng-container [ngTemplateOutlet]="config().headerTemplate!" />
                        } @else {
                            @if (config().title) {
                                <h4>{{ config().title }}</h4>
                            }
                            @if (config().subtitle) {
                                <p class="subtitle">{{ config().subtitle }}</p>
                            }
                        }
                    </div>
                    @if (config().showCloseButton) {
                        <orca-button 
                            [config]="{ variant: 'ghost', icon: { name: icons.close } }" 
                            (clicked)="closed.emit()"
                        ></orca-button>
                    }
                </header>
            }

            <main class="orca-side-panel-content">
                <ng-content></ng-content>
            </main>
        </div>
    `,
    styleUrl: './side-panel.component.scss'
})
export class SidePanelComponent {
    readonly icons = IconName;
    config = input<SidePanelConfig, Partial<SidePanelConfig> | undefined>(DEFAULT_CONFIG, {
        transform: (value) => ({ ...DEFAULT_CONFIG, ...value })
    });

    closed = output<void>();
}
