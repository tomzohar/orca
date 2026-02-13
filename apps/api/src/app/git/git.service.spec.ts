import { Test, TestingModule } from '@nestjs/testing';
import { GitService } from './git.service';

// Mock child_process
jest.mock('child_process');

// Create a mocks container that can be accessed from jest.mock()
// Use var for proper hoisting with jest.mock
// eslint-disable-next-line no-var
var mocks: { execFileAsync: jest.Mock };

// Mock util.promisify at module level
jest.mock('util', () => {
  const actualUtil = jest.requireActual('util');
  // Initialize mock inside the factory to avoid hoisting issues
  const mockFn = jest.fn();
  // Assign to hoisted variable
  mocks = { execFileAsync: mockFn };
  return {
    ...actualUtil,
    promisify: jest.fn(() => mockFn),
  };
});

describe('GitService', () => {
  let service: GitService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [GitService],
    }).compile();

    service = module.get<GitService>(GitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDiff', () => {
    it('should return diff between branch and base', async () => {
      const mockDiff = `diff --git a/file.ts b/file.ts
index 123..456 100644
--- a/file.ts
+++ b/file.ts
@@ -1,3 +1,4 @@
+new line
 existing line`;

      mocks.execFileAsync.mockResolvedValue({ stdout: mockDiff, stderr: '' });

      const result = await service.getDiff('/test/project', 'feature-branch', 'main');

      expect(result).toBe(mockDiff);
      expect(mocks.execFileAsync).toHaveBeenCalledWith(
        'git',
        ['diff', 'main...feature-branch'],
        { cwd: '/test/project', maxBuffer: 10 * 1024 * 1024 }
      );
    });

    it('should use main as default base branch', async () => {
      mocks.execFileAsync.mockResolvedValue({ stdout: 'diff output', stderr: '' });

      await service.getDiff('/test/project', 'feature-branch');

      expect(mocks.execFileAsync).toHaveBeenCalledWith(
        'git',
        ['diff', 'main...feature-branch'],
        { cwd: '/test/project', maxBuffer: 10 * 1024 * 1024 }
      );
    });

    it('should throw error when git command fails', async () => {
      mocks.execFileAsync.mockRejectedValue(new Error('fatal: bad revision'));

      await expect(
        service.getDiff('/test/project', 'non-existent-branch')
      ).rejects.toThrow('Failed to get diff');
    });

    it('should reject invalid branch names', async () => {
      await expect(
        service.getDiff('/test/project', 'branch; rm -rf /')
      ).rejects.toThrow('Invalid branch name');
    });
  });

  describe('getChangedFiles', () => {
    it('should return list of changed files', async () => {
      const mockOutput = 'src/file1.ts\nsrc/file2.ts\nREADME.md';

      mocks.execFileAsync.mockResolvedValue({ stdout: mockOutput, stderr: '' });

      const result = await service.getChangedFiles('/test/project', 'feature-branch', 'main');

      expect(result).toEqual(['src/file1.ts', 'src/file2.ts', 'README.md']);
      expect(mocks.execFileAsync).toHaveBeenCalledWith(
        'git',
        ['diff', '--name-only', 'main...feature-branch'],
        { cwd: '/test/project', maxBuffer: 10 * 1024 * 1024 }
      );
    });

    it('should return empty array when no files changed', async () => {
      mocks.execFileAsync.mockResolvedValue({ stdout: '', stderr: '' });

      const result = await service.getChangedFiles('/test/project', 'feature-branch', 'main');

      expect(result).toEqual([]);
    });

    it('should handle git errors gracefully', async () => {
      mocks.execFileAsync.mockRejectedValue(new Error('fatal: ambiguous argument'));

      await expect(
        service.getChangedFiles('/test/project', 'bad-branch', 'main')
      ).rejects.toThrow('Failed to get changed files');
    });
  });

  describe('detectConflicts', () => {
    it('should detect no conflicts when jobs modify different files', async () => {
      // Mock for job 101
      mocks.execFileAsync
        .mockResolvedValueOnce({ stdout: 'src/file1.ts\nsrc/file2.ts', stderr: '' })
        // Mock for job 102
        .mockResolvedValueOnce({ stdout: 'src/file3.ts\nsrc/file4.ts', stderr: '' });

      const result = await service.detectConflicts('/test/project', [101, 102]);

      expect(result.hasConflicts).toBe(false);
      expect(result.overlappingFiles).toEqual([]);
    });

    it('should detect conflicts when jobs modify same files', async () => {
      // Mock for job 101
      mocks.execFileAsync
        .mockResolvedValueOnce({ stdout: 'src/shared.ts\nsrc/file1.ts', stderr: '' })
        // Mock for job 102
        .mockResolvedValueOnce({ stdout: 'src/shared.ts\nsrc/file2.ts', stderr: '' });

      const result = await service.detectConflicts('/test/project', [101, 102]);

      expect(result.hasConflicts).toBe(true);
      expect(result.overlappingFiles).toEqual([
        { file: 'src/shared.ts', jobIds: [101, 102] },
      ]);
    });

    it('should handle multiple overlapping files', async () => {
      // Mock for job 101
      mocks.execFileAsync
        .mockResolvedValueOnce({ stdout: 'src/fileA.ts\nsrc/fileB.ts', stderr: '' })
        // Mock for job 102
        .mockResolvedValueOnce({ stdout: 'src/fileA.ts\nsrc/fileC.ts', stderr: '' })
        // Mock for job 103
        .mockResolvedValueOnce({ stdout: 'src/fileB.ts\nsrc/fileC.ts', stderr: '' });

      const result = await service.detectConflicts('/test/project', [101, 102, 103]);

      expect(result.hasConflicts).toBe(true);
      expect(result.overlappingFiles).toHaveLength(3);
      expect(result.overlappingFiles).toContainEqual({
        file: 'src/fileA.ts',
        jobIds: [101, 102],
      });
      expect(result.overlappingFiles).toContainEqual({
        file: 'src/fileB.ts',
        jobIds: [101, 103],
      });
      expect(result.overlappingFiles).toContainEqual({
        file: 'src/fileC.ts',
        jobIds: [102, 103],
      });
    });

    it('should return no conflicts for empty job list', async () => {
      const result = await service.detectConflicts('/test/project', []);

      expect(result.hasConflicts).toBe(false);
      expect(result.overlappingFiles).toEqual([]);
      expect(mocks.execFileAsync).not.toHaveBeenCalled();
    });

    it('should return no conflicts for single job', async () => {
      mocks.execFileAsync.mockResolvedValueOnce({ stdout: 'src/file1.ts\nsrc/file2.ts', stderr: '' });

      const result = await service.detectConflicts('/test/project', [101]);

      expect(result.hasConflicts).toBe(false);
      expect(result.overlappingFiles).toEqual([]);
    });
  });

  describe('validateBranchName', () => {
    it('should accept valid branch names', () => {
      const validNames = [
        'feature-branch',
        'agent-job-123',
        'fix/bug-456',
        'release-1.0.0',
        'main',
        'develop',
      ];

      validNames.forEach((name) => {
        expect(() => service['validateBranchName'](name)).not.toThrow();
      });
    });

    it('should reject invalid branch names', () => {
      const invalidNames = [
        'branch; rm -rf /',
        'branch && cat /etc/passwd',
        'branch | echo hack',
        'branch`rm -rf /`',
        'branch$(rm -rf /)',
        '../../../etc/passwd',
      ];

      invalidNames.forEach((name) => {
        expect(() => service['validateBranchName'](name)).toThrow('Invalid branch name');
      });
    });
  });
});
