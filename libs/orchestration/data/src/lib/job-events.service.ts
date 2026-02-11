import { Injectable, OnDestroy, inject } from '@angular/core';
import { Subject, Observable, filter } from 'rxjs';
import { injectQueryClient } from '@tanstack/angular-query-experimental';
import { jobsKeys } from './jobs.query';

export interface JobEvent {
    jobId: number;
    type: 'job_created' | 'status_changed' | 'log_added' | 'artifact_added';
    payload: unknown;
}

/**
 * Centralized service for managing SSE connections to job events
 * Provides observable streams for job updates that components can subscribe to
 * 
 * Note: This service should be provided at the component level (OrchestrationComponent)
 * to ensure proper scoping and cleanup when the component is destroyed
 */
@Injectable()
export class JobEventsService implements OnDestroy {
    private readonly queryClient = injectQueryClient();

    // Map of job IDs to their EventSource connections
    private readonly eventSources = new Map<number, EventSource>();

    // Subject for broadcasting job events
    private readonly events$ = new Subject<JobEvent>();

    /**
     * Start observing a job's events via SSE
     * Multiple calls for the same job ID will reuse the existing connection
     */
    observeJob(jobId: number, projectId: string): void {
        // Don't create duplicate connections
        if (this.eventSources.has(jobId)) {
            return;
        }

        const url = `/api/agent-jobs/${jobId}/events`;
        const eventSource = new EventSource(url);

        eventSource.onmessage = (event) => {
            try {
                const sseEvent = JSON.parse(event.data);
                this.handleEvent(jobId, sseEvent, projectId);
            } catch (e) {
                console.error('[JobEventsService] Error parsing event:', e);
            }
        };

        eventSource.onerror = () => {
            console.warn('[JobEventsService] SSE connection closed for job', jobId);
            this.stopObservingJob(jobId);
        };

        this.eventSources.set(jobId, eventSource);
    }

    /**
     * Stop observing a specific job
     */
    stopObservingJob(jobId: number): void {
        const eventSource = this.eventSources.get(jobId);
        if (eventSource) {
            eventSource.close();
            this.eventSources.delete(jobId);
        }
    }

    /**
     * Get an observable stream of events for a specific job
     */
    getJobEvents$(jobId: number): Observable<JobEvent> {
        return this.events$.asObservable().pipe(
            filter(event => event.jobId === jobId)
        );
    }

    /**
     * Get an observable stream of all job events
     */
    getAllEvents$(): Observable<JobEvent> {
        return this.events$.asObservable();
    }

    /**
     * Handle incoming SSE events
     */
    private handleEvent(jobId: number, event: { type: string; payload: unknown }, projectId: string): void {
        const jobEvent: JobEvent = {
            jobId,
            type: event.type as JobEvent['type'],
            payload: event.payload,
        };

        // Broadcast event to subscribers
        this.events$.next(jobEvent);

        // Handle status changes by invalidating the jobs query
        if (event.type === 'status_changed') {
            this.queryClient.invalidateQueries({
                queryKey: jobsKeys.byProject(projectId),
            });

            // Check if job reached terminal state
            const payload = event.payload as { status?: string };
            if (payload.status === 'COMPLETED' || payload.status === 'FAILED') {
                this.stopObservingJob(jobId);
            }
        }
    }

    /**
     * Cleanup all connections on service destroy
     */
    ngOnDestroy(): void {
        this.eventSources.forEach((eventSource) => eventSource.close());
        this.eventSources.clear();
        this.events$.complete();
    }
}
