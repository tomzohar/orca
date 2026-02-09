import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

export const createFileSystemTool = (rootPath: string) => {
    const ensurePathIsSafe = (targetPath: string) => {
        const resolvedPath = path.resolve(rootPath, targetPath);
        if (!resolvedPath.startsWith(path.resolve(rootPath))) {
            throw new Error(`Access denied: Path ${targetPath} is outside the project root.`);
        }
        return resolvedPath;
    };

    return new DynamicStructuredTool({
        name: 'file_system',
        description: 'Read and write files within the project. Allowed actions: read, write, list.',
        schema: z.object({
            action: z.enum(['read', 'write', 'list']),
            path: z.string().describe('Relative path to the file or directory'),
            content: z.string().optional().describe('Content to write (required for write action)'),
        }),
        func: async ({ action, path: targetPath, content }) => {
            try {
                const safePath = ensurePathIsSafe(targetPath);

                switch (action) {
                    case 'read': {
                        const fileContent = await fs.readFile(safePath, 'utf-8');
                        return `File content of ${targetPath}:\n${fileContent}`;
                    }
                    case 'write': {
                        if (content === undefined) {
                            return 'Error: Content is required for write action.';
                        }
                        // Ensure directory exists
                        await fs.mkdir(path.dirname(safePath), { recursive: true });
                        await fs.writeFile(safePath, content, 'utf-8');
                        return `Successfully wrote to ${targetPath}.`;
                    }
                    case 'list': {
                        const files = await fs.readdir(safePath);
                        return `Files in ${targetPath}:\n${files.join('\n')}`;
                    }
                    default:
                        return `Unknown action: ${action}`;
                }
            } catch (error) {
                return `Error executing ${action} on ${targetPath}: ${error.message}`;
            }
        },
    });
};
