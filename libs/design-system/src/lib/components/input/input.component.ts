import { Component, DestroyRef, inject, input, model, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputConfig } from '../../types/component.types';

const DEFAULT_CONFIG: InputConfig = {
    label: '',
    placeholder: '',
    disabled: false,
    error: '',
    hint: '',
    type: 'text'
};

class OrcaErrorStateMatcher implements ErrorStateMatcher {
    constructor(private configFn: () => InputConfig) { }

    isErrorState(control: FormControl | null): boolean {
        return !!this.configFn().error || (!!control && !!control.invalid && (control.dirty || control.touched));
    }
}

@Component({
    selector: 'orca-input',
    standalone: true,
    imports: [MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule],
    templateUrl: './input.component.html',
    styleUrl: './input.component.scss',
})
export class InputComponent {
    private destroyRef = inject(DestroyRef)
    config = input<InputConfig, Partial<InputConfig> | undefined>(DEFAULT_CONFIG, {
        transform: (value) => ({ ...DEFAULT_CONFIG, ...value })
    });

    value = model<string>('');
    control = new FormControl<string>('');
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

    onInput(event: Event) {
        const target = event.target as HTMLInputElement;
        this.value.set(target.value);
    }
}
