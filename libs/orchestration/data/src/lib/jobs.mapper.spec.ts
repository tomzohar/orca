import { mapJobToUIModel, mapJobsToUIModels } from './jobs.mapper';
import { Job, JobStatus } from '@orca/orchestration-types';

describe('JobsMapper', () => {
    const mockJob: Job = {
        id: '1',
        title: 'Test Job',
        description: 'Test Description',
        status: JobStatus.PENDING,
        priority: 'HIGH',
        assignee: 'John Doe',
        createdAt: '2026-02-10T10:00:00.000Z',
        updatedAt: '2026-02-10T11:00:00.000Z',
    };

    describe('mapJobToUIModel', () => {
        it('should map job to UI model with all properties', () => {
            const result = mapJobToUIModel(mockJob);

            expect(result.id).toBe(mockJob.id);
            expect(result.title).toBe(mockJob.title);
            expect(result.description).toBe(mockJob.description);
            expect(result.status).toBe(mockJob.status);
            expect(result.priority).toBe(mockJob.priority);
            expect(result.assignee).toBe(mockJob.assignee);
        });

        it('should format creation date correctly', () => {
            const result = mapJobToUIModel(mockJob);

            expect(result.formattedCreatedAt).toBe('Feb 10, 2026');
        });

        it('should add priority label for HIGH priority', () => {
            const result = mapJobToUIModel(mockJob);

            expect(result.priorityLabel).toBe('High Priority');
            expect(result.priorityClass).toBe('priority-high');
        });

        it('should add priority label for MEDIUM priority', () => {
            const mediumJob: Job = { ...mockJob, priority: 'MEDIUM' };
            const result = mapJobToUIModel(mediumJob);

            expect(result.priorityLabel).toBe('Medium Priority');
            expect(result.priorityClass).toBe('priority-medium');
        });

        it('should add priority label for LOW priority', () => {
            const lowJob: Job = { ...mockJob, priority: 'LOW' };
            const result = mapJobToUIModel(lowJob);

            expect(result.priorityLabel).toBe('Low Priority');
            expect(result.priorityClass).toBe('priority-low');
        });

        it('should default to MEDIUM priority if missing', () => {
            const noPriorityJob = { ...mockJob };
            delete noPriorityJob.priority;

            const result = mapJobToUIModel(noPriorityJob as Job);

            expect(result.priority).toBe('MEDIUM');
            expect(result.priorityLabel).toBe('Medium Priority');
            expect(result.priorityClass).toBe('priority-medium');
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
                { ...mockJob, id: '2', priority: 'MEDIUM' },
                { ...mockJob, id: '3', priority: 'LOW' },
            ];

            const result = mapJobsToUIModels(jobs);

            expect(result).toHaveLength(3);
            expect(result[0].priorityClass).toBe('priority-high');
            expect(result[1].priorityClass).toBe('priority-medium');
            expect(result[2].priorityClass).toBe('priority-low');
        });
    });
});
