import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { BadgeConfig, IconName, TableComponent, TableConfig } from '@orca/design-system';
import { JobStatus, JobUIModel } from '@orca/orchestration-types';

export interface JobActionEvent {
  job: JobUIModel;
  action: 'cancel' | 'retry' | 'delete';
}

@Component({
  selector: 'orca-orchestration-table',
  standalone: true,
  imports: [TableComponent],
  templateUrl: './orchestration-table.component.html',
  styleUrl: './orchestration-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrchestrationTableComponent {
  // Inputs
  jobs = input.required<JobUIModel[]>();
  loading = input<boolean>(false);
  error = input<string | null>(null);

  // Outputs
  jobClicked = output<JobUIModel>();
  jobAction = output<JobActionEvent>();

  // Icons
  readonly icons = IconName;

  // Table configuration
  readonly tableConfig = computed<TableConfig<JobUIModel>>(() => ({
    data: this.jobs(),
    loading: this.loading(),
    error: this.error(),
    emptyMessage: 'No jobs yet. Create your first job to get started.',
    fillAvailableHeight: 24,
    columns: [
      {
        key: 'status',
        label: 'Status',
        type: 'badge',
        sortable: true,
        width: '140px',
        badgeConfig: (job) => this.getStatusBadgeConfig(job.status),
      },
      {
        key: 'type',
        label: 'Type',
        sortable: true,
        width: '140px',
      },
      {
        key: 'prompt',
        label: 'Prompt',
        pipe: 'truncate',
        width: 'auto',
      },
      {
        key: 'createdAt',
        label: 'Created',
        type: 'text',
        pipe: 'relativeTime',
        sortable: true,
        width: '150px',
      },
      {
        key: 'actions',
        label: 'Actions',
        type: 'actions',
        width: '80px',
        actions: [
          {
            label: 'Cancel',
            icon: IconName.cancel,
            onClick: (job) => this.onCancelJob(job),
            visible: (job) => job.status === JobStatus.PENDING || job.status === JobStatus.RUNNING,
          },
          {
            label: 'Retry',
            icon: IconName.refresh,
            onClick: (job) => this.onRetryJob(job),
            visible: (job) => job.status === JobStatus.FAILED,
          },
          {
            label: 'Delete',
            icon: IconName.delete,
            onClick: (job) => this.onDeleteJob(job),
          },
        ],
      },
    ],
    onRowClick: (job) => this.onJobClick(job),
  }));

  /**
   * Handles job row click
   */
  onJobClick(job: JobUIModel): void {
    this.jobClicked.emit(job);
  }

  /**
   * Handles cancel job action
   */
  onCancelJob(job: JobUIModel): void {
    this.jobAction.emit({ job, action: 'cancel' });
  }

  /**
   * Handles retry job action
   */
  onRetryJob(job: JobUIModel): void {
    this.jobAction.emit({ job, action: 'retry' });
  }

  /**
   * Handles delete job action
   */
  onDeleteJob(job: JobUIModel): void {
    this.jobAction.emit({ job, action: 'delete' });
  }

  /**
   * Gets badge configuration for job status
   */
  private getStatusBadgeConfig(status: JobStatus): BadgeConfig {
    const configs: Record<JobStatus, BadgeConfig> = {
      [JobStatus.PENDING]: { text: 'Pending', variant: 'neutral' },
      [JobStatus.RUNNING]: { text: 'Running', variant: 'info' },
      [JobStatus.WAITING_FOR_USER]: { text: 'Waiting', variant: 'warning' },
      [JobStatus.COMPLETED]: { text: 'Completed', variant: 'success' },
      [JobStatus.FAILED]: { text: 'Failed', variant: 'error' },
    };
    return configs[status];
  }
}
