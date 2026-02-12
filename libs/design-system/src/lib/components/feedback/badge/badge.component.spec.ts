import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BadgeComponent } from './badge.component';
import { BadgeConfig } from '../../../types/component.types';

describe('BadgeComponent', () => {
  let component: BadgeComponent;
  let fixture: ComponentFixture<BadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply default config', () => {
    fixture.componentRef.setInput('config', { text: 'Test' });
    fixture.detectChanges();

    const config = component.config();
    expect(config.variant).toBe('neutral');
    expect(config.size).toBe('md');
    expect(config.text).toBe('Test');
  });

  it('should render badge text', () => {
    fixture.componentRef.setInput('config', { text: 'Success' });
    fixture.detectChanges();

    const badgeElement = fixture.nativeElement.querySelector('.orca-badge');
    expect(badgeElement.textContent.trim()).toBe('Success');
  });

  it('should apply variant class', () => {
    const testCases: Array<{ variant: BadgeConfig['variant']; expectedClass: string }> = [
      { variant: 'success', expectedClass: 'badge-success' },
      { variant: 'info', expectedClass: 'badge-info' },
      { variant: 'warning', expectedClass: 'badge-warning' },
      { variant: 'error', expectedClass: 'badge-error' },
      { variant: 'neutral', expectedClass: 'badge-neutral' },
    ];

    testCases.forEach(({ variant, expectedClass }) => {
      fixture.componentRef.setInput('config', { text: 'Test', variant });
      fixture.detectChanges();

      const badgeElement = fixture.nativeElement.querySelector('.orca-badge');
      expect(badgeElement.classList.contains(expectedClass)).toBe(true);
    });
  });

  it('should apply size class', () => {
    fixture.componentRef.setInput('config', { text: 'Test', size: 'sm' });
    fixture.detectChanges();

    const badgeElement = fixture.nativeElement.querySelector('.orca-badge');
    expect(badgeElement.classList.contains('badge-sm')).toBe(true);

    fixture.componentRef.setInput('config', { text: 'Test', size: 'md' });
    fixture.detectChanges();

    expect(badgeElement.classList.contains('badge-md')).toBe(true);
  });
});
