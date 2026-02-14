import {
  Directive,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  input,
  effect,
  inject,
} from '@angular/core';

@Directive({
  selector: '[orcaFillAvailableHeight]',
  standalone: true,
})
export class FillAvailableHeightDirective implements AfterViewInit, OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private resizeObserver?: ResizeObserver;
  private animationFrameId?: number;
  private lastCalculatedHeight = 0;

  /**
   * Optional margin to subtract from the calculated height (in pixels)
   */
  orcaFillAvailableHeight = input<number>(0);

  constructor() {
    // React to margin changes
    effect(() => {
      const margin = this.orcaFillAvailableHeight();
      // Always schedule updates for margin changes (debounced via scheduleUpdate)
      if (margin !== undefined) {
        this.scheduleUpdate();
      }
    });
  }

  ngAfterViewInit(): void {
    const element = this.elementRef.nativeElement;

    // Set initial height immediately to prevent flickering
    // This will be corrected by the next calculation if needed
    const initialHeight = window.innerHeight;
    element.style.height = `${initialHeight}px`;

    // Delay initial calculation to ensure DOM is fully laid out
    requestAnimationFrame(() => {
      setTimeout(() => {
        this.updateHeight();

        // Set up observers after initial calculation
        this.setupObservers();
      }, 100); // Slightly longer delay for stability
    });
  }

  private setupObservers(): void {
    // Use ResizeObserver if available (not available in some test environments)
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.scheduleUpdate();
      });

      // Observe both the element and the body
      this.resizeObserver.observe(this.elementRef.nativeElement);
      this.resizeObserver.observe(document.body);
    }

    // Also listen to window resize for viewport changes
    window.addEventListener('resize', this.handleResize);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    window.removeEventListener('resize', this.handleResize);
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private handleResize = (): void => {
    this.scheduleUpdate();
  };

  private scheduleUpdate(): void {
    // Cancel any pending update
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Schedule update on next animation frame to debounce
    this.animationFrameId = requestAnimationFrame(() => {
      this.updateHeight();
      this.animationFrameId = undefined;
    });
  }

  private updateHeight(): void {
    const element = this.elementRef.nativeElement;
    const rect = element.getBoundingClientRect();
    const margin = this.orcaFillAvailableHeight();

    // Calculate available height from element's top position to viewport bottom
    const viewportHeight = window.innerHeight;
    const availableHeight = Math.max(0, viewportHeight - rect.top - margin);

    // Only update if height changed significantly (avoid micro-adjustments)
    if (Math.abs(availableHeight - this.lastCalculatedHeight) > 1) {
      element.style.height = `${availableHeight}px`;
      this.lastCalculatedHeight = availableHeight;
    }
  }
}
