import { Injectable, inject, Type, ComponentRef, Injector, EnvironmentInjector, createComponent, ApplicationRef } from '@angular/core';
import { Overlay, OverlayRef, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { SidePanelConfig } from '../types/component.types';
import { SidePanelComponent } from '../components/feedback/side-panel/side-panel.component';
import { SIDE_PANEL_DATA } from './side-panel.tokens';

@Injectable({
    providedIn: 'root'
})
export class SidePanelService {
    private overlay = inject(Overlay);
    private injector = inject(Injector);
    private environmentInjector = inject(EnvironmentInjector);
    private appRef = inject(ApplicationRef);
    private openPanels: OverlayRef[] = [];

    open<D = unknown>(
        component: Type<unknown>,
        config: SidePanelConfig & { data?: D } = {}
    ): OverlayRef {
        // Create overlay configuration
        const overlayConfig = this.createOverlayConfig(config);
        const overlayRef = this.overlay.create(overlayConfig);

        // Create side panel container
        const containerPortal = new ComponentPortal(SidePanelComponent);
        const containerRef = overlayRef.attach(containerPortal);

        // Configure container
        containerRef.setInput('config', config);

        // Create and attach user component inside the container
        this.createUserComponent(
            component,
            containerRef,
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
        this.openPanels.push(overlayRef);

        return overlayRef;
    }

    closeAll(): void {
        this.openPanels.forEach(ref => this.closePanelRef(ref));
    }

    private closePanelRef(overlayRef: OverlayRef): void {
        const index = this.openPanels.indexOf(overlayRef);
        if (index > -1) {
            this.openPanels.splice(index, 1);
        }
        overlayRef.dispose();
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
        data?: D,
        parentInjector?: Injector
    ): ComponentRef<unknown> {
        // Create custom injector with data
        const injector = Injector.create({
            parent: parentInjector || this.injector,
            providers: [
                { provide: SIDE_PANEL_DATA, useValue: data }
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
