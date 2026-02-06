import { Test, TestingModule } from '@nestjs/testing';
import { AgentJobsService } from './agent-jobs.service';
import { AGENT_JOBS_REPOSITORY } from './repositories/agent-jobs.repository.interface';
import { AgentJobEntity, AgentJobStatus } from './entities/agent-job.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { AGENT_RUNNER } from './interfaces/agent-runner.interface';
import { JobCreatedEvent } from './events/agent-job-events';

describe('AgentJobsService', () => {
    let service: AgentJobsService;
    let repository: any;
    let eventEmitter: EventEmitter2;
    let runner: any;

    const mockRepository = {
        create: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        findAll: jest.fn(),
        addLog: jest.fn().mockResolvedValue({}),
        addArtifact: jest.fn().mockResolvedValue({}),
    };

    const mockEventEmitter = {
        emit: jest.fn(),
    };

    const mockRunner = {
        run: jest.fn().mockResolvedValue(undefined),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AgentJobsService,
                { provide: AGENT_JOBS_REPOSITORY, useValue: mockRepository },
                { provide: EventEmitter2, useValue: mockEventEmitter },
                { provide: AGENT_RUNNER, useValue: mockRunner },
            ],
        }).compile();

        service = module.get<AgentJobsService>(AgentJobsService);
        repository = module.get(AGENT_JOBS_REPOSITORY);
        eventEmitter = module.get<EventEmitter2>(EventEmitter2);
        runner = module.get(AGENT_RUNNER);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createJob', () => {
        it('should create a job with PENDING status via repository', async () => {
            const prompt = 'Test Prompt';
            const mockJob = new AgentJobEntity({
                id: 1,
                prompt,
                status: AgentJobStatus.PENDING,
                logs: [],
                artifacts: [],
                createdAt: new Date(),
                updatedAt: new Date()
            });

            mockRepository.create.mockResolvedValue(mockJob);

            const result = await service.createJob(prompt);

            expect(repository.create).toHaveBeenCalledWith({
                prompt,
                assignee: undefined,
            });
            expect(eventEmitter.emit).toHaveBeenCalledWith('agent-job.created', new JobCreatedEvent(mockJob));
            expect(runner.run).toHaveBeenCalledWith(mockJob);
            expect(result).toEqual(mockJob);
        });
    });

    describe('getJob', () => {
        it('should return a job by id', async () => {
            const mockJob = new AgentJobEntity({ id: 1, prompt: 'foo', status: AgentJobStatus.PENDING });
            mockRepository.findById.mockResolvedValue(mockJob);

            const result = await service.getJob(1);
            expect(result).toEqual(mockJob);
            expect(repository.findById).toHaveBeenCalledWith(1);
        });
    });
});
