import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';
import { By } from '@angular/platform-browser';

describe('EmptyStateComponent', () => {
    let component: EmptyStateComponent;
    let fixture: ComponentFixture<EmptyStateComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EmptyStateComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(EmptyStateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show image when config.imgSrc is provided', () => {
        fixture.componentRef.setInput('config', { imgSrc: 'test.png' });
        fixture.detectChanges();
        const img = fixture.debugElement.query(By.css('.empty-state-image'));
        expect(img).toBeTruthy();
        expect(img.nativeElement.src).toContain('test.png');
    });

    it('should NOT show image when config.imgSrc is NOT provided', () => {
        fixture.componentRef.setInput('config', {});
        fixture.detectChanges();
        const img = fixture.debugElement.query(By.css('.empty-state-image'));
        expect(img).toBeFalsy();
    });

    it('should show title when provided in config', () => {
        fixture.componentRef.setInput('config', { title: 'Test Title' });
        fixture.detectChanges();
        const title = fixture.debugElement.query(By.css('.empty-state-title'));
        expect(title.nativeElement.textContent).toContain('Test Title');
    });

    it('should show description when provided in config', () => {
        fixture.componentRef.setInput('config', { description: 'Test Description' });
        fixture.detectChanges();
        const desc = fixture.debugElement.query(By.css('.empty-state-description'));
        expect(desc.nativeElement.textContent).toContain('Test Description');
    });

    it('should show CTA when config.action is provided', () => {
        fixture.componentRef.setInput('config', {
            action: { label: 'Click Me', variant: 'primary' }
        });
        fixture.detectChanges();
        const btn = fixture.debugElement.query(By.css('orca-button'));
        expect(btn).toBeTruthy();
        expect(btn.nativeElement.textContent).toContain('Click Me');
    });
});
