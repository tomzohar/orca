import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'orca-kanban-card',
    standalone: true,
    imports: [CommonModule],
    template: `<ng-content></ng-content>`,
    styleUrls: ['./kanban-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanCardComponent { }
