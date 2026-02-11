import { mapJobToUIModel, mapJobsToUIModels } from './jobs.mapper';
import { Job, JobStatus } from '@orca/orchestration-types';

describe('JobsMapper', () => {
    const mockJob: Job = {
        id: '1',
        prompt: 'Test Prompt with enough text to check truncation logic which requires more characters',
        status: JobStatus.PENDING,
        assignee: 'John Doe',
        createdAt: '2026-02-10T10:00:00.000Z',
        updatedAt: '2026-02-10T11:00:00.000Z',
    };

    describe('mapJobToUIModel', () => {
        it('should map job to UI model with id and status', () => {
            const result = mapJobToUIModel(mockJob);

            expect(result.id).toBe(mockJob.id);
            expect(result.status).toBe(mockJob.status);
            expect(result.assignee).toBe(mockJob.assignee);
        });

        it('should format creation date correctly', () => {
            const result = mapJobToUIModel(mockJob);

            expect(result.formattedCreatedAt).toBe('Feb 10, 2026');
        });
    });

    describe('mapJobsToUIModels', () => {
        it('should map empty array to empty array', () => {
            const result = mapJobsToUIModels([]);

            expect(result).toEqual([]);
        });

        it('should map multiple jobs correctly', () => {
            const jobs: Job[] = [
                mockJob,
                { ...mockJob, id: '2' },
                { ...mockJob, id: '3' },
            ];

            const result = mapJobsToUIModels(jobs);

            expect(result).toHaveLength(3);
            expect(result[0].id).toBe('1');
            expect(result[1].id).toBe('2');
            expect(result[2].id).toBe('3');
        });
    });
});
