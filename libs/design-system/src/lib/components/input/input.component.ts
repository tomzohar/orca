import { Component, input, model } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputConfig } from '../../types/component.types';

const DEFAULT_CONFIG: InputConfig = {
    label: '',
    placeholder: '',
    disabled: false,
    error: '',
    type: 'text'
};

@Component({
    selector: 'orca-input',
    standalone: true,
    imports: [MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule],
    templateUrl: './input.component.html',
    styleUrl: './input.component.scss',
})
export class InputComponent {
    config = input<InputConfig, Partial<InputConfig> | undefined>(DEFAULT_CONFIG, {
        transform: (value) => ({ ...DEFAULT_CONFIG, ...value })
    });

    value = model<string>('');

    onInput(event: Event) {
        const target = event.target as HTMLInputElement;
        this.value.set(target.value);
    }
}
