import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './button.component';
import { ButtonGroupConfig, ButtonConfig, ButtonGroupItem } from '../../types/component.types';

const DEFAULT_CONFIG: ButtonGroupConfig = {
  buttons: [],
  variant: 'secondary',
};

@Component({
  selector: 'orca-button-group',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './button-group.component.html',
  styleUrl: './button-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonGroupComponent {
  config = input<ButtonGroupConfig, Partial<ButtonGroupConfig> | undefined>(
    DEFAULT_CONFIG,
    {
      transform: (value) => {
        if (!value) return DEFAULT_CONFIG;
        return { ...DEFAULT_CONFIG, ...value };
      },
    }
  );

  selectionChanged = output<string>();

  onButtonClick(value: string): void {
    if (!this.isDisabled(value)) {
      this.selectionChanged.emit(value);
    }
  }

  isSelected(value: string): boolean {
    return this.config().selected === value;
  }

  isDisabled(value: string): boolean {
    const button = this.config().buttons.find((b) => b.value === value);
    return button?.disabled ?? false;
  }

  getVariantClass(): string {
    return `variant-${this.config().variant}`;
  }

  getButtonConfig(button: ButtonGroupItem): ButtonConfig {
    const isSelected = this.isSelected(button.value);
    return {
      variant: isSelected ? 'primary' : 'ghost',
      disabled: this.isDisabled(button.value),
      icon: button.icon,
      size: 'sm',
    };
  }
}
