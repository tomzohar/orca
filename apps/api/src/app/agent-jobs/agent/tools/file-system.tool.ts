import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
import { execSync } from 'child_process';
import type { IArtifactStorage } from '../../domain/interfaces/artifact-storage.interface';

export const createFileSystemTool = (
    rootPath: string,
    jobId?: number,
    artifactStorage?: IArtifactStorage,
    onArtifactCreated?: (artifactId: number, path: string, filename: string) => void,
) => {
    const ensurePathIsSafe = (targetPath: string) => {
        const resolvedPath = path.resolve(rootPath, targetPath);
        if (!resolvedPath.startsWith(path.resolve(rootPath))) {
            throw new Error(`Access denied: Path ${targetPath} is outside the project root.`);
        }
        return resolvedPath;
    };

    const handleRead = async (targetPath?: string): Promise<string> => {
        if (!targetPath) return 'Error: path is required for read action.';
        const safePath = ensurePathIsSafe(targetPath);
        const fileContent = await fs.readFile(safePath, 'utf-8');
        return `File content of ${targetPath}:\n${fileContent}`;
    };

    const handleWrite = async (targetPath?: string, content?: string): Promise<string> => {
        if (!targetPath) return 'Error: path is required for write action.';
        if (content === undefined) {
            return 'Error: Content is required for write action.';
        }
        const safePath = ensurePathIsSafe(targetPath);
        // Ensure directory exists
        await fs.mkdir(path.dirname(safePath), { recursive: true });
        // Write to filesystem
        await fs.writeFile(safePath, content, 'utf-8');

        // Also save as artifact if storage is available
        if (artifactStorage && jobId !== undefined) {
            const filename = path.basename(targetPath);
            const artifact = await artifactStorage.store(jobId, filename, content);

            // Emit event if callback provided
            if (onArtifactCreated) {
                onArtifactCreated(artifact.id, artifact.path, filename);
            }

            return `Successfully wrote to ${targetPath} and saved as artifact.`;
        }

        return `Successfully wrote to ${targetPath}.`;
    };

    const handleList = async (targetPath?: string): Promise<string> => {
        if (!targetPath) return 'Error: path is required for list action.';
        const safePath = ensurePathIsSafe(targetPath);
        const files = await fs.readdir(safePath);
        return `Files in ${targetPath}:\n${files.join('\n')}`;
    };

    const handleFind = async (targetPath?: string): Promise<string> => {
        if (!targetPath) return 'Error: path is required for find action.';
        // Use glob pattern to find files recursively
        const matches = await glob(targetPath, {
            cwd: rootPath,
            nodir: true, // Only return files, not directories
            ignore: ['**/node_modules/**', '**/.git/**', '**/.nx/**', '**/dist/**'],
        });

        if (matches.length === 0) {
            return `No files found matching pattern: ${targetPath}`;
        }

        // Limit results to prevent overwhelming output
        const maxResults = 500;
        const limited = matches.slice(0, maxResults);
        const resultText = limited.join('\n');
        const suffix = matches.length > maxResults
            ? `\n\n... and ${matches.length - maxResults} more files (showing first ${maxResults})`
            : '';

        return `Found ${matches.length} file(s) matching "${targetPath}":\n${resultText}${suffix}`;
    };

    const handleReadMultiple = async (paths?: string[]): Promise<string> => {
        if (!paths || paths.length === 0) {
            return 'Error: paths array is required for read_multiple action.';
        }

        const results: string[] = [];
        const maxFiles = 20; // Limit to prevent token overflow
        const filesToRead = paths.slice(0, maxFiles);

        for (const filePath of filesToRead) {
            try {
                const safePath = ensurePathIsSafe(filePath);
                const content = await fs.readFile(safePath, 'utf-8');
                results.push(`\n=== ${filePath} ===\n${content}`);
            } catch (err) {
                results.push(`\n=== ${filePath} ===\nError: ${err.message}`);
            }
        }

        const suffix = paths.length > maxFiles
            ? `\n\n... ${paths.length - maxFiles} more files not shown (limit: ${maxFiles})`
            : '';

        return `Read ${filesToRead.length} file(s):${results.join('\n')}${suffix}`;
    };

    const handleTree = async (targetPath?: string, depth?: number): Promise<string> => {
        const maxDepth = depth ?? 3;
        const targetDir = targetPath ?? '.';
        const safePath = ensurePathIsSafe(targetDir);

        const buildTree = async (dir: string, currentDepth: number, prefix = ''): Promise<string[]> => {
            if (currentDepth > maxDepth) return [];

            const entries = await fs.readdir(dir, { withFileTypes: true });
            const lines: string[] = [];

            // Filter out ignored directories
            const filtered = entries.filter(entry =>
                !['node_modules', '.git', '.nx', 'dist', 'coverage'].includes(entry.name)
            );

            for (let i = 0; i < filtered.length; i++) {
                const entry = filtered[i];
                const isLast = i === filtered.length - 1;
                const connector = isLast ? '└── ' : '├── ';
                const newPrefix = prefix + (isLast ? '    ' : '│   ');

                lines.push(`${prefix}${connector}${entry.name}${entry.isDirectory() ? '/' : ''}`);

                if (entry.isDirectory() && currentDepth < maxDepth) {
                    const subDir = path.join(dir, entry.name);
                    const subLines = await buildTree(subDir, currentDepth + 1, newPrefix);
                    lines.push(...subLines);
                }
            }

            return lines;
        };

        const tree = await buildTree(safePath, 0);
        return `Directory tree for ${targetDir} (depth: ${maxDepth}):\n${targetDir}/\n${tree.join('\n')}`;
    };

    const handleGitDiff = async (staged?: boolean): Promise<string> => {
        try {
            const showStaged = staged ?? false;
            const diffCommand = showStaged
                ? 'git diff --cached --name-status'
                : 'git diff --name-status';

            const statusOutput = execSync(diffCommand, {
                cwd: rootPath,
                encoding: 'utf-8',
                maxBuffer: 1024 * 1024 * 5 // 5MB limit
            }).trim();

            if (!statusOutput) {
                return showStaged
                    ? 'No staged changes found.'
                    : 'No uncommitted changes found.';
            }

            // Get the actual diff content
            const diffContentCommand = showStaged ? 'git diff --cached' : 'git diff';
            const diffContent = execSync(diffContentCommand, {
                cwd: rootPath,
                encoding: 'utf-8',
                maxBuffer: 1024 * 1024 * 5 // 5MB limit
            }).trim();

            const changeType = showStaged ? 'Staged changes' : 'Uncommitted changes';
            return `${changeType}:\n\nFiles changed:\n${statusOutput}\n\nDiff:\n${diffContent}`;
        } catch (err) {
            if (err.message.includes('not a git repository')) {
                return 'Error: Not a git repository.';
            }
            return `Error getting git diff: ${err.message}`;
        }
    };

    const handleReadMatching = async (targetPath?: string): Promise<string> => {
        if (!targetPath) return 'Error: path (glob pattern) is required for read_matching action.';

        // Find matching files
        const matches = await glob(targetPath, {
            cwd: rootPath,
            nodir: true,
            ignore: ['**/node_modules/**', '**/.git/**', '**/.nx/**', '**/dist/**'],
        });

        if (matches.length === 0) {
            return `No files found matching pattern: ${targetPath}`;
        }

        // Limit to prevent token overflow
        const maxFiles = 15;
        const filesToRead = matches.slice(0, maxFiles);
        const results: string[] = [];

        for (const filePath of filesToRead) {
            try {
                const safePath = ensurePathIsSafe(filePath);
                const content = await fs.readFile(safePath, 'utf-8');
                results.push(`\n=== ${filePath} ===\n${content}`);
            } catch (err) {
                results.push(`\n=== ${filePath} ===\nError: ${err.message}`);
            }
        }

        const suffix = matches.length > maxFiles
            ? `\n\n... ${matches.length - maxFiles} more matching files not shown (limit: ${maxFiles})`
            : '';

        return `Found and read ${filesToRead.length} file(s) matching "${targetPath}":${results.join('\n')}${suffix}`;
    };

    return new DynamicStructuredTool({
        name: 'file_system',
        description: 'Read and write ACTUAL FILES in the project filesystem. Actions: read, write, list, find, read_multiple (read many files at once), tree (directory structure), git_diff (uncommitted changes), read_matching (read all files matching glob). Use bulk actions to reduce tool calls for review/exploration tasks.',
        schema: z.object({
            action: z.enum(['read', 'write', 'list', 'find', 'read_multiple', 'tree', 'git_diff', 'read_matching']),
            path: z.string().optional().describe('Relative path to file/directory, or glob pattern'),
            paths: z.array(z.string()).optional().describe('Array of paths for read_multiple action'),
            content: z.string().optional().describe('Content to write (required for write action)'),
            depth: z.number().optional().describe('Max depth for tree action (default: 3)'),
            staged: z.boolean().optional().describe('For git_diff: show staged changes (default: false)'),
        }),
        func: async ({ action, path: targetPath, paths, content, depth, staged }) => {
            try {
                switch (action) {
                    case 'read':
                        return await handleRead(targetPath);
                    case 'write':
                        return await handleWrite(targetPath, content);
                    case 'list':
                        return await handleList(targetPath);
                    case 'find':
                        return await handleFind(targetPath);
                    case 'read_multiple':
                        return await handleReadMultiple(paths);
                    case 'tree':
                        return await handleTree(targetPath, depth);
                    case 'git_diff':
                        return await handleGitDiff(staged);
                    case 'read_matching':
                        return await handleReadMatching(targetPath);
                    default:
                        return `Unknown action: ${action}`;
                }
            } catch (error) {
                return `Error executing ${action}: ${error.message}`;
            }
        },
    });
};
