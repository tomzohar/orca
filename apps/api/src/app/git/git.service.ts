import { Injectable, Logger } from '@nestjs/common';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface ConflictReport {
  hasConflicts: boolean;
  overlappingFiles: Array<{ file: string; jobIds: number[] }>;
}

@Injectable()
export class GitService {
  private readonly logger = new Logger(GitService.name);
  private readonly maxBuffer = 10 * 1024 * 1024; // 10MB

  /**
   * Get the diff between two branches
   * @param projectRoot - Absolute path to the git repository
   * @param branch - The branch to compare
   * @param base - The base branch to compare against (default: 'main')
   * @returns The git diff output
   */
  async getDiff(
    projectRoot: string,
    branch: string,
    base = 'main'
  ): Promise<string> {
    this.validateBranchName(branch);
    this.validateBranchName(base);

    try {
      const { stdout } = await execFileAsync(
        'git',
        ['diff', `${base}...${branch}`],
        {
          cwd: projectRoot,
          maxBuffer: this.maxBuffer,
        }
      );

      return stdout;
    } catch (error) {
      this.logger.error(
        `Failed to get diff for branch ${branch} against ${base}: ${error.message}`
      );
      throw new Error(
        `Failed to get diff: ${error.message.includes('bad revision') ? 'Branch not found' : 'Git error'}`
      );
    }
  }

  /**
   * Get the list of files changed in a branch compared to base
   * @param projectRoot - Absolute path to the git repository
   * @param branch - The branch to check
   * @param base - The base branch to compare against (default: 'main')
   * @returns Array of changed file paths
   */
  async getChangedFiles(
    projectRoot: string,
    branch: string,
    base = 'main'
  ): Promise<string[]> {
    this.validateBranchName(branch);
    this.validateBranchName(base);

    try {
      const { stdout } = await execFileAsync(
        'git',
        ['diff', '--name-only', `${base}...${branch}`],
        {
          cwd: projectRoot,
          maxBuffer: this.maxBuffer,
        }
      );

      return stdout
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    } catch (error) {
      this.logger.error(
        `Failed to get changed files for branch ${branch}: ${error.message}`
      );
      throw new Error('Failed to get changed files');
    }
  }

  /**
   * Detect potential conflicts between multiple jobs by checking for overlapping file changes
   * @param projectRoot - Absolute path to the git repository
   * @param jobIds - Array of job IDs to check for conflicts
   * @returns ConflictReport with overlapping files
   */
  async detectConflicts(
    projectRoot: string,
    jobIds: number[]
  ): Promise<ConflictReport> {
    // Early return for edge cases
    if (jobIds.length === 0 || jobIds.length === 1) {
      return {
        hasConflicts: false,
        overlappingFiles: [],
      };
    }

    // Map of file -> jobIds that modified it
    const changedFiles = new Map<string, number[]>();

    // Get changed files for each job
    for (const jobId of jobIds) {
      const branchName = `agent-job-${jobId}`;

      try {
        const files = await this.getChangedFiles(projectRoot, branchName, 'main');

        for (const file of files) {
          if (!changedFiles.has(file)) {
            changedFiles.set(file, []);
          }
          changedFiles.get(file)!.push(jobId);
        }
      } catch (error) {
        this.logger.warn(
          `Could not get changed files for job ${jobId}: ${error.message}`
        );
        // Continue checking other jobs even if one fails
        continue;
      }
    }

    // Find overlapping files (modified by more than one job)
    const overlappingFiles: Array<{ file: string; jobIds: number[] }> = [];

    for (const [file, jobs] of changedFiles.entries()) {
      if (jobs.length > 1) {
        overlappingFiles.push({ file, jobIds: jobs });
      }
    }

    return {
      hasConflicts: overlappingFiles.length > 0,
      overlappingFiles,
    };
  }

  /**
   * Validate branch name to prevent command injection
   * @param branchName - The branch name to validate
   * @throws Error if branch name contains invalid characters
   */
  private validateBranchName(branchName: string): void {
    // Allow alphanumeric, hyphens, underscores, slashes, and dots
    // This covers standard git branch naming conventions
    const validBranchPattern = /^[a-zA-Z0-9/_.-]+$/;

    if (!validBranchPattern.test(branchName)) {
      throw new Error(
        'Invalid branch name: only alphanumeric characters, hyphens, underscores, slashes, and dots are allowed'
      );
    }

    // Additional security: reject paths that try to escape
    if (branchName.includes('..') || branchName.includes(';') || branchName.includes('&')) {
      throw new Error('Invalid branch name: contains forbidden characters');
    }
  }
}
