import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { SIDE_PANEL_DATA } from '@orca/design-system';
import { injectJobsQuery, JobEventsService, mapJobToUIModel } from '@orca/orchestration-data';
import { injectProjectDetection } from '@orca/core/projects';
import { Job } from '@orca/orchestration-types';

@Component({
    selector: 'orca-job-details-panel',
    standalone: true,
    imports: [CommonModule, JsonPipe],
    templateUrl: './job-details-panel.component.html',
    styleUrl: './job-details-panel.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobDetailsPanelComponent {
    // Injected data
    private readonly panelData = inject(SIDE_PANEL_DATA) as { jobId: number };
    private readonly jobId = this.panelData.jobId;

    // Services
    private readonly jobEventsService = inject(JobEventsService);

    // Project context
    private readonly projectDetection = injectProjectDetection();
    private readonly projectId = computed(() =>
        this.projectDetection.data()?.project?.id.toString()
    );

    // Data fetching
    private readonly jobsQuery = injectJobsQuery(this.projectId);

    // Selected job
    readonly job = computed(() => {
        const jobs = this.jobsQuery.data();
        if (!jobs || !Array.isArray(jobs)) return null;

        // Find the job in the cache
        // Note: The API returns IDs as strings or numbers, need to be careful with comparison
        const foundJob = jobs.find((j: Job) => Number(j.id) === this.jobId);

        if (!foundJob) return null;

        // Map to UI model
        return mapJobToUIModel(foundJob);
    });

    // Effect to listen for live updates
    private readonly observeJobEffect = effect(() => {
        const projectIdStr = this.projectId();
        const job = this.job();
        if (projectIdStr && job) {
            this.jobEventsService.observeJob(Number(job.id), projectIdStr);
        }
    });

    constructor() {
        console.log('Job Details Panel initialized with jobId:', this.jobId);
    }
}
