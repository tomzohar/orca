import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FillAvailableHeightDirective } from './fill-available-height.directive';

@Component({
  selector: 'orca-test-component',
  standalone: true,
  imports: [FillAvailableHeightDirective],
  template: `
    <div
      [orcaFillAvailableHeight]="margin()"
      style="position: absolute; top: 100px;"
    >
      Test Content
    </div>
  `,
})
class TestComponent {
  margin = signal(0);
}

describe('FillAvailableHeightDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent, FillAvailableHeightDirective],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement.querySelector('div');

    // Mock window.innerHeight
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1000,
    });

    fixture.detectChanges();

    // Wait for AfterViewInit and async updates
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  it('should create an instance', () => {
    expect(element).toBeTruthy();
  });

  it('should calculate height based on element position', () => {
    // Element is at top: 100px, viewport: 1000px
    // Expected height should be positive
    const height = parseInt(element.style.height);
    expect(height).toBeGreaterThan(0);
  });

  it('should subtract margin from calculated height', async () => {
    fixture.detectChanges();
    const initialHeight = parseInt(element.style.height);

    // Set margin to 50px
    component.margin.set(50);
    fixture.detectChanges();

    // Wait for effect to apply
    await new Promise(resolve => setTimeout(resolve, 50));

    const newHeight = parseInt(element.style.height);
    // Height should be less than without margin
    expect(newHeight).toBeLessThan(initialHeight);
    expect(newHeight).toBeGreaterThan(0);
  });

  it('should update height when margin changes', async () => {
    fixture.detectChanges();
    const initialHeight = parseInt(element.style.height);

    // Change margin
    component.margin.set(100);
    fixture.detectChanges();

    // Wait for effect to apply
    await new Promise(resolve => setTimeout(resolve, 50));

    const newHeight = parseInt(element.style.height);
    // New height should be less than initial (due to margin)
    expect(newHeight).toBeLessThan(initialHeight);
  });

  it('should handle Math.max to prevent negative heights', () => {
    // The directive uses Math.max(0, availableHeight) to ensure height is never negative
    // This test verifies the height is always a valid positive number or 0
    const height = parseInt(element.style.height);
    expect(height).toBeGreaterThanOrEqual(0);
  });

  it('should apply height style to element', () => {
    expect(element.style.height).toBeTruthy();
    expect(element.style.height).toMatch(/\d+px/);
  });

  it('should cleanup on destroy', () => {
    const spy = vi.spyOn(window, 'removeEventListener');
    fixture.destroy();
    expect(spy).toHaveBeenCalled();
  });
});
