import { TemplateRef } from '@angular/core';
import { CdkDropList } from '@angular/cdk/drag-drop';

/**
 * Interface for a Kanban List (Column)
 */
export interface KanbanList<T = unknown> {
    id: string | number;
    title: string;
    items: T[];
    action?: () => void;
}

/**
 * Event emitted when an item is dropped
 */
export interface KanbanItemDropEvent<T = unknown> {
    item: T;
    sourceListId: string | number;
    targetListId: string | number;
    currentIndex: number;
    previousIndex: number;
    container: CdkDropList;
}
