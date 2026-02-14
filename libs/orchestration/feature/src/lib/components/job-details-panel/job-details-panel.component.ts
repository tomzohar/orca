import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, viewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { BadgeComponent, SidePanelRef, SIDE_PANEL_DATA, TabsComponent } from '@orca/design-system';
import type { BadgeConfig, TabsConfig } from '@orca/design-system';
import { injectJobsQuery, JobEventsService, mapJobToUIModel } from '@orca/orchestration-data';
import { injectProjectDetection } from '@orca/core/projects';
import { type Job, type JobLog, type JobArtifact, JobStatus } from '@orca/orchestration-types';
import { JobOverviewComponent } from './job-overview/job-overview.component';
import { JobLogsComponent } from './job-logs/job-logs.component';
import { JobArtifactsComponent } from './job-artifacts/job-artifacts.component';

@Component({
    selector: 'orca-job-details-panel',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        TabsComponent,
        BadgeComponent,
        JobOverviewComponent,
        JobLogsComponent,
        JobArtifactsComponent
    ],
    providers: [JobEventsService],
    templateUrl: './job-details-panel.component.html',
    styleUrl: './job-details-panel.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobDetailsPanelComponent {
    private readonly panelData = inject(SIDE_PANEL_DATA) as { jobId: number };
    private readonly sidePanelRef = inject(SidePanelRef);
    private readonly jobEventsService = inject(JobEventsService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);

    // Template for side panel header
    readonly headerTemplate = viewChild<TemplateRef<unknown>>('headerTemplate');

    // Project context
    private readonly projectDetection = injectProjectDetection();
    private readonly projectId = computed(() =>
        this.projectDetection.data()?.project?.id.toString()
    );

    // Data fetching
    readonly jobsQuery = injectJobsQuery(this.projectId);

    // Real-time state for logs and artifacts
    readonly logs = signal<JobLog[]>([]);
    readonly artifacts = signal<JobArtifact[]>([]);

    // Combined job computed signal
    readonly job = computed(() => {
        const jobs = this.jobsQuery.data();
        const currentJobId = this.panelData.jobId;

        if (!jobs || !Array.isArray(jobs)) return null;

        // Find the job in the cache
        const foundJob = jobs.find((j: Job) => Number(j.id) === currentJobId);

        if (!foundJob) return null;

        // Map to UI model and merge with real-time logs/artifacts
        const uiModel = mapJobToUIModel(foundJob);
        return {
            ...uiModel,
            logs: this.logs(),
            artifacts: this.artifacts(),
        };
    });

    /**
     * Effect to update side panel header with title and status badge
     */
    private readonly updateHeaderEffect = effect(() => {
        const template = this.headerTemplate();
        if (template) {
            this.sidePanelRef.updateConfig({ headerTemplate: template });
        }
    });

    private readonly tabRoutes = ['overview', 'logs', 'artifacts'];
    readonly selectedTabIndex = signal(0);

    // Tab configuration
    readonly tabsConfig = computed<TabsConfig>(() => ({
        tabs: [
            { label: 'Overview' },
            { label: 'Logs' },
            { label: 'Artifacts' },
        ],
        selectedIndex: this.selectedTabIndex(),
    }));

    // Effect to initialize logs and artifacts from job data
    private readonly initializeDataEffect = effect(() => {
        const jobs = this.jobsQuery.data();
        const currentJobId = this.panelData.jobId;

        if (!jobs || !Array.isArray(jobs)) return;

        const foundJob = jobs.find((j: Job) => Number(j.id) === currentJobId);
        if (foundJob) {
            // Initialize logs and artifacts if they exist in the job data
            if (foundJob.logs && foundJob.logs.length > 0) {
                this.logs.set(foundJob.logs);
            }
            if (foundJob.artifacts && foundJob.artifacts.length > 0) {
                this.artifacts.set(foundJob.artifacts);
            }
        }
    });

    // Effect to observe job via SSE
    private readonly observeJobEffect = effect(() => {
        const projectIdStr = this.projectId();
        const job = this.job();
        const currentJobId = this.panelData.jobId;

        if (projectIdStr && job && [JobStatus.RUNNING, JobStatus.PENDING].includes(job.status)) {
            this.jobEventsService.observeJob(currentJobId, projectIdStr);
        }
    });

    // Effect to handle real-time events
    private readonly handleEventsEffect = effect((onCleanup) => {
        const currentJobId = this.panelData.jobId;
        const projectIdStr = this.projectId();

        const subscription = this.jobEventsService
            .getJobEvents$(currentJobId)
            .subscribe((event) => {
                if (event.type === 'log_added') {
                    const logPayload = event.payload as { message: string; timestamp: string; id: number };
                    this.logs.update((logs) => [...logs, logPayload]);
                } else if (event.type === 'artifact_added') {
                    // Artifact events only contain metadata, so refetch full job data to get content
                    if (projectIdStr) {
                        this.jobsQuery.refetch();
                    }
                }
            });

        onCleanup(() => subscription.unsubscribe());
    });

    constructor() {
        // Set initial tab from current route query params
        this.updateSelectedTabFromQuery();

        // Watch for query param changes to update selected tab
        this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                takeUntilDestroyed()
            )
            .subscribe(() => {
                this.updateSelectedTabFromQuery();
            });

        console.log('Job Details Panel initialized with jobId:', this.panelData.jobId);
    }

    private updateSelectedTabFromQuery(): void {
        const tab = this.route.snapshot.queryParamMap.get('tab');
        const index = this.isValidTab(tab ?? '') ? this.tabRoutes.indexOf(tab!) : 0;
        this.selectedTabIndex.set(index);
    }

    onTabChanged(index: number): void {
        this.selectedTabIndex.set(index);
        const tab = this.tabRoutes[index];

        // Update query param
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { tab },
            queryParamsHandling: 'merge',
        });
    }

    private isValidTab(tab: string): boolean {
        return this.tabRoutes.includes(tab);
    }

    /**
     * Gets badge configuration for job status
     */
    getStatusBadgeConfig(status: JobStatus): BadgeConfig {
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
