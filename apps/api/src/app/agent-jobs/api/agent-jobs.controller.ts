import {
  Body,
  Controller,
  Get,
  MessageEvent,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Sse,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Observable, Subject, filter, map } from 'rxjs';
import { AgentJobsService } from '../agent-jobs.service';
import { JobCommentsService } from '../application/job-comments.service';
import { AgentType } from '../domain/entities/agent-job.entity';
import {
  JobArtifactAddedEvent,
  JobCreatedEvent,
  JobLogAddedEvent,
  JobStatusChangedEvent,
  JobCommentAddedEvent,
} from '../domain/events/agent-job-events';
import { CreateAgentJobDto } from './dto/create-agent-job.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

type AgentJobEventPayload =
  | { type: 'job_created'; payload: any; jobId: number }
  | { type: 'status_changed'; payload: { status: string; job: any }; jobId: number }
  | { type: 'log_added'; payload: any; jobId: number }
  | { type: 'artifact_added'; payload: { artifactId: number; filename: string; path: string }; jobId: number }
  | { type: 'comment_added'; payload: any; jobId: number };

@Controller('agent-jobs')
export class AgentJobsController {
  private readonly updates$ = new Subject<AgentJobEventPayload>();

  constructor(
    private readonly agentJobsService: AgentJobsService,
    private readonly commentsService: JobCommentsService,
  ) { }

  @OnEvent('agent-job.created')
  handleJobCreated(event: JobCreatedEvent) {
    this.updates$.next({
      type: 'job_created',
      payload: event.job,
      jobId: event.job.id,
    });
  }

  @OnEvent('agent-job.status-changed')
  handleStatusChanged(event: JobStatusChangedEvent) {
    this.updates$.next({
      type: 'status_changed',
      payload: { status: event.newStatus, job: event.job },
      jobId: event.jobId,
    });
  }

  @OnEvent('agent-job.log-added')
  handleLogAdded(event: JobLogAddedEvent) {
    this.updates$.next({
      type: 'log_added',
      payload: event.log,
      jobId: event.jobId,
    });
  }

  @OnEvent('agent-job.artifact-added')
  handleArtifactAdded(event: JobArtifactAddedEvent) {
    this.updates$.next({
      type: 'artifact_added',
      payload: {
        artifactId: event.artifactId,
        filename: event.filename,
        path: event.path,
      },
      jobId: event.jobId,
    });
  }

  @OnEvent('agent-job.comment-added')
  handleCommentAdded(event: JobCommentAddedEvent) {
    this.updates$.next({
      type: 'comment_added',
      payload: event.comment,
      jobId: event.jobId,
    });
  }

  @Post()
  createJob(@Body() dto: CreateAgentJobDto) {
    // Map simplified string/enum from DTO to strictly typed AgentType if needed
    const type = dto.type ? AgentType[dto.type] : AgentType.FILE_SYSTEM;
    return this.agentJobsService.createJob(dto.prompt, dto.createdById, dto.assignedAgentId, type, dto.projectId);
  }

  @Get()
  getJobs(
    @Query('createdById', new ParseIntPipe({ optional: true })) createdById?: number,
    @Query('assignedAgentId', new ParseIntPipe({ optional: true })) assignedAgentId?: number,
    @Query('projectId', new ParseIntPipe({ optional: true })) projectId?: number
  ) {
    return this.agentJobsService.getJobs(createdById, assignedAgentId, projectId);
  }

  @Get(':id')
  getJob(@Param('id', ParseIntPipe) id: number) {
    return this.agentJobsService.getJob(id);
  }

  @Sse(':id/events')
  getJobEvents(
    @Param('id', ParseIntPipe) id: number,
  ): Observable<MessageEvent> {
    return this.updates$.asObservable().pipe(
      filter((event) => event.jobId === id),
      map(
        (event) =>
          ({
            data: { type: event.type, payload: event.payload },
          }) as MessageEvent,
      ),
    );
  }

  @Post(':id/comments')
  addComment(
    @Param('id', ParseIntPipe) jobId: number,
    @Body() dto: CreateCommentDto,
    @Query('authorId', ParseIntPipe) authorId: number,
  ) {
    return this.commentsService.addComment(jobId, authorId, dto.content, dto.metadata);
  }

  @Get(':id/comments')
  getComments(@Param('id', ParseIntPipe) jobId: number) {
    return this.commentsService.getComments(jobId);
  }
}
