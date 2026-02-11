import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { JobsService } from './jobs.service';
import { Job, JobStatus } from '@orca/orchestration-types';

describe('JobsService', () => {
    let service: JobsService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [JobsService],
        });

        service = TestBed.inject(JobsService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('getJobs', () => {
        it('should fetch jobs from correct endpoint', (done) => {
            const projectId = 'test-project-id';
            const mockJobs: Job[] = [
                {
                    id: '1',
                    title: 'Test Job',
                    status: JobStatus.PENDING,
                    priority: 'HIGH',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }
            ];

            service.getJobs(projectId).subscribe((jobs) => {
                expect(jobs).toEqual(mockJobs);
                done();
            });

            const req = httpMock.expectOne(`/api/projects/${projectId}/jobs`);
            expect(req.request.method).toBe('GET');
            req.flush(mockJobs);
        });

        it('should handle API errors', (done) => {
            const projectId = 'test-project-id';

            service.getJobs(projectId).subscribe({
                error: (error) => {
                    expect(error.status).toBe(500);
                    done();
                }
            });

            const req = httpMock.expectOne(`/api/projects/${projectId}/jobs`);
            req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
        });
    });
});
