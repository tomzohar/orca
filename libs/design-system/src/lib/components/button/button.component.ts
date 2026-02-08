import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { IconComponent } from '../icon/icon.component';
import { ButtonConfig } from '../../types/component.types';

const DEFAULT_CONFIG: ButtonConfig = {
    variant: 'primary',
    disabled: false,
    type: 'button'
};

@Component({
    selector: 'orca-button',
    standalone: true,
    imports: [MatButtonModule, IconComponent],
    templateUrl: './button.component.html',
    styleUrl: './button.component.scss',
})
export class ButtonComponent {
    config = input<ButtonConfig, Partial<ButtonConfig> | undefined>(DEFAULT_CONFIG, {
        transform: (value) => {
            if (!value) return DEFAULT_CONFIG;
            return { ...DEFAULT_CONFIG, ...value };
        }
    });

    clicked = output<MouseEvent>();

    onClick(event: MouseEvent) {
        if (!this.config().disabled) {
            this.clicked.emit(event);
        }
    }
}
