import { Component, ElementRef, inject, input } from '@angular/core';
import { injectDevtoolsPanel } from '@tanstack/angular-query-devtools-experimental';

@Component({
    selector: 'app-angular-query-devtools',
    standalone: true,
    template: '',
    host: {
        style: 'display: block; height: 100%; width: 100%;'
    }
})
export class AngularQueryDevtoolsComponent {
    readonly #elementRef = inject(ElementRef);

    initialIsOpen = input(false);
    buttonPosition = input<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('bottom-right');
    position = input<'top' | 'bottom' | 'left' | 'right'>('bottom');

    constructor() {
        injectDevtoolsPanel(() => ({
            hostElement: this.#elementRef,
            initialIsOpen: this.initialIsOpen(),
            buttonPosition: this.buttonPosition(),
            position: this.position(),
        }));
    }
}
