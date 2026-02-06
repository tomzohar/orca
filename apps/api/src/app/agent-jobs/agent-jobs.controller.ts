import { Controller, Post, Body, Get, Param, ParseIntPipe, Sse, MessageEvent, Query } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AgentJobsService } from './agent-jobs.service';
import { CreateAgentJobDto } from './dto/create-agent-job.dto';
import { AgentJobEntity } from './entities/agent-job.entity';
import { Observable, Subject, map, filter } from 'rxjs';
import { JobArtifactAddedEvent, JobCreatedEvent, JobLogAddedEvent, JobStatusChangedEvent } from './events/agent-job-events';

type AgentJobEvent = JobCreatedEvent | JobStatusChangedEvent | JobLogAddedEvent | JobArtifactAddedEvent;

@Controller('agent-jobs')
export class AgentJobsController {
    private readonly updates$ = new Subject<{ type: string; payload: any; jobId: number }>();

    constructor(private readonly agentJobsService: AgentJobsService) { }

    @OnEvent('agent-job.created')
    handleJobCreated(event: JobCreatedEvent) {
        this.updates$.next({ type: 'job_created', payload: event.job, jobId: event.job.id });
    }

    @OnEvent('agent-job.status-changed')
    handleStatusChanged(event: JobStatusChangedEvent) {
        this.updates$.next({ type: 'status_changed', payload: { status: event.newStatus, job: event.job }, jobId: event.jobId });
    }

    @OnEvent('agent-job.log-added')
    handleLogAdded(event: JobLogAddedEvent) {
        this.updates$.next({ type: 'log_added', payload: event.log, jobId: event.jobId });
    }

    @OnEvent('agent-job.artifact-added')
    handleArtifactAdded(event: JobArtifactAddedEvent) {
        this.updates$.next({ type: 'artifact_added', payload: { artifactId: event.artifactId, filename: event.filename, path: event.path }, jobId: event.jobId });
    }

    @Post()
    createJob(@Body() dto: CreateAgentJobDto) {
        return this.agentJobsService.createJob(dto.prompt, dto.assignee);
    }

    @Get()
    getJobs(@Query('assignee') assignee?: string) {
        return this.agentJobsService.getJobs(assignee);
    }

    @Get(':id')
    getJob(@Param('id', ParseIntPipe) id: number) {
        return this.agentJobsService.getJob(id);
    }

    @Sse(':id/events')
    getJobEvents(@Param('id', ParseIntPipe) id: number): Observable<MessageEvent> {
        return this.updates$.asObservable().pipe(
            filter((event) => event.jobId === id),
            map((event) => ({ data: { type: event.type, payload: event.payload } } as MessageEvent))
        );
    }
}
