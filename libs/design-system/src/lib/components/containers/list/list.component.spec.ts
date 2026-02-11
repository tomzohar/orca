import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ListComponent } from './list.component';
import { ListItem } from '../../../types/component.types';

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render expandable list by default', () => {
    fixture.componentRef.setInput('config', {
      items: [
        { id: '1', title: 'Item 1', content: 'Content 1' },
        { id: '2', title: 'Item 2', content: 'Content 2' },
      ],
    });
    fixture.detectChanges();

    const accordion = fixture.nativeElement.querySelector('mat-accordion');
    expect(accordion).toBeTruthy();
  });

  it('should render simple list when expandable is false', () => {
    fixture.componentRef.setInput('config', {
      expandable: false,
      items: [
        { id: '1', title: 'Item 1', description: 'Description 1' },
        { id: '2', title: 'Item 2', description: 'Description 2' },
      ],
    });
    fixture.detectChanges();

    const simpleList = fixture.nativeElement.querySelector('.orca-list.simple');
    expect(simpleList).toBeTruthy();
  });

  it('should display icons when showIcons is true', () => {
    fixture.componentRef.setInput('config', {
      showIcons: true,
      items: [
        { id: '1', title: 'Item 1', icon: 'home' },
      ],
    });
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('orca-icon');
    expect(icon).toBeTruthy();
  });

  it('should not display icons when showIcons is false', () => {
    fixture.componentRef.setInput('config', {
      showIcons: false,
      items: [
        { id: '1', title: 'Item 1', icon: 'home' },
      ],
    });
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('orca-icon');
    expect(icon).toBeFalsy();
  });

  it('should emit itemExpanded event when item is expanded', () => {
    const item: ListItem = { id: '1', title: 'Item 1', content: 'Content' };
    let emittedItem: ListItem | undefined;

    fixture.componentRef.setInput('config', {
      items: [item],
    });

    component.itemExpanded.subscribe((emitted: ListItem) => {
      emittedItem = emitted;
    });
    component.onExpanded(item);

    expect(emittedItem).toEqual(item);
  });

  it('should emit itemCollapsed event when item is collapsed', () => {
    const item: ListItem = { id: '1', title: 'Item 1', content: 'Content' };
    let emittedItem: ListItem | undefined;

    fixture.componentRef.setInput('config', {
      items: [item],
    });

    component.itemCollapsed.subscribe((emitted: ListItem) => {
      emittedItem = emitted;
    });
    component.onCollapsed(item);

    expect(emittedItem).toEqual(item);
  });

  it('should emit itemClicked event when non-disabled item is clicked', () => {
    const item: ListItem = { id: '1', title: 'Item 1' };
    let emittedItem: ListItem | undefined;

    fixture.componentRef.setInput('config', {
      expandable: false,
      items: [item],
    });

    component.itemClicked.subscribe((emitted: ListItem) => {
      emittedItem = emitted;
    });
    component.onItemClick(item);

    expect(emittedItem).toEqual(item);
  });

  it('should not emit itemClicked event when disabled item is clicked', () => {
    const item: ListItem = { id: '1', title: 'Item 1', disabled: true };
    let emittedItem: ListItem | undefined;

    fixture.componentRef.setInput('config', {
      expandable: false,
      items: [item],
    });

    component.itemClicked.subscribe((emitted: ListItem) => {
      emittedItem = emitted;
    });
    component.onItemClick(item);

    expect(emittedItem).toBeUndefined();
  });

  it('should display badge when provided', () => {
    fixture.componentRef.setInput('config', {
      items: [
        { id: '1', title: 'Item 1', badge: '5' },
      ],
    });
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.item-badge');
    expect(badge).toBeTruthy();
    expect(badge.textContent.trim()).toBe('5');
  });

  it('should apply disabled class to disabled items', () => {
    fixture.componentRef.setInput('config', {
      items: [
        { id: '1', title: 'Item 1', disabled: true, content: 'Content' },
      ],
    });
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('mat-expansion-panel');
    expect(panel.classList.contains('disabled')).toBe(true);
  });

  it('should allow multiple panels to be expanded when multipleExpanded is true', () => {
    fixture.componentRef.setInput('config', {
      multipleExpanded: true,
      items: [
        { id: '1', title: 'Item 1', content: 'Content 1' },
        { id: '2', title: 'Item 2', content: 'Content 2' },
      ],
    });
    fixture.detectChanges();

    const config = component.config();
    expect(config.multipleExpanded).toBe(true);
  });

  it('should merge partial config with defaults', () => {
    fixture.componentRef.setInput('config', {
      items: [{ id: '1', title: 'Item 1' }],
    });
    fixture.detectChanges();

    const config = component.config();
    expect(config.expandable).toBe(true); // default
    expect(config.showIcons).toBe(true); // default
    expect(config.multipleExpanded).toBe(false); // default
    expect(config.items.length).toBe(1);
  });
});
