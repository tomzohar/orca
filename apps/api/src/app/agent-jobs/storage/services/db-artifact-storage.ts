import { Inject, Injectable } from '@nestjs/common';
import type { IArtifactStorage, StoredArtifactReference } from '../../domain/interfaces/artifact-storage.interface';
import {
  AGENT_JOBS_REPOSITORY,
  type IAgentJobsRepository,
} from '../../domain/interfaces/agent-jobs.repository.interface';

@Injectable()
export class DbArtifactStorage implements IArtifactStorage {
  constructor(
    @Inject(AGENT_JOBS_REPOSITORY)
    private readonly repository: IAgentJobsRepository,
  ) {}

  async store(
    jobId: number,
    filename: string,
    content: string,
  ): Promise<StoredArtifactReference> {
    const job = await this.repository.addArtifact(jobId, { filename, content });

    // The artifact was just added and is the last one in the array.
    const artifact = job.artifacts[job.artifacts.length - 1];

    return {
      id: artifact.id,
      path: `db://${artifact.id}`,
    };
  }
}
