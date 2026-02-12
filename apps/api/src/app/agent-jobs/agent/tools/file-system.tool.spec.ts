import { createFileSystemTool } from './file-system.tool';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('fileSystemTool', () => {
    let rootPath: string;

    beforeEach(async () => {
        rootPath = await fs.mkdtemp(path.join(os.tmpdir(), 'orca-test-'));
    });

    afterEach(async () => {
        await fs.rm(rootPath, { recursive: true, force: true });
    });

    it('should read a file', async () => {
        const filePath = 'test.txt';
        const content = 'hello world';
        await fs.writeFile(path.join(rootPath, filePath), content);

        const tool = createFileSystemTool(rootPath);
        const result = await tool.func({ action: 'read', path: filePath }, {} as any);

        expect(result).toContain(content);
    });

    it('should write a file', async () => {
        const filePath = 'new-file.txt';
        const content = 'new content';

        const tool = createFileSystemTool(rootPath);
        await tool.func({ action: 'write', path: filePath, content }, {} as any);

        const savedContent = await fs.readFile(path.join(rootPath, filePath), 'utf-8');
        expect(savedContent).toBe(content);
    });

    it('should list files', async () => {
        await fs.writeFile(path.join(rootPath, 'file1.txt'), '1');
        await fs.writeFile(path.join(rootPath, 'file2.txt'), '2');

        const tool = createFileSystemTool(rootPath);
        const result = await tool.func({ action: 'list', path: '.' }, {} as any);

        expect(result).toContain('file1.txt');
        expect(result).toContain('file2.txt');
    });

    it('should find files using glob', async () => {
        await fs.mkdir(path.join(rootPath, 'src'), { recursive: true });
        await fs.writeFile(path.join(rootPath, 'src/app.ts'), 'app');
        await fs.writeFile(path.join(rootPath, 'readme.md'), 'readme');

        const tool = createFileSystemTool(rootPath);
        const result = await tool.func({ action: 'find', path: '**/*.ts' }, {} as any);

        expect(result).toContain('src/app.ts');
        expect(result).not.toContain('readme.md');
    });

    it('should read multiple files', async () => {
        await fs.writeFile(path.join(rootPath, 'a.txt'), 'aaa');
        await fs.writeFile(path.join(rootPath, 'b.txt'), 'bbb');

        const tool = createFileSystemTool(rootPath);
        const result = await tool.func({ action: 'read_multiple', paths: ['a.txt', 'b.txt'] }, {} as any);

        expect(result).toContain('aaa');
        expect(result).toContain('bbb');
        expect(result).toContain('=== a.txt ===');
        expect(result).toContain('=== b.txt ===');
    });

    it('should show directory tree', async () => {
        await fs.mkdir(path.join(rootPath, 'dir1/subdir'), { recursive: true });
        await fs.writeFile(path.join(rootPath, 'dir1/f1.txt'), '1');

        const tool = createFileSystemTool(rootPath);
        const result = await tool.func({ action: 'tree', path: '.', depth: 2 }, {} as any);

        expect(result).toContain('dir1/');
        expect(result).toContain('subdir/');
        expect(result).toContain('f1.txt');
    });

    it('should read matching files', async () => {
        await fs.writeFile(path.join(rootPath, 'abc.txt'), 'abc content');
        await fs.writeFile(path.join(rootPath, 'xyz.txt'), 'xyz content');

        const tool = createFileSystemTool(rootPath);
        const result = await tool.func({ action: 'read_matching', path: '*.txt' }, {} as any);

        expect(result).toContain('abc content');
        expect(result).toContain('xyz content');
    });

    it('should prevent access outside root', async () => {
        const tool = createFileSystemTool(rootPath);
        const result = await tool.func({ action: 'read', path: '../../etc/passwd' }, {} as any);

        expect(result).toContain('Error executing read: Access denied');
    });
});
