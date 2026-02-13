import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { LlmService } from '../../../shared/llm/llm.service';
import {
  AgentJobEntity,
  AgentJobStatus,
  AgentType,
  TaskType,
} from '../../domain/entities/agent-job.entity';
import {
  AGENT_JOBS_REPOSITORY,
  IAgentJobsRepository,
} from '../../domain/interfaces/agent-jobs.repository.interface';
import {
  ARTIFACT_STORAGE,
  IArtifactStorage,
} from '../../domain/interfaces/artifact-storage.interface';
import { LocalAgentRunner } from './local-agent-runner';
import { createLlmServiceMock } from '../../../../test-utils/mocks/llm-service.mock';
import { ToolRegistryService } from '../../registry/tool-registry.service';

jest.mock('../../agent/agent.graph', () => ({
  createAgentGraph: jest.fn().mockReturnValue({
    stream: jest.fn().mockResolvedValue({
      [Symbol.asyncIterator]: async function* () {
        yield { content: 'done' };
      },
    }),
  }),
}));

describe('LocalAgentRunner', () => {
  let runner: LocalAgentRunner;
  let repository: jest.Mocked<IAgentJobsRepository>;
  let eventEmitter: EventEmitter2;
  let llmService: any;
  let toolRegistry: ToolRegistryService;

  const mockJob = new AgentJobEntity({
    id: 1,
    prompt: 'test prompt',
    status: AgentJobStatus.PENDING,
    type: AgentType.FILE_SYSTEM,
    taskType: TaskType.CODING,
    logs: [],
    artifacts: [],
    comments: [],
    createdById: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const mockRepo = {
      update: jest.fn().mockResolvedValue(mockJob),
      addLog: jest
        .fn()
        .mockResolvedValue({
          ...mockJob,
          logs: [{ id: 1, message: 'test log', timestamp: new Date() }],
        }),
      addArtifact: jest.fn().mockResolvedValue(mockJob),
    };

    const mockStorage = {
      store: jest.fn().mockResolvedValue({ id: 1, path: 'db://1' }),
    };

    const mockLlm = createLlmServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalAgentRunner,
        ToolRegistryService,
        { provide: AGENT_JOBS_REPOSITORY, useValue: mockRepo },
        { provide: ARTIFACT_STORAGE, useValue: mockStorage },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        { provide: LlmService, useValue: mockLlm },
      ],
    }).compile();

    runner = module.get<LocalAgentRunner>(LocalAgentRunner);
    repository = module.get(AGENT_JOBS_REPOSITORY);
    eventEmitter = module.get(EventEmitter2);
    llmService = module.get(LlmService);
    toolRegistry = module.get(ToolRegistryService);
  });

  it('should be defined', () => {
    expect(runner).toBeDefined();
  });

  it('should run a job successfully', async () => {
    await runner.run(mockJob);

    expect(repository.update).toHaveBeenCalledWith(1, {
      status: AgentJobStatus.RUNNING,
    });
    expect(repository.update).toHaveBeenCalledWith(1, {
      status: AgentJobStatus.COMPLETED,
    });
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'agent-job.status-changed',
      expect.anything(),
    );
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'agent-job.log-added',
      expect.anything(),
    );
  });

  it('should handle errors during execution', async () => {
    llmService.getModel.mockImplementationOnce(() => {
      throw new Error('LLM error');
    });

    await runner.run(mockJob);

    expect(repository.update).toHaveBeenCalledWith(1, {
      status: AgentJobStatus.FAILED,
    });
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'agent-job.status-changed',
      expect.objectContaining({
        newStatus: AgentJobStatus.FAILED,
      }),
    );
  });

  describe('Tool Registry Integration', () => {
    it('should use registry to create tools', async () => {
      const createToolsSpy = jest.spyOn(toolRegistry, 'createTools');

      await runner.run(mockJob);

      expect(createToolsSpy).toHaveBeenCalledWith(
        expect.arrayContaining(['log_progress', 'save_artifact', 'post_comment', 'read_comments']),
        expect.objectContaining({ jobId: mockJob.id })
      );
    });

    it('should request file_system tool for jobs with project', async () => {
      const jobWithProject = new AgentJobEntity({
        ...mockJob,
        projectId: 1,
        project: { rootPath: '/test/path', includes: [], excludes: [] },
      });
      const createToolsSpy = jest.spyOn(toolRegistry, 'createTools');

      await runner.run(jobWithProject);

      expect(createToolsSpy).toHaveBeenCalledWith(
        expect.arrayContaining(['file_system']),
        expect.any(Object)
      );
    });

    it('should not request file_system tool for jobs without project', async () => {
      const createToolsSpy = jest.spyOn(toolRegistry, 'createTools');

      await runner.run(mockJob);

      const calledTools = createToolsSpy.mock.calls[0][0];
      expect(calledTools).not.toContain('file_system');
    });

    it('should request spawn_job tool for orchestrator jobs', async () => {
      const orchestratorJob = new AgentJobEntity({
        ...mockJob,
        taskType: TaskType.ORCHESTRATOR,
      });
      const createToolsSpy = jest.spyOn(toolRegistry, 'createTools');

      await runner.run(orchestratorJob);

      expect(createToolsSpy).toHaveBeenCalledWith(
        expect.arrayContaining(['spawn_job']),
        expect.any(Object)
      );
    });

    it('should not request spawn_job tool for coding jobs', async () => {
      const codingJob = new AgentJobEntity({
        ...mockJob,
        taskType: TaskType.CODING,
      });
      const createToolsSpy = jest.spyOn(toolRegistry, 'createTools');

      await runner.run(codingJob);

      const calledTools = createToolsSpy.mock.calls[0][0];
      expect(calledTools).not.toContain('spawn_job');
    });

    it('should pass correct context to registry', async () => {
      const jobWithProject = new AgentJobEntity({
        ...mockJob,
        projectId: 1,
        project: { rootPath: '/test/path', includes: [], excludes: [] },
      });
      const createToolsSpy = jest.spyOn(toolRegistry, 'createTools');

      await runner.run(jobWithProject);

      expect(createToolsSpy).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          jobId: jobWithProject.id,
          job: jobWithProject,
          projectId: 1,
          projectRootPath: '/test/path',
          eventCallbacks: expect.objectContaining({
            onLog: expect.any(Function),
            onArtifact: expect.any(Function),
            onComment: expect.any(Function),
          }),
        })
      );
    });
  });
});
