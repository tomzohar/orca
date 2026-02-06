import { AgentJobEntity, AgentJobStatus } from '../entities/agent-job.entity';
import { AgentJobLog } from '../../../../prisma/client';

export class JobCreatedEvent {
    constructor(public readonly job: AgentJobEntity) { }
}

export class JobStatusChangedEvent {
    constructor(
        public readonly jobId: number,
        public readonly newStatus: AgentJobStatus,
        public readonly job: AgentJobEntity
    ) { }
}

export class JobLogAddedEvent {
    constructor(
        public readonly jobId: number,
        public readonly log: AgentJobLog
    ) { }
}

export class JobArtifactAddedEvent {
    constructor(
        public readonly jobId: number,
        public readonly artifactId: number,
        public readonly filename: string,
        public readonly path: string
    ) { }
}
