import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { LlmService } from '../../../shared/llm/llm.service';
import {
  AgentJobEntity,
  AgentJobStatus,
  AgentType,
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
  let artifactStorage: jest.Mocked<IArtifactStorage>;
  let eventEmitter: EventEmitter2;
  let llmService: any;

  const mockJob = new AgentJobEntity({
    id: 1,
    prompt: 'test prompt',
    status: AgentJobStatus.PENDING,
    type: AgentType.FILE_SYSTEM,
    logs: [],
    artifacts: [],
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
        { provide: AGENT_JOBS_REPOSITORY, useValue: mockRepo },
        { provide: ARTIFACT_STORAGE, useValue: mockStorage },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        { provide: LlmService, useValue: mockLlm },
      ],
    }).compile();

    runner = module.get<LocalAgentRunner>(LocalAgentRunner);
    repository = module.get(AGENT_JOBS_REPOSITORY);
    artifactStorage = module.get(ARTIFACT_STORAGE);
    eventEmitter = module.get(EventEmitter2);
    llmService = module.get(LlmService);
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
});
