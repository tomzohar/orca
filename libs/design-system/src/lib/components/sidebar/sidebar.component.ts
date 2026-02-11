import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatListModule, MatNavList } from '@angular/material/list';
import { IconComponent } from '../icon/icon.component';
import { SidebarConfig, SidebarItem } from './sidebar.types';

@Component({
  selector: 'orca-sidebar',
  standalone: true,
  imports: [MatListModule, IconComponent, MatNavList],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  config = input.required<SidebarConfig>();
  itemClick = output<SidebarItem>();

  onItemClick(item: SidebarItem) {
    this.itemClick.emit(item);
  }
}
