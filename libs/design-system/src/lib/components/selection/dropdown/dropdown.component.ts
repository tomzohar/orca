import { Component, input, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownConfig } from '../../../types/component.types';

const DEFAULT_CONFIG: DropdownConfig = {
    label: '',
    placeholder: '',
    disabled: false,
    error: '',
    options: []
};

@Component({
    selector: 'orca-dropdown',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule],
    templateUrl: './dropdown.component.html',
    styleUrl: './dropdown.component.scss',
})
export class DropdownComponent {
    config = input<DropdownConfig, Partial<DropdownConfig> | undefined>(DEFAULT_CONFIG, {
        transform: (value) => ({ ...DEFAULT_CONFIG, ...value })
    });

    value = model<any>(null);

    onSelectionChange(event: any) {
        this.value.set(event.value);
    }
}
