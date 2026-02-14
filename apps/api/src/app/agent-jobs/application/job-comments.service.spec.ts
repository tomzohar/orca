import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';
import { JobCommentsService } from './job-comments.service';
import { AGENT_JOBS_REPOSITORY } from '../domain/interfaces/agent-jobs.repository.interface';
import { AgentJobEntity, UserType } from '../domain/entities/agent-job.entity';

describe('JobCommentsService', () => {
    let service: JobCommentsService;
    let repository: any;
    let eventEmitter: EventEmitter2;

    const mockJob = new AgentJobEntity({
        id: 1,
        prompt: 'Test Job',
    });

    const mockComment = {
        id: 1,
        jobId: 1,
        authorId: 1,
        author: { id: 1, name: 'User 1', type: UserType.HUMAN },
        content: 'Test comment',
        createdAt: new Date(),
    };

    beforeEach(async () => {
        repository = {
            findById: jest.fn(),
            addComment: jest.fn(),
            getComments: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JobCommentsService,
                {
                    provide: AGENT_JOBS_REPOSITORY,
                    useValue: repository,
                },
                {
                    provide: EventEmitter2,
                    useValue: {
                        emit: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<JobCommentsService>(JobCommentsService);
        eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('addComment', () => {
        it('should add a comment and emit an event', async () => {
            repository.findById.mockResolvedValue(mockJob);
            repository.addComment.mockResolvedValue(mockComment);

            const result = await service.addComment(1, 1, 'Test comment');

            expect(result).toEqual(mockComment);
            expect(repository.findById).toHaveBeenCalledWith(1);
            expect(repository.addComment).toHaveBeenCalledWith(1, {
                authorId: 1,
                content: 'Test comment',
                metadata: undefined,
            });
            expect(eventEmitter.emit).toHaveBeenCalledWith(
                'agent-job.comment-added',
                expect.anything(),
            );
        });

        it('should throw NotFoundException if job does not exist', async () => {
            repository.findById.mockResolvedValue(null);

            await expect(service.addComment(1, 1, 'Test comment')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('getComments', () => {
        it('should return comments for a job', async () => {
            repository.findById.mockResolvedValue(mockJob);
            repository.getComments.mockResolvedValue([mockComment]);

            const result = await service.getComments(1);

            expect(result).toEqual([mockComment]);
            expect(repository.getComments).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException if job does not exist', async () => {
            repository.findById.mockResolvedValue(null);

            await expect(service.getComments(1)).rejects.toThrow(NotFoundException);
        });
    });
});
