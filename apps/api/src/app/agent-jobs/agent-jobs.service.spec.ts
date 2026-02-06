import { Test, TestingModule } from '@nestjs/testing';
import { AgentJobsService } from './agent-jobs.service';
import { AGENT_JOBS_REPOSITORY } from './repositories/agent-jobs.repository.interface';
import { AgentJobEntity, AgentJobStatus } from './entities/agent-job.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('AgentJobsService', () => {
    let service: AgentJobsService;
    let repository: any;
    let eventEmitter: EventEmitter2;

    const mockRepository = {
        create: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        findAll: jest.fn(),
    };

    const mockEventEmitter = {
        emit: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AgentJobsService,
                { provide: AGENT_JOBS_REPOSITORY, useValue: mockRepository },
                { provide: EventEmitter2, useValue: mockEventEmitter },
            ],
        }).compile();

        service = module.get<AgentJobsService>(AgentJobsService);
        repository = module.get(AGENT_JOBS_REPOSITORY);
        eventEmitter = module.get<EventEmitter2>(EventEmitter2);
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
            expect(eventEmitter.emit).toHaveBeenCalledWith('agent-job.created', mockJob);
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
