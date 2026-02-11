import { Component, ChangeDetectionStrategy, input, output, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    CdkDragDrop,
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
    moveItemInArray,
    transferArrayItem,
    CdkDragPreview,
    CdkDragPlaceholder
} from '@angular/cdk/drag-drop';
import { KanbanList, KanbanItemDropEvent } from '../../../types/kanban.types';
import { KanbanCardComponent } from "../kanban-card/kanban-card.component";

@Component({
    selector: 'orca-kanban-view',
    standalone: true,
    imports: [
    CommonModule,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    CdkDragPreview,
    CdkDragPlaceholder,
    KanbanCardComponent
],
    templateUrl: './kanban-view.component.html',
    styleUrls: ['./kanban-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanViewComponent<T> {
    /**
     * The list of columns to display.
     */
    readonly lists = input.required<KanbanList<T>[]>();

    /**
     * Template for rendering each item card.
     * Context: { $implicit: item }
     */
    readonly itemTemplate = input.required<TemplateRef<unknown>>();

    /**
     * Optional template for the list header.
     * Context: { $implicit: list }
     */
    readonly listHeaderTemplate = input<TemplateRef<unknown>>();

    /**
     * Emitted when an item is dropped (reordered or moved between lists).
     */
    readonly itemDrop = output<KanbanItemDropEvent<T>>();

    drop(event: CdkDragDrop<T[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex,
            );
        }

        this.itemDrop.emit({
            item: event.item.data, // This relies on [cdkDragData] being set to the item
            sourceListId: event.previousContainer.id,
            targetListId: event.container.id,
            currentIndex: event.currentIndex,
            previousIndex: event.previousIndex,
            container: event.container
        });
    }
}
