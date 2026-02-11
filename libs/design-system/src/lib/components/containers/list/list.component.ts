import { Component, input, output } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { IconComponent } from '../../icon/icon.component';
import { ListConfig, ListItem } from '../../../types/component.types';

const DEFAULT_CONFIG: ListConfig = {
  items: [],
  expandable: true,
  showIcons: true,
  multipleExpanded: false,
};

@Component({
  selector: 'orca-list',
  standalone: true,
  imports: [MatExpansionModule, IconComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent {
  config = input<ListConfig, Partial<ListConfig> | undefined>(DEFAULT_CONFIG, {
    transform: (value) => {
      if (!value) return DEFAULT_CONFIG;
      return { ...DEFAULT_CONFIG, ...value };
    }
  });

  itemExpanded = output<ListItem>();
  itemCollapsed = output<ListItem>();
  itemClicked = output<ListItem>();

  onExpanded(item: ListItem): void {
    this.itemExpanded.emit(item);
  }

  onCollapsed(item: ListItem): void {
    this.itemCollapsed.emit(item);
  }

  onItemClick(item: ListItem, event?: Event): void {
    if (!item.disabled) {
      event?.preventDefault();
      this.itemClicked.emit(item);
    }
  }
}
