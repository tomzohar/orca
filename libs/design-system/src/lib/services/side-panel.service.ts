import { Injectable, inject, Type, ComponentRef, Injector, EnvironmentInjector, createComponent, ApplicationRef, signal, untracked } from '@angular/core';
import { Overlay, OverlayRef, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Subject } from 'rxjs';
import { SidePanelConfig } from '../types/component.types';
import { SidePanelComponent } from '../components/feedback/side-panel/side-panel.component';
import { SIDE_PANEL_DATA } from './side-panel.tokens';

export class SidePanelRef<D = unknown> {
    private readonly containerRef = signal<ComponentRef<SidePanelComponent> | null>(null);
    private readonly closedSubject = new Subject<void>();
    readonly closed$ = this.closedSubject.asObservable();

    constructor(private readonly overlayRef: OverlayRef) { }

    setContainerRef(ref: ComponentRef<SidePanelComponent>) {
        this.containerRef.set(ref);
    }

    updateConfig(config: Partial<SidePanelConfig>): void {
        const container = this.containerRef();
        if (container) {
            untracked(() => {
                const currentConfig = container.instance.config();
                container.setInput('config', { ...currentConfig, ...config });
            });
        }
    }

    close(): void {
        this.overlayRef.dispose();
        this.closedSubject.next();
        this.closedSubject.complete();
    }
}

@Injectable({
    providedIn: 'root'
})
export class SidePanelService {
    private overlay = inject(Overlay);
    private injector = inject(Injector);
    private environmentInjector = inject(EnvironmentInjector);
    private appRef = inject(ApplicationRef);
    private openPanels: { overlayRef: OverlayRef, sidePanelRef: SidePanelRef<any> }[] = [];

    open<D = unknown>(
        component: Type<unknown>,
        config: SidePanelConfig & { data?: D } = {}
    ): SidePanelRef<D> {
        // Create overlay configuration
        const overlayConfig = this.createOverlayConfig(config);
        const overlayRef = this.overlay.create(overlayConfig);
        const sidePanelRef = new SidePanelRef<D>(overlayRef);

        // Create side panel container
        const containerPortal = new ComponentPortal(SidePanelComponent);
        const containerRef = overlayRef.attach(containerPortal);

        // Configure container
        containerRef.setInput('config', config);
        sidePanelRef.setContainerRef(containerRef);

        // Create and attach user component inside the container
        this.createUserComponent(
            component,
            containerRef,
            sidePanelRef,
            config.data,
            config.injector
        );

        // Handle close button click
        containerRef.instance.closed.subscribe(() => {
            this.closePanelRef(overlayRef);
        });

        // Handle backdrop click if not disabled
        if (config.hasBackdrop !== false && !config.disableClose) {
            overlayRef.backdropClick().subscribe(() => {
                this.closePanelRef(overlayRef);
            });
        }

        // Track open panel
        this.openPanels.push({ overlayRef, sidePanelRef });

        return sidePanelRef;
    }

    closeAll(): void {
        this.openPanels.forEach(p => this.closePanelRef(p.overlayRef));
    }

    private closePanelRef(overlayRef: OverlayRef): void {
        const index = this.openPanels.findIndex(p => p.overlayRef === overlayRef);
        if (index > -1) {
            const panel = this.openPanels[index];
            this.openPanels.splice(index, 1);
            panel.sidePanelRef.close();
        }
    }

    private createOverlayConfig(config: SidePanelConfig): OverlayConfig {
        const position = config.position || 'right';

        return new OverlayConfig({
            hasBackdrop: config.hasBackdrop ?? true,
            backdropClass: config.backdropClass || 'orca-side-panel-backdrop',
            positionStrategy: this.overlay.position()
                .global()
            [position === 'left' ? 'left' : 'right']('0')
                .top('0'),
            scrollStrategy: this.overlay.scrollStrategies.block(),
        });
    }

    private createUserComponent<D>(
        component: Type<unknown>,
        containerRef: ComponentRef<SidePanelComponent>,
        sidePanelRef: SidePanelRef<D>,
        data?: D,
        parentInjector?: Injector
    ): ComponentRef<unknown> {
        // Create custom injector with data and side panel ref
        const injector = Injector.create({
            parent: parentInjector || this.injector,
            providers: [
                { provide: SIDE_PANEL_DATA, useValue: data },
                { provide: SidePanelRef, useValue: sidePanelRef }
            ]
        });

        // Create component with data injection
        const userComponentRef = createComponent(component, {
            environmentInjector: this.environmentInjector,
            elementInjector: injector,
        });

        // Attach component to ApplicationRef so change detection works
        this.appRef.attachView(userComponentRef.hostView);

        // Append user component to container content area
        const containerElement = containerRef.location.nativeElement;
        const contentArea = containerElement.querySelector('.orca-side-panel-content');
        if (contentArea) {
            contentArea.appendChild(userComponentRef.location.nativeElement);
        }

        // Clean up when container is destroyed (panel closed)
        containerRef.onDestroy(() => {
            this.appRef.detachView(userComponentRef.hostView);
            userComponentRef.destroy();
        });

        return userComponentRef;
    }
}
