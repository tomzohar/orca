import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonGroupComponent } from './button-group.component';
import { IconName } from '../../types/component.types';

describe('ButtonGroupComponent', () => {
  let component: ButtonGroupComponent;
  let fixture: ComponentFixture<ButtonGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonGroupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonGroupComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply default config', () => {
    fixture.componentRef.setInput('config', {
      buttons: [
        { label: 'Option 1', value: 'opt1' },
        { label: 'Option 2', value: 'opt2' },
      ],
    });
    fixture.detectChanges();

    const config = component.config();
    expect(config.variant).toBe('secondary');
    expect(config.buttons.length).toBe(2);
  });

  it('should render all buttons', () => {
    fixture.componentRef.setInput('config', {
      buttons: [
        { label: 'Kanban', value: 'kanban' },
        { label: 'Table', value: 'table' },
      ],
    });
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('orca-button');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent.trim()).toBe('Kanban');
    expect(buttons[1].textContent.trim()).toBe('Table');
  });

  it('should mark selected button', () => {
    fixture.componentRef.setInput('config', {
      buttons: [
        { label: 'Kanban', value: 'kanban' },
        { label: 'Table', value: 'table' },
      ],
      selected: 'kanban',
    });
    fixture.detectChanges();

    // Check that the first button has primary variant (selected)
    const firstButtonConfig = component.getButtonConfig(component.config().buttons[0]);
    const secondButtonConfig = component.getButtonConfig(component.config().buttons[1]);

    expect(firstButtonConfig.variant).toBe('primary');
    expect(secondButtonConfig.variant).toBe('ghost');
  });

  it('should emit selectionChanged when button is clicked', () => {
    let emittedValue = '';
    component.selectionChanged.subscribe((value: string) => {
      emittedValue = value;
    });

    fixture.componentRef.setInput('config', {
      buttons: [
        { label: 'Kanban', value: 'kanban' },
        { label: 'Table', value: 'table' },
      ],
    });
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('orca-button button');
    buttons[1].click();

    expect(emittedValue).toBe('table');
  });

  it('should not emit when disabled button is clicked', () => {
    let emittedValue = '';
    component.selectionChanged.subscribe((value: string) => {
      emittedValue = value;
    });

    fixture.componentRef.setInput('config', {
      buttons: [
        { label: 'Kanban', value: 'kanban' },
        { label: 'Table', value: 'table', disabled: true },
      ],
    });
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('orca-button button');
    buttons[1].click();

    expect(emittedValue).toBe('');
  });

  it('should render icons when provided', () => {
    fixture.componentRef.setInput('config', {
      buttons: [
        { label: 'Kanban', value: 'kanban', icon: { name: IconName.view_kanban } },
        { label: 'Table', value: 'table', icon: { name: IconName.view_list } },
      ],
    });
    fixture.detectChanges();

    const icons = fixture.nativeElement.querySelectorAll('orca-icon');
    expect(icons.length).toBe(2);
  });

  it('should apply variant class', () => {
    fixture.componentRef.setInput('config', {
      buttons: [{ label: 'Test', value: 'test' }],
      variant: 'primary',
    });
    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector('.orca-button-group');
    expect(container.classList.contains('variant-primary')).toBe(true);
  });
});
