import { createSaveArtifactTool } from './save-artifact.tool';
import { type IArtifactStorage } from '../../domain/interfaces/artifact-storage.interface';

describe('createSaveArtifactTool', () => {
  let mockArtifactStorage: jest.Mocked<IArtifactStorage>;
  let mockEventCallback: jest.Mock;
  const jobId = 123;

  beforeEach(() => {
    mockArtifactStorage = {
      store: jest.fn(),
    } as any;
    mockEventCallback = jest.fn();
  });

  it('should be defined', () => {
    const tool = createSaveArtifactTool(
      jobId,
      mockArtifactStorage,
      mockEventCallback,
    );
    expect(tool).toBeDefined();
    expect(tool.name).toBe('save_artifact');
  });

  it('should save artifact and call event callback', async () => {
    const filename = 'test.ts';
    const content = 'console.log("hello");';
    const expectedPath = '/path/to/test.ts';

    mockArtifactStorage.store.mockResolvedValue(expectedPath);

    const tool = createSaveArtifactTool(
      jobId,
      mockArtifactStorage,
      mockEventCallback,
    );
    const result = await tool.func({ filename, content });

    expect(mockArtifactStorage.store).toHaveBeenCalledWith(
      jobId,
      filename,
      content,
    );
    expect(mockEventCallback).toHaveBeenCalledWith(expectedPath, filename);
    expect(result).toBe(`Artifact saved to ${expectedPath}`);
  });
});
