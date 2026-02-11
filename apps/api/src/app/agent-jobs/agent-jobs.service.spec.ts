import { Test, TestingModule } from '@nestjs/testing';
import { AgentJobsService } from './agent-jobs.service';
import { AGENT_JOBS_REPOSITORY } from './domain/interfaces/agent-jobs.repository.interface';
import {
  AgentJobEntity,
  AgentJobStatus,
  AgentType,
} from './domain/entities/agent-job.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { AGENT_RUNNER } from './domain/interfaces/agent-runner.interface';
import { JobCreatedEvent } from './domain/events/agent-job-events';
import { ProjectsService } from '../projects/application/projects.service';

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

  const mockProjectsService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentJobsService,
        { provide: AGENT_JOBS_REPOSITORY, useValue: mockRepository },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: AGENT_RUNNER, useValue: () => mockRunner },
        { provide: ProjectsService, useValue: mockProjectsService },
      ],
    }).compile();

    service = module.get<AgentJobsService>(AgentJobsService);
    repository = module.get(AGENT_JOBS_REPOSITORY);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    runner = mockRunner;
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
        updatedAt: new Date(),
      });

      mockRepository.create.mockResolvedValue(mockJob);

      const result = await service.createJob(prompt, undefined, undefined, 1);

      expect(repository.create).toHaveBeenCalledWith({
        prompt,
        assignee: undefined,
        type: AgentType.LANGGRAPH,
        projectId: 1,
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'agent-job.created',
        new JobCreatedEvent(mockJob),
      );
      expect(runner.run).toHaveBeenCalledWith(mockJob);
      expect(result).toEqual(mockJob);
    });
  });

  describe('getJob', () => {
    it('should return a job by id', async () => {
      const mockJob = new AgentJobEntity({
        id: 1,
        prompt: 'foo',
        status: AgentJobStatus.PENDING,
      });
      mockRepository.findById.mockResolvedValue(mockJob);

      const result = await service.getJob(1);
      expect(result).toEqual(mockJob);
      expect(repository.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('getJobs', () => {
    it('should return all jobs when no filters provided', async () => {
      const mockJobs = [
        new AgentJobEntity({ id: 1, prompt: 'job1', status: AgentJobStatus.PENDING }),
        new AgentJobEntity({ id: 2, prompt: 'job2', status: AgentJobStatus.COMPLETED }),
      ];
      mockRepository.findAll.mockResolvedValue(mockJobs);

      const result = await service.getJobs();

      expect(repository.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(mockJobs);
    });

    it('should filter jobs by projectId', async () => {
      const mockJobs = [
        new AgentJobEntity({ id: 1, prompt: 'job1', status: AgentJobStatus.PENDING, projectId: 5 }),
      ];
      mockRepository.findAll.mockResolvedValue(mockJobs);

      const result = await service.getJobs(undefined, 5);

      expect(repository.findAll).toHaveBeenCalledWith({ assignee: undefined, projectId: 5 });
      expect(result).toEqual(mockJobs);
    });

    it('should filter jobs by assignee and projectId', async () => {
      const mockJobs = [
        new AgentJobEntity({ id: 1, prompt: 'job1', status: AgentJobStatus.PENDING, projectId: 5, assignee: 'alice' }),
      ];
      mockRepository.findAll.mockResolvedValue(mockJobs);

      const result = await service.getJobs('alice', 5);

      expect(repository.findAll).toHaveBeenCalledWith({ assignee: 'alice', projectId: 5 });
      expect(result).toEqual(mockJobs);
    });
  });
});
