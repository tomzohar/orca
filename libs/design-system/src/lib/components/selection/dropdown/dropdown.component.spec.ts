import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DropdownComponent } from './dropdown.component';
import { DropdownConfig } from '../../../types/component.types';

describe('DropdownComponent', () => {
    let component: DropdownComponent;
    let fixture: ComponentFixture<DropdownComponent>;

    const mockOptions = [
        { label: 'Option 1', value: 'opt1' },
        { label: 'Option 2', value: 'opt2' },
    ];

    const defaultConfig: DropdownConfig = {
        label: 'Test Label',
        placeholder: 'Test Placeholder',
        options: mockOptions,
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DropdownComponent, BrowserAnimationsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(DropdownComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('config', defaultConfig);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the label', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('mat-label')?.textContent).toContain('Test Label');
    });

    it('should emit value change on selection', () => {
        const spy = vi.spyOn(component.value, 'set');
        component.onSelectionChange({ value: 'opt1' });
        expect(spy).toHaveBeenCalledWith('opt1');
    });

    it('should handle disabled state', () => {
        fixture.componentRef.setInput('config', { ...defaultConfig, disabled: true });
        fixture.detectChanges();
        const select = fixture.nativeElement.querySelector('mat-select');
        expect(select.getAttribute('aria-disabled')).toBe('true');
    });

    it('should display error message', async () => {
        fixture.componentRef.setInput('config', { ...defaultConfig, error: 'Error Message' });
        fixture.detectChanges();
        expect(component.config().error).toBe('Error Message');

        await fixture.whenStable();
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        const errorElement = compiled.querySelector('.orca-error-message');
        expect(errorElement).toBeTruthy();
        expect(errorElement?.textContent).toContain('Error Message');
    });
});
