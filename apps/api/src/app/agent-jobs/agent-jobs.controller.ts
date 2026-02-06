import { Controller, Post, Body, Get, Param, ParseIntPipe, Sse, MessageEvent, Query } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AgentJobsService } from './agent-jobs.service';
import { CreateAgentJobDto } from './dto/create-agent-job.dto';
import { AgentJobEntity } from './entities/agent-job.entity';
import { Observable, Subject, map, filter } from 'rxjs';

@Controller('agent-jobs')
export class AgentJobsController {
    private readonly updates$ = new Subject<AgentJobEntity>();

    constructor(private readonly agentJobsService: AgentJobsService) { }

    @OnEvent('agent-job.created')
    handleJobCreated(job: AgentJobEntity) {
        this.updates$.next(job);
    }

    @OnEvent('agent-job.updated')
    handleJobUpdated(job: AgentJobEntity) {
        this.updates$.next(job);
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
            filter((job) => job.id === id),
            map((job) => ({ data: job } as MessageEvent))
        );
    }
}
