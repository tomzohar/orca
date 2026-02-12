import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableComponent } from './table.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IconName } from '../../../types/component.types';

interface TestData {
  id: number;
  name: string;
  status: string;
  createdAt: string;
}

describe('TableComponent', () => {
  let component: TableComponent<TestData>;
  let fixture: ComponentFixture<TableComponent<TestData>>;

  const mockData: TestData[] = [
    { id: 1, name: 'Item 1', status: 'active', createdAt: '2024-01-01' },
    { id: 2, name: 'Item 2', status: 'inactive', createdAt: '2024-01-02' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent, BrowserAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TableComponent<TestData>);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply default config', () => {
    fixture.componentRef.setInput('config', {
      data: mockData,
      columns: [],
    });
    fixture.detectChanges();

    const config = component.config();
    expect(config.loading).toBe(false);
    expect(config.error).toBe(null);
    expect(config.sortable).toBe(true);
  });

  it('should show loading state', () => {
    fixture.componentRef.setInput('config', {
      data: [],
      columns: [],
      loading: true,
    });
    fixture.detectChanges();

    expect(component.showLoading()).toBe(true);
    expect(component.showTable()).toBe(false);
    const spinner = fixture.nativeElement.querySelector('orca-spinner');
    expect(spinner).toBeTruthy();
  });

  it('should show empty state', () => {
    fixture.componentRef.setInput('config', {
      data: [],
      columns: [],
      emptyMessage: 'No items found',
    });
    fixture.detectChanges();

    expect(component.showEmpty()).toBe(true);
    expect(component.showTable()).toBe(false);
    const emptyState = fixture.nativeElement.querySelector('orca-empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('should show error state', () => {
    fixture.componentRef.setInput('config', {
      data: [],
      columns: [],
      error: 'Failed to load data',
    });
    fixture.detectChanges();

    expect(component.showError()).toBe(true);
    expect(component.showTable()).toBe(false);
  });

  it('should render table with data', () => {
    fixture.componentRef.setInput('config', {
      data: mockData,
      columns: [
        { key: 'name', label: 'Name' },
        { key: 'status', label: 'Status' },
      ],
    });
    fixture.detectChanges();

    expect(component.showTable()).toBe(true);
    const table = fixture.nativeElement.querySelector('table');
    expect(table).toBeTruthy();
  });

  it('should compute displayed columns', () => {
    fixture.componentRef.setInput('config', {
      data: mockData,
      columns: [
        { key: 'name', label: 'Name' },
        { key: 'status', label: 'Status' },
      ],
    });
    fixture.detectChanges();

    const displayedColumns = component.displayedColumns();
    expect(displayedColumns).toEqual(['name', 'status']);
  });

  it('should emit rowClicked when row is clicked', () => {
    let clickedRow: TestData | undefined;
    component.rowClicked.subscribe((row) => {
      clickedRow = row;
    });

    fixture.componentRef.setInput('config', {
      data: mockData,
      columns: [{ key: 'name', label: 'Name' }],
    });
    fixture.detectChanges();

    component.onRowClick(mockData[0]);
    expect(clickedRow).toEqual(mockData[0]);
  });

  it('should call onRowClick callback if provided', () => {
    let callbackRow: TestData | undefined;
    fixture.componentRef.setInput('config', {
      data: mockData,
      columns: [{ key: 'name', label: 'Name' }],
      onRowClick: (row: TestData) => {
        callbackRow = row;
      },
    });
    fixture.detectChanges();

    component.onRowClick(mockData[0]);
    expect(callbackRow).toEqual(mockData[0]);
  });

  it('should format cell values', () => {
    const column = { key: 'name' as keyof TestData, label: 'Name' };
    const result = component.formatCellValue(mockData[0], column);
    expect(result).toBe('Item 1');
  });

  it('should truncate long text when pipe is truncate', () => {
    const longText = 'a'.repeat(60);
    const row = { id: 1, name: longText, status: 'active', createdAt: '2024-01-01' };
    const column = { key: 'name' as keyof TestData, label: 'Name', pipe: 'truncate' as const };

    const result = component.formatCellValue(row, column);
    expect(result.length).toBe(53); // 50 chars + '...'
    expect(result.endsWith('...')).toBe(true);
  });

  it('should handle null and undefined values', () => {
    const row = { id: 1, name: null as any, status: undefined as any, createdAt: '2024-01-01' };
    const column = { key: 'name' as keyof TestData, label: 'Name' };

    const result = component.formatCellValue(row, column);
    expect(result).toBe('');
  });

  it('should determine if column is sortable', () => {
    fixture.componentRef.setInput('config', {
      data: mockData,
      columns: [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'status', label: 'Status', sortable: false },
      ],
      sortable: true,
    });
    fixture.detectChanges();

    const columns = component.config().columns;
    expect(component.isSortable(columns[0])).toBe(true);
    expect(component.isSortable(columns[1])).toBe(false);
  });
});
