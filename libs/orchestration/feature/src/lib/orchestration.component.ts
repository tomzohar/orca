import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, Injector, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { injectProjectDetection } from '@orca/core/projects';
import { ButtonComponent, ButtonGroupComponent, ConfirmationDialogComponent, DialogService, EmptyStateComponent, EmptyStateConfig, IconName, KanbanItemDropEvent, PageHeaderComponent, SidePanelService, SpinnerComponent } from '@orca/design-system';
import { injectJobsQuery, JobEventsService, mapJobsToUIModels } from '@orca/orchestration-data';
import { Job, JobStatus, JobUIModel } from '@orca/orchestration-types';
import { CreateJobDialogComponent } from './components/create-job-dialog/create-job-dialog.component';
import { JobDetailsPanelComponent } from './components/job-details-panel/job-details-panel.component';
import { OrchestrationTableComponent, JobActionEvent } from './components/orchestration-table/orchestration-table.component';
import { OrchestrationKanbanComponent } from './components/orchestration-kanban/orchestration-kanban.component';

@Component({
  selector: 'orca-orchestration',
  standalone: true,
  imports: [
    CommonModule,
    OrchestrationKanbanComponent,
    OrchestrationTableComponent,
    ButtonGroupComponent,
    SpinnerComponent,
    EmptyStateComponent,
    PageHeaderComponent,
    ButtonComponent,
  ],
  providers: [JobEventsService],
  templateUrl: './orchestration.component.html',
  styleUrl: './orchestration.component.scss',
})
export class OrchestrationComponent {
  // Services
  private readonly jobEventsService = inject(JobEventsService);
  private readonly dialogService = inject(DialogService);
  private readonly sidePanelService = inject(SidePanelService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  readonly icons = IconName;

  // Inject project detection to get the current project context
  private readonly projectDetection = injectProjectDetection();

  // Compute the current project ID (string for query)
  readonly projectId = computed(() =>
    this.projectDetection.data()?.project?.id.toString()
  );

  // Compute the current project ID as number (for dialog)
  readonly projectIdNumber = computed(() =>
    this.projectDetection.data()?.project?.id
  );

  // Compute the current project name
  readonly projectName = computed(() =>
    this.projectDetection.data()?.project?.name ?? 'Unknown Project'
  );

  // Pass the project ID signal to the jobs query
  private readonly jobsQuery = injectJobsQuery(this.projectId);

  // Computed states from query
  readonly isLoading = computed(() => this.jobsQuery.isLoading());
  readonly hasError = computed(() => this.jobsQuery.isError());
  readonly jobs = computed(() => {
    const data = this.jobsQuery.data();
    return data && Array.isArray(data) ? mapJobsToUIModels(data) : [];
  });

  // Empty state configuration
  readonly emptyStateConfig: EmptyStateConfig = {
    title: 'No jobs yet',
    description: 'Create your first job to get started with project orchestration',
  };

  // Computed flag for showing kanban
  readonly showKanban = computed(() => {
    return !this.isLoading() && !this.hasError() && this.jobs().length > 0;
  });

  // Computed flag for showing empty state
  readonly showEmpty = computed(() => {
    return !this.isLoading() && !this.hasError() && this.jobs().length === 0;
  });

  // View mode with localStorage persistence
  private readonly VIEW_MODE_KEY = 'orchestration-view-mode';
  readonly viewMode = signal<'kanban' | 'table'>(this.loadViewMode());

  /**
   * Effect to observe jobs when they change
   * Must be defined in injection context (field initializer)
   */
  private readonly observeJobsEffect = effect(() => {
    const jobs = this.jobs();
    const projectIdStr = this.projectId();

    if (!projectIdStr) return;

    // Start observing all PENDING, RUNNING, and WAITING_FOR_USER jobs
    this.listenToActiveJobsEvents(jobs, projectIdStr)

  });

  constructor() {
    this.route.params.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((params) => {
      const jobId = params['jobId'];
      this.handleJobIdChange(jobId);
    });
  }

  private currentPanelJobId: number | null = null;

  private openSidePanelForJob(jobId: number): void {
    // Don't reopen if already showing this job
    if (this.currentPanelJobId === jobId) {
      return;
    }

    this.currentPanelJobId = jobId;

    // Open side panel with job details component
    // The component will use router-outlet to render child tab components
    const sidePanelRef = this.sidePanelService.open(JobDetailsPanelComponent, {
      data: { jobId },
      title: 'Job Details',
      size: 'xl',
      injector: this.injector,
    });

    // When panel closes, navigate back and reset state
    sidePanelRef.closed$.subscribe(() => {
      this.currentPanelJobId = null;
      this.router.navigate(['/orchestration']);
    });
  }

  /**
   * Handles "Create job" button click
   */
  onCreateJob(): void {
    const projectId = this.projectIdNumber();
    const projectName = this.projectName();

    if (!projectId) return;

    const dialogRef = this.dialogService.open<number>(CreateJobDialogComponent, {
      data: { projectId, projectName },
      title: 'Create Agent Job',
      size: 'md'
    });

    dialogRef.closed.subscribe((jobId: number | undefined) => {
      if (jobId) {
        this.onJobCreated(jobId);
      }
    });
  }

  /**
   * Handles successful job creation
   * Starts listening to SSE for real-time updates
   */
  onJobCreated(jobId: number): void {
    const projectIdStr = this.projectId();
    if (projectIdStr) {
      this.jobEventsService.observeJob(jobId, projectIdStr);
    }
    this.handleJobIdChange(jobId.toString());
  }

  /**
   * Handles job click from child components
   */
  onJobClick(job: JobUIModel): void {
    this.router.navigate(['/orchestration', job.id]);
  }

  /**
   * Handles drag-and-drop events from kanban
   */
  onJobDrop(event: KanbanItemDropEvent<JobUIModel>): void {
    console.log('Job dropped:', event);
    // TODO: Update job status via targetListId
  }

  /**
   * Handles job actions from table component
   */
  onJobAction(event: JobActionEvent): void {
    switch (event.action) {
      case 'cancel':
        this.onCancelJob(event.job);
        break;
      case 'retry':
        this.onRetryJob(event.job);
        break;
      case 'delete':
        this.onDeleteJob(event.job);
        break;
    }
  }

  private handleJobIdChange(jobId: string | null | undefined): void {
    if (jobId && !isNaN(Number(jobId))) {
      this.openSidePanelForJob(Number(jobId));
    } else {
      this.sidePanelService.closeAll();
    }
  }

  private listenToActiveJobsEvents(jobs: Job[], projectIdStr: string) {
    jobs.forEach((job) => {
      // Skip jobs with temporary string IDs (e.g., from optimistic updates)
      if (job.id.toString().startsWith('temp-')) {
        return;
      }

      const jobId = Number(job.id);
      if (isNaN(jobId)) {
        return;
      }

      if (
        job.status === JobStatus.PENDING ||
        job.status === JobStatus.RUNNING ||
        job.status === JobStatus.WAITING_FOR_USER
      ) {
        this.jobEventsService.observeJob(jobId, projectIdStr);
      }
    });
  }

  // View mode management
  private loadViewMode(): 'kanban' | 'table' {
    const stored = localStorage.getItem(this.VIEW_MODE_KEY);
    return stored === 'table' ? 'table' : 'kanban';
  }

  onViewModeChange(mode: string): void {
    const viewMode = mode as 'kanban' | 'table';
    this.viewMode.set(viewMode);
    localStorage.setItem(this.VIEW_MODE_KEY, viewMode);
  }

  // Job action handlers
  onCancelJob(job: JobUIModel): void {
    console.log('Cancel job:', job);
    // TODO: Implement cancel logic when backend is ready
  }

  onRetryJob(job: JobUIModel): void {
    console.log('Retry job:', job);
    // TODO: Implement retry logic when backend is ready
  }

  onDeleteJob(job: JobUIModel): void {
    const dialogRef = this.dialogService.open<boolean>(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Job',
        message: 'Are you sure you want to delete this job? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        danger: true,
      },
    });

    dialogRef.closed.subscribe((confirmed) => {
      if (confirmed) {
        console.log('Delete job:', job);
        // TODO: Implement delete logic when backend is ready
      }
    });
  }
}
