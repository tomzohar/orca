import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KanbanViewComponent } from './kanban-view.component';
import { KanbanList } from '../../../types/kanban.types';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';

interface TestItem {
    id: number;
    title: string;
}

@Component({
    template: `
    <orca-kanban-view [lists]="lists" [itemTemplate]="itemTemplate"></orca-kanban-view>
    <ng-template #itemTemplate let-item>{{ item.title }}</ng-template>
  `,
    standalone: true,
    imports: [KanbanViewComponent, CommonModule]
})
class TestHostComponent {
    lists: KanbanList<TestItem>[] = [
        { id: '1', title: 'List 1', items: [{ id: 1, title: 'Item 1' }] },
        { id: '2', title: 'List 2', items: [] }
    ];
    @ViewChild('itemTemplate') itemTemplate!: TemplateRef<TestItem>;
}

describe('KanbanViewComponent', () => {
    let component: TestHostComponent;
    let fixture: ComponentFixture<TestHostComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHostComponent, KanbanViewComponent, DragDropModule]
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render lists', () => {
        const listElements = fixture.nativeElement.querySelectorAll('.kanban-list');
        expect(listElements.length).toBe(2);
    });

    it('should render items', () => {
        const itemElements = fixture.nativeElement.querySelectorAll('.kanban-item-wrapper');
        expect(itemElements.length).toBe(1);
        expect(itemElements[0].textContent).toContain('Item 1');
    });

    it('should render list titles', () => {
        const titles = fixture.nativeElement.querySelectorAll('.list-header h5');
        expect(titles[0].textContent).toContain('List 1');
        expect(titles[1].textContent).toContain('List 2');
    });
});
