import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { IArtifactStorage } from '../../domain/interfaces/artifact-storage.interface';

export const createSaveArtifactTool = (
    jobId: number,
    artifactStorage: IArtifactStorage,
    eventCallback: (path: string, filename: string) => void
) => {
    return new DynamicStructuredTool({
        name: 'save_artifact',
        description: 'Save a code file or artifact to the storage. Use this when you have generated code that needs to be persisted.',
        schema: z.object({
            filename: z.string().describe('The name of the file, e.g., main.ts'),
            content: z.string().describe('The content of the file'),
        }),
        func: async ({ filename, content }) => {
            const path = await artifactStorage.store(jobId, filename, content);
            eventCallback(path, filename);
            return `Artifact saved to ${path}`;
        },
    });
};
