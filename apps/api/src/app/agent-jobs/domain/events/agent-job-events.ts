import {
  AgentJobEntity,
  AgentJobStatus,
  AgentJobLog,
  AgentJobComment,
} from '../entities/agent-job.entity';

export class JobCreatedEvent {
  constructor(public readonly job: AgentJobEntity) {}
}

export class JobStatusChangedEvent {
  constructor(
    public readonly jobId: number,
    public readonly newStatus: AgentJobStatus,
    public readonly job: AgentJobEntity,
  ) {}
}

export class JobLogAddedEvent {
  constructor(
    public readonly jobId: number,
    public readonly log: AgentJobLog & { jobId: number },
  ) {}
}

export class JobArtifactAddedEvent {
  constructor(
    public readonly jobId: number,
    public readonly artifactId: number,
    public readonly filename: string,
    public readonly path: string,
  ) {}
}

export class JobCommentAddedEvent {
  constructor(
    public readonly jobId: number,
    public readonly comment: AgentJobComment,
  ) {}
}
