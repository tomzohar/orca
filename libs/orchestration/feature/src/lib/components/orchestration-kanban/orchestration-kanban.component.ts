import { Component, input, output, computed, TemplateRef, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, SlicePipe } from '@angular/common';
import { KanbanViewComponent, KanbanList, KanbanItemDropEvent } from '@orca/design-system';
import { JobStatus, JobUIModel } from '@orca/orchestration-types';

@Component({
  selector: 'orca-orchestration-kanban',
  standalone: true,
  imports: [KanbanViewComponent, SlicePipe],
  templateUrl: './orchestration-kanban.component.html',
  styleUrl: './orchestration-kanban.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrchestrationKanbanComponent {
  // Inputs
  jobs = input.required<JobUIModel[]>();

  // Outputs
  jobClicked = output<JobUIModel>();
  jobDropped = output<KanbanItemDropEvent<JobUIModel>>();

  // Template reference for job card
  readonly jobCardTemplate = viewChild.required<TemplateRef<unknown>>('jobCard');

  // Kanban column configuration
  readonly kanbanLists = computed<KanbanList<JobUIModel>[]>(() => {
    const jobs = this.jobs();

    const jobsByStatus = jobs.reduce((map, job) => {
      if (!map[job.status]) {
        map[job.status] = [];
      }
      map[job.status].push(job);
      return map;
    }, {} as Record<JobStatus, JobUIModel[]>);

    return [
      {
        id: JobStatus.PENDING,
        title: 'Pending',
        items: jobsByStatus[JobStatus.PENDING] || [],
      },
      {
        id: JobStatus.RUNNING,
        title: 'Running',
        items: jobsByStatus[JobStatus.RUNNING] || [],
      },
      {
        id: JobStatus.WAITING_FOR_USER,
        title: 'Waiting for user',
        items: jobsByStatus[JobStatus.WAITING_FOR_USER] || [],
      },
      {
        id: JobStatus.COMPLETED,
        title: 'Completed',
        items: jobsByStatus[JobStatus.COMPLETED] || [],
      },
      {
        id: JobStatus.FAILED,
        title: 'Failed',
        items: jobsByStatus[JobStatus.FAILED] || [],
      },
    ];
  });

  /**
   * Handles job card click
   */
  onJobClick(job: JobUIModel): void {
    this.jobClicked.emit(job);
  }

  /**
   * Handles job card keyboard events
   */
  onJobKeyDown(event: KeyboardEvent, job: JobUIModel): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onJobClick(job);
    }
  }

  /**
   * Handles drag-and-drop events from kanban
   */
  onJobDrop(event: KanbanItemDropEvent<JobUIModel>): void {
    this.jobDropped.emit(event);
  }
}
