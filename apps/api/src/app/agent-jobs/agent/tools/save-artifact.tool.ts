import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { IArtifactStorage } from '../../domain/interfaces/artifact-storage.interface';

export const createSaveArtifactTool = (
  jobId: number,
  artifactStorage: IArtifactStorage,
  eventCallback: (artifactId: number, path: string, filename: string) => void,
) => {
  return new DynamicStructuredTool({
    name: 'save_artifact',
    description:
      'Save a code snippet or artifact to the DATABASE for viewing in the UI. This does NOT create actual files in the project. To write actual files to the project filesystem, use the file_system tool with write action instead.',
    schema: z.object({
      filename: z.string().describe('The name of the file, e.g., main.ts'),
      content: z.string().describe('The content of the file'),
    }),
    func: async ({ filename, content }) => {
      const artifact = await artifactStorage.store(jobId, filename, content);
      eventCallback(artifact.id, artifact.path, filename);
      return `Artifact saved to ${artifact.path}`;
    },
  });
};
