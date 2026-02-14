import {
  Component,
  input,
  output,
  computed,
  effect,
  viewChild,
  ChangeDetectionStrategy,
  TemplateRef,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { BadgeComponent } from '../../feedback/badge/badge.component';
import { MenuComponent } from '../../menu/menu.component';
import { EmptyStateComponent } from '../../feedback/empty-state/empty-state.component';
import { SpinnerComponent } from '../../feedback/spinner/spinner.component';
import { RelativeTimePipe } from '../../../pipes/relative-time.pipe';
import { FillAvailableHeightDirective } from '../../../directives/fill-available-height.directive';
import { TableConfig, TableColumn, MenuItem } from '../../../types/component.types';

const DEFAULT_CONFIG: TableConfig = {
  data: [],
  columns: [],
  loading: false,
  error: null,
  emptyMessage: 'No data available',
  sortable: true,
};

@Component({
  selector: 'orca-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    BadgeComponent,
    MenuComponent,
    EmptyStateComponent,
    SpinnerComponent,
    RelativeTimePipe,
    DatePipe,
    FillAvailableHeightDirective,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent<T = any> {
  config = input<TableConfig<T>, Partial<TableConfig<T>> | undefined>(
    DEFAULT_CONFIG as TableConfig<T>,
    {
      transform: (value) => {
        if (!value) return DEFAULT_CONFIG as TableConfig<T>;
        return { ...DEFAULT_CONFIG, ...value } as TableConfig<T>;
      },
    }
  );

  rowClicked = output<T>();

  // ViewChild for MatSort
  readonly sort = viewChild(MatSort);

  // Data source for sorting
  readonly dataSource = computed(() => {
    const source = new MatTableDataSource(this.config().data);
    return source;
  });

  // Effect to connect sort to data source
  private readonly sortEffect = effect(() => {
    const sortInstance = this.sort();
    const ds = this.dataSource();
    if (sortInstance && ds) {
      ds.sort = sortInstance;
    }
  });

  // Computed properties
  readonly displayedColumns = computed(() =>
    this.config().columns.map((col) => col.key as string)
  );

  readonly showTable = computed(() => {
    const cfg = this.config();
    return !cfg.loading && !cfg.error && cfg.data.length > 0;
  });

  readonly showEmpty = computed(() => {
    const cfg = this.config();
    return !cfg.loading && !cfg.error && cfg.data.length === 0;
  });

  readonly showLoading = computed(() => this.config().loading);

  readonly showError = computed(() => {
    const cfg = this.config();
    return !cfg.loading && !!cfg.error;
  });

  onRowClick(row: T): void {
    if (this.config().onRowClick) {
      this.config().onRowClick!(row);
    }
    this.rowClicked.emit(row);
  }

  formatCellValue(row: T, column: TableColumn<T>): string {
    const value = (row as any)[column.key];

    if (value === null || value === undefined) {
      return '';
    }

    // Apply pipes if specified
    if (column.pipe === 'truncate') {
      const str = String(value);
      return str.length > 50 ? str.substring(0, 50) + '...' : str;
    }

    return String(value);
  }

  getRowActions(column: TableColumn<T>, row: T): MenuItem[] {
    if (!column.actions) return [];

    return column.actions
      .filter((action) => !action.visible || action.visible(row))
      .map((action) => ({
        label: action.label,
        icon: action.icon,
        action: () => action.onClick(row),
        disabled: action.disabled ? action.disabled(row) : false,
      }));
  }

  isSortable(column: TableColumn<T>): boolean {
    return this.config().sortable !== false && column.sortable !== false;
  }

  // Computed property for fill available height margin
  readonly fillHeightMargin = computed(() => {
    const fillHeight = this.config().fillAvailableHeight;
    if (fillHeight === true) return 0;
    if (typeof fillHeight === 'number') return fillHeight;
    return null;
  });
}
