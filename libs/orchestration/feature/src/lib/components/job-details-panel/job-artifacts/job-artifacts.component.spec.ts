import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { JobArtifactsComponent } from './job-artifacts.component';
import { JobUIModel, JobStatus } from '@orca/orchestration-types';

describe('JobArtifactsComponent', () => {
    let component: JobArtifactsComponent;
    let fixture: ComponentFixture<JobArtifactsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [JobArtifactsComponent, NoopAnimationsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(JobArtifactsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Empty States', () => {
        it('should show loading state when job is running with no artifacts', () => {
            const mockJob: JobUIModel = {
                id: '1',
                prompt: 'Test',
                status: JobStatus.RUNNING,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                formattedCreatedAt: 'Just now',
                logs: [],
                artifacts: [],
            };

            fixture.componentRef.setInput('job', mockJob);
            fixture.detectChanges();

            const emptyState = fixture.nativeElement.querySelector('.empty-state');
            expect(emptyState).toBeTruthy();
            expect(emptyState.textContent).toContain('Waiting for artifacts');

            const spinner = fixture.nativeElement.querySelector('orca-spinner');
            expect(spinner).toBeTruthy();
        });

        it('should show empty state when job is completed with no artifacts', () => {
            const mockJob: JobUIModel = {
                id: '1',
                prompt: 'Test',
                status: JobStatus.COMPLETED,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                formattedCreatedAt: 'Just now',
                logs: [],
                artifacts: [],
            };

            fixture.componentRef.setInput('job', mockJob);
            fixture.detectChanges();

            const emptyState = fixture.nativeElement.querySelector('.empty-state');
            expect(emptyState).toBeTruthy();
            expect(emptyState.textContent).toContain('No artifacts yet');

            const spinner = fixture.nativeElement.querySelector('orca-spinner');
            expect(spinner).toBeFalsy();
        });
    });

    describe('Artifacts List', () => {
        it('should render list component when artifacts exist', () => {
            const mockJob: JobUIModel = {
                id: '1',
                prompt: 'Test',
                status: JobStatus.COMPLETED,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                formattedCreatedAt: 'Just now',
                logs: [],
                artifacts: [
                    {
                        id: 1,
                        filename: 'test.ts',
                        content: 'const x = 1;',
                        createdAt: new Date().toISOString(),
                    },
                ],
            };

            fixture.componentRef.setInput('job', mockJob);
            fixture.detectChanges();

            const list = fixture.nativeElement.querySelector('orca-list');
            expect(list).toBeTruthy();
        });

        it('should configure list as expandable with icons', () => {
            const mockJob: JobUIModel = {
                id: '1',
                prompt: 'Test',
                status: JobStatus.COMPLETED,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                formattedCreatedAt: 'Just now',
                logs: [],
                artifacts: [
                    {
                        id: 1,
                        filename: 'test.ts',
                        content: 'const x = 1;',
                        createdAt: new Date().toISOString(),
                    },
                ],
            };

            fixture.componentRef.setInput('job', mockJob);
            fixture.detectChanges();

            const config = component.artifactsListConfig();
            expect(config.expandable).toBe(true);
            expect(config.showIcons).toBe(true);
            expect(config.multipleExpanded).toBe(false);
        });

        it('should map artifacts to list items with correct data', () => {
            const mockArtifacts = [
                {
                    id: 1,
                    filename: 'component.ts',
                    content: 'export class Test {}',
                    createdAt: '2024-01-01T12:00:00Z',
                },
                {
                    id: 2,
                    filename: 'styles.css',
                    content: '.class { color: red; }',
                    createdAt: '2024-01-01T12:01:00Z',
                },
            ];

            const mockJob: JobUIModel = {
                id: '1',
                prompt: 'Test',
                status: JobStatus.COMPLETED,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                formattedCreatedAt: 'Just now',
                logs: [],
                artifacts: mockArtifacts,
            };

            fixture.componentRef.setInput('job', mockJob);
            fixture.detectChanges();

            const config = component.artifactsListConfig();
            expect(config.items.length).toBe(2);

            const firstItem = config.items[0];
            expect(firstItem.id).toBe('1');
            expect(firstItem.title).toBe('component.ts');
            expect(firstItem.description).toBeTruthy();
            expect(firstItem.content).toContain('export class Test {}');
        });
    });

    describe('File Icon Determination', () => {
        it('should return javascript icon for TypeScript files', () => {
            const icon = component.getFileIcon('test.ts');
            expect(icon).toBe('javascript');
        });

        it('should return javascript icon for JavaScript files', () => {
            const icon = component.getFileIcon('test.js');
            expect(icon).toBe('javascript');
        });

        it('should return javascript icon for JSX files', () => {
            const icon = component.getFileIcon('component.jsx');
            expect(icon).toBe('javascript');
        });

        it('should return javascript icon for TSX files', () => {
            const icon = component.getFileIcon('component.tsx');
            expect(icon).toBe('javascript');
        });

        it('should return html icon for HTML files', () => {
            const icon = component.getFileIcon('index.html');
            expect(icon).toBe('html');
        });

        it('should return css icon for CSS files', () => {
            const icon = component.getFileIcon('styles.css');
            expect(icon).toBe('css');
        });

        it('should return css icon for SCSS files', () => {
            const icon = component.getFileIcon('styles.scss');
            expect(icon).toBe('css');
        });

        it('should return article icon for JSON files', () => {
            const icon = component.getFileIcon('package.json');
            expect(icon).toBe('article');
        });

        it('should return article icon for files with no extension', () => {
            const icon = component.getFileIcon('README');
            expect(icon).toBe('article');
        });

        it('should return article icon for unknown extensions', () => {
            const icon = component.getFileIcon('file.unknown');
            expect(icon).toBe('article');
        });
    });

    describe('Content Rendering', () => {
        it('should wrap artifact content in pre/code tags within list item', () => {
            const mockJob: JobUIModel = {
                id: '1',
                prompt: 'Test',
                status: JobStatus.COMPLETED,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                formattedCreatedAt: 'Just now',
                logs: [],
                artifacts: [
                    {
                        id: 1,
                        filename: 'test.ts',
                        content: 'const test = "hello";',
                        createdAt: new Date().toISOString(),
                    },
                ],
            };

            fixture.componentRef.setInput('job', mockJob);
            fixture.detectChanges();

            const config = component.artifactsListConfig();
            const contentHtml = config.items[0].content;

            expect(contentHtml).toContain('<pre>');
            expect(contentHtml).toContain('<code>');
            expect(contentHtml).toContain('const test = "hello";');
        });
    });
});
