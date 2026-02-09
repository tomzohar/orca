import { Meta, StoryObj } from '@storybook/angular';
import { KanbanViewComponent } from './kanban-view.component';
import { KanbanCardComponent } from '../kanban-card/kanban-card.component';
import { KanbanList } from '../../../types/kanban.types';
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

// Dummy Data
interface Task {
    id: string;
    title: string;
    tag: string;
    assignee: string;
}

const MOCK_TASKS: Task[] = [
    { id: '1', title: 'Setup CI/CD Pipeline', tag: 'DEV', assignee: 'Tom' },
    { id: '2', title: 'Implement Auth', tag: 'BE', assignee: 'Sarah' },
    { id: '3', title: 'Design System', tag: 'FE', assignee: 'John' },
    { id: '4', title: 'Database Schema', tag: 'BE', assignee: 'Sarah' },
    { id: '5', title: 'User Dashboard', tag: 'FE', assignee: 'Tom' },
];

const MOCK_LISTS: KanbanList<Task>[] = [
    {
        id: 'todo',
        title: 'To Do',
        items: [MOCK_TASKS[0], MOCK_TASKS[1]]
    },
    {
        id: 'in-progress',
        title: 'In Progress',
        items: [MOCK_TASKS[2]]
    },
    {
        id: 'done',
        title: 'Done',
        items: [MOCK_TASKS[3], MOCK_TASKS[4]]
    }
];

// Wrapper component to handle state for the story
@Component({
    selector: 'orca-kanban-story-wrapper',
    standalone: true,
    imports: [CommonModule, KanbanViewComponent, KanbanCardComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    template: `
    <div style="height: 500px; padding: 20px; background: #0f172a;">
      <orca-kanban-view 
        [lists]="lists()" 
        [itemTemplate]="itemTemplate"
        (itemDrop)="handleDrop($event)">
      </orca-kanban-view>

      <ng-template #itemTemplate let-item>
        <orca-kanban-card>
            <div class="row">
                <span class="id">ORC-{{item.id}}</span>
                <span class="tag">{{item.tag}}</span>
            </div>
            <p>{{item.title}}</p>
            <div class="avatar">{{item.assignee.slice(0,2)}}</div>
        </orca-kanban-card>
      </ng-template>
    </div>
  `,
    styles: [`
    orca-kanban-card {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .row { display: flex; justify-content: space-between; font-size: 12px; color: #b0bec5; }
    .tag { background: #40c4ff; color: black; padding: 2px 6px; border-radius: 12px; font-weight: bold; font-size: 10px; }
    p { margin: 0; font-weight: 500; font-size: 14px; }
    .avatar { width: 24px; height: 24px; background: #00e5ff; color: black; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; }
  `]
})
class KanbanStoryWrapperComponent {
    lists = signal(MOCK_LISTS); // Start with structured data

    handleDrop(event: any) {
        console.log('Drop Event:', event);
        // In a real app, we update the data source here.
        // For storybook visualization, we might not strictly need to update the signal 
        // unless we want to prove data integrity, because CDK modifies the array in place via moveItemInArray/transferArrayItem
        // inside the component. However, since the component is OnPush and uses signals, 
        // and we passed data *into* the component, the component's internal mutation of that data 
        // applies to the reference we passed. 
        // So the UI should update.
    }
}

const meta: Meta<KanbanStoryWrapperComponent> = {
    title: 'Components/Kanban',
    component: KanbanStoryWrapperComponent,
    decorators: [
        (story) => ({
            ...story(),
            template: `<orca-kanban-story-wrapper></orca-kanban-story-wrapper>`
        })
    ],
};

export default meta;
type Story = StoryObj<KanbanViewComponent<Task>>;

export const Default: Story = {};
