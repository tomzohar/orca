import { Component, DestroyRef, inject, input, model, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DropdownConfig } from '../../../types/component.types';

const DEFAULT_CONFIG: DropdownConfig<unknown> = {
    label: '',
    placeholder: '',
    disabled: false,
    error: '',
    hint: '',
    options: []
};

class OrcaErrorStateMatcher implements ErrorStateMatcher {
    constructor(private configFn: () => DropdownConfig<unknown>) { }

    isErrorState(control: FormControl | null): boolean {
        return !!this.configFn().error || (!!control && !!control.invalid && (control.dirty || control.touched));
    }
}

@Component({
    selector: 'orca-dropdown',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule],
    templateUrl: './dropdown.component.html',
    styleUrl: './dropdown.component.scss',
})
export class DropdownComponent {
    private destroyRef = inject(DestroyRef);
    config = input<DropdownConfig<unknown>, Partial<DropdownConfig<unknown>> | undefined>(DEFAULT_CONFIG, {
        transform: (value) => ({ ...DEFAULT_CONFIG, ...value })
    });

    value = model<unknown>(null);
    control = new FormControl<unknown>(null);
    errorStateMatcher = new OrcaErrorStateMatcher(() => this.config());

    constructor() {
        effect(() => {
            const val = this.value();
            if (this.control.value !== val) {
                this.control.setValue(val, { emitEvent: false });
            }
        });

        effect(() => {
            const config = this.config();
            if (config.error) {
                this.control.setErrors({ orcaError: true });
                this.control.markAsTouched();
            } else {
                this.control.setErrors(null);
            }

            if (config.disabled) {
                this.control.disable({ emitEvent: false });
            } else {
                this.control.enable({ emitEvent: false });
            }
        });

        this.control.valueChanges.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(val => {
            if (val !== null) {
                this.value.set(val);
            }
        });
    }

    onSelectionChange(event: { value: unknown }) {
        this.value.set(event.value);
    }
}
