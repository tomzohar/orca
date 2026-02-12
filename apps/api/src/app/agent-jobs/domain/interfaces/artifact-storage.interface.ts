export const ARTIFACT_STORAGE = 'ARTIFACT_STORAGE';

export interface StoredArtifactReference {
  id: number;
  path: string;
}

export interface IArtifactStorage {
  /**
   * Stores an artifact and returns a reference with ID and path.
   */
  store(jobId: number, filename: string, content: string): Promise<StoredArtifactReference>;
}
