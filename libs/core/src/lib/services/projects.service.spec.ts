import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProjectsService } from './projects.service';
import { ProjectDetectionResult } from '../types/projects.types';

describe('ProjectsService', () => {
    let service: ProjectsService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ProjectsService]
        });
        service = TestBed.inject(ProjectsService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('detectProject', () => {
        it('should call /api/projects/detect endpoint', async () => {
            const mockResult: ProjectDetectionResult = {
                project: {
                    id: 1,
                    name: 'Test Project',
                    slug: 'test-project',
                    rootPath: '/test/path',
                    description: 'Test description',
                    includes: ['**/*'],
                    excludes: ['**/node_modules/**'],
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                workingDirectory: {
                    path: '/test/path',
                    projectType: 'typescript'
                }
            };

            const detectPromise = service.detectProject();

            const req = httpMock.expectOne('/api/projects/detect');
            expect(req.request.method).toBe('GET');
            req.flush(mockResult);

            const result = await detectPromise;
            expect(result).toEqual(mockResult);
        });

        it('should handle successful response with project', async () => {
            const mockResult: ProjectDetectionResult = {
                project: {
                    id: 1,
                    name: 'Test Project',
                    slug: 'test-project',
                    rootPath: '/test/path',
                    description: null,
                    includes: ['**/*'],
                    excludes: ['**/node_modules/**'],
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                workingDirectory: {
                    path: '/test/path',
                    projectType: 'typescript'
                }
            };

            const detectPromise = service.detectProject();
            const req = httpMock.expectOne('/api/projects/detect');
            req.flush(mockResult);

            const result = await detectPromise;
            expect(result.project).toBeTruthy();
            expect(result.project?.id).toBe(1);
            expect(result.workingDirectory.projectType).toBe('typescript');
        });

        it('should handle successful response without project (null)', async () => {
            const mockResult: ProjectDetectionResult = {
                project: null,
                workingDirectory: {
                    path: '/test/path',
                    projectType: 'unknown'
                }
            };

            const detectPromise = service.detectProject();
            const req = httpMock.expectOne('/api/projects/detect');
            req.flush(mockResult);

            const result = await detectPromise;
            expect(result.project).toBeNull();
            expect(result.workingDirectory.path).toBe('/test/path');
        });

        it('should handle HTTP errors gracefully', async () => {
            const detectPromise = service.detectProject();

            const req = httpMock.expectOne('/api/projects/detect');
            req.error(new ProgressEvent('error'), { status: 500, statusText: 'Internal Server Error' });

            await expect(detectPromise).rejects.toBeDefined();
        });

        it('should transform backend DTOs correctly', async () => {
            const mockBackendResponse = {
                project: {
                    id: 1,
                    name: 'Test Project',
                    slug: 'test-project',
                    rootPath: '/test/path',
                    description: 'Test',
                    includes: ['**/*'],
                    excludes: ['**/node_modules/**'],
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z'
                },
                workingDirectory: {
                    path: '/test/path',
                    projectType: 'typescript'
                }
            };

            const detectPromise = service.detectProject();
            const req = httpMock.expectOne('/api/projects/detect');
            req.flush(mockBackendResponse);

            const result = await detectPromise;
            expect(result.project).toBeTruthy();
            expect(result.workingDirectory).toBeTruthy();
        });
    });

    describe('createProject', () => {
        it('should call POST /api/projects endpoint', async () => {
            const mockRequest = {
                name: 'New Project',
                rootPath: '/new/path',
                description: 'Test description',
                includes: ['**/*'],
                excludes: ['**/node_modules/**']
            };

            const mockProject = {
                id: 1,
                name: 'New Project',
                slug: 'new-project',
                rootPath: '/new/path',
                description: 'Test description',
                includes: ['**/*'],
                excludes: ['**/node_modules/**'],
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const createPromise = service.createProject(mockRequest);

            const req = httpMock.expectOne('/api/projects');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(mockRequest);
            req.flush(mockProject);

            const result = await createPromise;
            expect(result).toEqual(mockProject);
        });

        it('should handle HTTP errors gracefully', async () => {
            const mockRequest = {
                name: 'New Project',
                rootPath: '/new/path'
            };

            const createPromise = service.createProject(mockRequest);

            const req = httpMock.expectOne('/api/projects');
            req.error(new ProgressEvent('error'), { status: 400, statusText: 'Bad Request' });

            await expect(createPromise).rejects.toBeDefined();
        });
    });
});
