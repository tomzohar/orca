import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, Injector, TemplateRef, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { injectProjectDetection } from '@orca/core/projects';
import { ButtonComponent, DialogService, EmptyStateComponent, EmptyStateConfig, KanbanItemDropEvent, KanbanList, KanbanViewComponent, PageHeaderComponent, SidePanelService, SpinnerComponent } from '@orca/design-system';
import { injectJobsQuery, JobEventsService, mapJobsToUIModels } from '@orca/orchestration-data';
import { JobStatus, JobUIModel } from '@orca/orchestration-types';
import { CreateJobDialogComponent } from './components/create-job-dialog/create-job-dialog.component';
import { JobDetailsPanelComponent } from './components/job-details-panel/job-details-panel.component';

@Component({
  selector: 'orca-orchestration',
  standalone: true,
  imports: [
    CommonModule,
    KanbanViewComponent,
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
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

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

  // Template reference for job card rendering
  readonly jobCardTemplate = viewChild.required<TemplateRef<unknown>>('jobCard');

  // Computed states from query
  readonly isLoading = computed(() => this.jobsQuery.isLoading());
  readonly hasError = computed(() => this.jobsQuery.isError());
  readonly jobs = computed(() => {
    const data = this.jobsQuery.data();
    return data && Array.isArray(data) ? mapJobsToUIModels(data) : [];
  });

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

  /**
   * Effect to observe jobs when they change
   * Must be defined in injection context (field initializer)
   */
  private readonly observeJobsEffect = effect(() => {
    const jobs = this.jobs();
    const projectIdStr = this.projectId();

    if (!projectIdStr) return;

    // Start observing all PENDING, RUNNING, and WAITING_FOR_USER jobs
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
  });

  constructor() {
    // Listen to route params
    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(params => {
        const jobIdStr = params.get('jobId');
        if (jobIdStr) {
          const jobId = Number(jobIdStr);
          if (!isNaN(jobId)) {
            this.openJobDetails(jobId);
          }
        } else {
          this.sidePanelService.closeAll();
        }
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

    dialogRef.closed.subscribe(jobId => {
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
  }

  /**
   * Handles clicking on a job card
   * Navigates to the job details route
   */
  onJobClick(job: JobUIModel): void {
    this.router.navigate(['.', job.id], { relativeTo: this.route });
  }

  /**
   * Handles keyboard events on a job card
   */
  onJobKeyDown(event: KeyboardEvent, job: JobUIModel): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onJobClick(job);
    }
  }

  private openJobDetails(jobId: number): void {
    const overlayRef = this.sidePanelService.open(JobDetailsPanelComponent, {
      data: { jobId },
      title: 'Job Details',
      size: 'xl',
      injector: this.injector
    });

    // Handle close to navigate back
    overlayRef.detachments().subscribe(() => {
      // Only navigate back if we are still on the job route
      const currentJobId = this.route.snapshot.paramMap.get('jobId');
      if (currentJobId && Number(currentJobId) === jobId) {
        this.router.navigate(['..'], { relativeTo: this.route });
      }
    });
  }

  /**
   * Handles drag-and-drop events from kanban
   * TODO: Implement status update logic when backend is ready
   */
  onJobDrop(event: KanbanItemDropEvent<JobUIModel>): void {
    console.log('Job dropped:', event);
    // TODO: Update job status via targetListId
  }
}
