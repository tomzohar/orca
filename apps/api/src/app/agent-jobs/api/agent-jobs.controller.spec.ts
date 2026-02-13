import { Test, TestingModule } from '@nestjs/testing';
import { AgentJobsController } from './agent-jobs.controller';
import { AgentJobsService } from '../agent-jobs.service';
import { JobCommentsService } from '../application/job-comments.service';
import {
  AgentJobEntity,
  AgentJobStatus,
  AgentType,
} from '../domain/entities/agent-job.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('AgentJobsController', () => {
  let controller: AgentJobsController;
  let service: AgentJobsService;

  const mockService = {
    createJob: jest.fn(),
    getJobs: jest.fn(),
    getJob: jest.fn(),
  };

  const mockCommentsService = {
    addComment: jest.fn(),
    getComments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      controllers: [AgentJobsController],
      providers: [
        { provide: AgentJobsService, useValue: mockService },
        { provide: JobCommentsService, useValue: mockCommentsService },
      ],
    }).compile();

    controller = module.get<AgentJobsController>(AgentJobsController);
    service = module.get<AgentJobsService>(AgentJobsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createJob', () => {
    it('should create a job and return it', async () => {
      const prompt = 'Test Prompt';
      const mockJob = new AgentJobEntity({
        id: 1,
        prompt,
        status: AgentJobStatus.PENDING,
      });
      mockService.createJob.mockResolvedValue(mockJob);

      const result = await controller.createJob({ prompt });

      expect(service.createJob).toHaveBeenCalledWith(
        prompt,
        undefined,
        undefined,
        AgentType.FILE_SYSTEM,
        undefined,
      );
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
      mockService.getJob.mockResolvedValue(mockJob);

      const result = await controller.getJob(1);

      expect(service.getJob).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockJob);
    });
  });

  describe('getJobs', () => {
    it('should return jobs filtered by projectId', async () => {
      const mockJobs = [
        new AgentJobEntity({ id: 1, prompt: 'job1', status: AgentJobStatus.PENDING, projectId: 5 }),
      ];
      mockService.getJobs.mockResolvedValue(mockJobs);

      const result = await controller.getJobs(undefined, undefined, 5);

      expect(service.getJobs).toHaveBeenCalledWith(undefined, undefined, 5);
      expect(result).toEqual(mockJobs);
    });
  });
});
