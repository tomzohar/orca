import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import { IconName, MenuConfig, MenuItem } from '../../types/component.types';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';

const DEFAULT_CONFIG: MenuConfig = {
  triggerIcon: IconName.more_vert,
  triggerVariant: 'icon',
  items: [],
  xPosition: 'after',
  yPosition: 'below',
};

@Component({
  selector: 'orca-menu',
  standalone: true,
  imports: [CommonModule, MatMenuModule, MatButtonModule, RouterLink, IconComponent, MatDividerModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  config = input<MenuConfig, Partial<MenuConfig> | undefined>(DEFAULT_CONFIG, {
    transform: (value) => {
      if (!value) return DEFAULT_CONFIG;
      return { ...DEFAULT_CONFIG, ...value };
    },
  });

  menuOpened = output<void>();
  menuClosed = output<void>();

  onMenuOpened() {
    this.menuOpened.emit();
  }

  onMenuClosed() {
    this.menuClosed.emit();
  }

  handleAction(item: MenuItem) {
    if (item.action) {
      item.action(item);
    }
  }
}
