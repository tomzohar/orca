export const ARTIFACT_STORAGE = 'ARTIFACT_STORAGE';

export interface IArtifactStorage {
    /**
     * Stores an artifact and returns a reference (path or URL).
     */
    store(jobId: number, filename: string, content: string): Promise<string>;
}
