import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../../button/button.component';
import { DialogConfig } from '../../../types/component.types';

const DEFAULT_CONFIG: DialogConfig = {
    size: 'md',
    showCloseButton: true,
    hasBackdrop: true,
};

@Component({
    selector: 'orca-dialog-container',
    standalone: true,
    imports: [ButtonComponent],
    template: `
        <div class="orca-dialog-container" [class]="config().size">
            @if (config().title  || config().showCloseButton) {
                <header class="orca-dialog-header">
                    <div class="header-text">
                        @if (config().title) {
                            <h4>{{ config().title }}</h4>
                        }
                        @if (config().subtitle) {
                            <p class="subtitle">{{ config().subtitle }}</p>
                        }
                    </div>
                    @if (config().showCloseButton) {
                        <orca-button 
                            [config]="{ variant: 'icon-button', icon: { name: 'close' } }" 
                            (clicked)="closed.emit()"
                        ></orca-button>
                    }
            </header>
        }

            <main class="orca-dialog-content">
                <ng-content></ng-content>
            </main>

            @if (config().actions?.length) {
                <footer class="orca-dialog-footer">
                        <div class="actions-container">
                            @for (action of config().actions; track action.id) {
                                <orca-button 
                                [config]="action"
                                (clicked)="actionClick.emit(action.id)"
                                >
                            {{ action.label }}
                        </orca-button>
                    }
                    </div>
                <ng-content select="[footer]"></ng-content>
            </footer>
        }
        </div>
    `,
    styleUrl: './dialog.component.scss'
})
export class DialogComponent {
    config = input<DialogConfig, Partial<DialogConfig> | undefined>(DEFAULT_CONFIG, {
        transform: (value) => ({ ...DEFAULT_CONFIG, ...value })
    });

    closed = output<void>();
    actionClick = output<string>();
}
