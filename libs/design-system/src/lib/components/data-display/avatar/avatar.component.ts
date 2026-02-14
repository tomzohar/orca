import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../icon/icon.component';
import { AvatarConfig, IconName } from '../../../types/component.types';

const DEFAULT_CONFIG: AvatarConfig = {
  size: 'md',
  shape: 'circular',
  showIcon: true,
  showStatus: false,
};

@Component({
  selector: 'orca-avatar',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  config = input<AvatarConfig, Partial<AvatarConfig> | undefined>(DEFAULT_CONFIG, {
    transform: (value) => {
      if (!value) return DEFAULT_CONFIG;
      return { ...DEFAULT_CONFIG, ...value };
    },
  });

  readonly displayInitials = computed(() => {
    const cfg = this.config();
    if (cfg.initials) {
      return cfg.initials.substring(0, 2).toUpperCase();
    }
    if (cfg.name) {
      return this.generateInitials(cfg.name);
    }
    return '';
  });

  readonly showImage = computed(() => {
    return !!this.config().src;
  });

  readonly showInitials = computed(() => {
    return !this.showImage() && !!this.displayInitials();
  });

  readonly showIcon = computed(() => {
    return !this.showImage() && !this.showInitials() && this.config().showIcon;
  });

  readonly avatarClasses = computed(() => {
    const cfg = this.config();
    return {
      'avatar-sm': cfg.size === 'sm',
      'avatar-md': cfg.size === 'md',
      'avatar-lg': cfg.size === 'lg',
      'avatar-xl': cfg.size === 'xl',
      'avatar-circular': cfg.shape === 'circular',
      'avatar-square': cfg.shape === 'square',
      'has-status': cfg.showStatus && cfg.status,
    };
  });

  readonly statusClasses = computed(() => {
    const cfg = this.config();
    if (!cfg.showStatus || !cfg.status) return {};

    return {
      'status-online': cfg.status === 'online',
      'status-offline': cfg.status === 'offline',
      'status-away': cfg.status === 'away',
      'status-busy': cfg.status === 'busy',
    };
  });

  readonly avatarStyle = computed(() => {
    const cfg = this.config();
    const style: Record<string, string> = {};

    if (cfg.backgroundColor) {
      style['background-color'] = cfg.backgroundColor;
    }
    if (cfg.textColor) {
      style['color'] = cfg.textColor;
    }

    return style;
  });

  readonly iconSize = computed(() => {
    const size = this.config().size;
    switch (size) {
      case 'sm': return 'sm';
      case 'md': return 'md';
      case 'lg': return 'lg';
      case 'xl': return 'xl';
      default: return 'md';
    }
  });

  private generateInitials(name: string): string {
    return name
      .split(' ')
      .filter(part => part.length > 0)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }

  onImageError(event: Event): void {
    // Hide the image when it fails to load, component will show initials or icon instead
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  readonly avatarIcon = computed(() => {
    return this.config().icon || IconName.person;
  });
}