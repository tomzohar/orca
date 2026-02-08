import { Inject, Injectable } from '@nestjs/common';
import type { IArtifactStorage } from '../../domain/interfaces/artifact-storage.interface';
import { AGENT_JOBS_REPOSITORY, type IAgentJobsRepository } from '../../domain/interfaces/agent-jobs.repository.interface';

@Injectable()
export class DbArtifactStorage implements IArtifactStorage {
    constructor(
        @Inject(AGENT_JOBS_REPOSITORY)
        private readonly repository: IAgentJobsRepository,
    ) { }

    async store(jobId: number, filename: string, content: string): Promise<string> {
        const job = await this.repository.addArtifact(jobId, { filename, content });

        // We assume the artifact was just added and is the last one.
        const artifact = job.artifacts[job.artifacts.length - 1];

        return `db://${artifact.id}`;
    }
}
