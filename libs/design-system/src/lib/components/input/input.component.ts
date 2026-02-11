import { Component, DestroyRef, inject, input, model, effect, forwardRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { IconComponent } from '../icon/icon.component';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormsModule, FormControl, ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
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
    imports: [MatFormFieldModule, MatInputModule, MatIconModule, IconComponent, FormsModule, ReactiveFormsModule],
    templateUrl: './input.component.html',
    styleUrl: './input.component.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputComponent),
            multi: true
        }
    ],
    host: {
        '[attr.type]': 'config().type || "text"'
    }
})
export class InputComponent implements ControlValueAccessor {
    private destroyRef = inject(DestroyRef)
    config = input<InputConfig, Partial<InputConfig> | undefined>(DEFAULT_CONFIG, {
        transform: (value) => ({ ...DEFAULT_CONFIG, ...value })
    });

    value = model<string>('');
    control = new FormControl<string>('');
    errorStateMatcher = new OrcaErrorStateMatcher(() => this.config());

    onChange: (value: string) => void = () => { /* Intended empty */ };
    onTouched: () => void = () => { /* Intended empty */ };

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
                this.onChange(val);
            }
        });
    }

    onInput(event: Event) {
        const target = event.target as HTMLInputElement;
        this.value.set(target.value);
        this.onChange(target.value);
    }

    writeValue(value: string): void {
        this.value.set(value || '');
        this.control.setValue(value || '', { emitEvent: false });
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        if (isDisabled) {
            this.control.disable({ emitEvent: false });
        } else {
            this.control.enable({ emitEvent: false });
        }
    }
}
