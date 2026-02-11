import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import * as child_process from 'child_process';
import * as fs from 'fs';
import {
  AgentJobEntity,
  AgentJobStatus,
  AgentType,
} from '../../domain/entities/agent-job.entity';
import {
  AGENT_JOBS_REPOSITORY,
  IAgentJobsRepository,
} from '../../domain/interfaces/agent-jobs.repository.interface';
import { DockerAgentRunner } from './docker-agent-runner';

jest.mock('child_process');
jest.mock('fs');

describe('DockerAgentRunner', () => {
  let runner: DockerAgentRunner;
  let repository: jest.Mocked<IAgentJobsRepository>;
  let eventEmitter: EventEmitter2;

  const mockJob = new AgentJobEntity({
    id: 1,
    prompt: 'test prompt',
    status: AgentJobStatus.PENDING,
    type: AgentType.CLAUDE_SDK,
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DockerAgentRunner,
        { provide: AGENT_JOBS_REPOSITORY, useValue: mockRepo },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('sk-ant-test-key'),
            getOrThrow: jest.fn().mockReturnValue('sk-ant-test-key'),
          },
        },
      ],
    }).compile();

    runner = module.get<DockerAgentRunner>(DockerAgentRunner);
    repository = module.get(AGENT_JOBS_REPOSITORY);
    eventEmitter = module.get(EventEmitter2);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(runner).toBeDefined();
  });

  it('should run a docker job successfully', async () => {
    const mockProcess: any = {
      stdout: { on: jest.fn() },
      stderr: { on: jest.fn() },
      on: jest.fn().mockImplementation((event, cb) => {
        if (event === 'close') cb(0);
      }),
    };
    (child_process.spawn as jest.Mock).mockReturnValue(mockProcess);
    (fs.watch as jest.Mock).mockReturnValue({ close: jest.fn() });
    (fs.existsSync as jest.Mock).mockReturnValue(true);

    await runner.run(mockJob);

    expect(child_process.spawn).toHaveBeenCalledWith(
      'docker',
      expect.arrayContaining(['run', 'orca-agent:latest']),
    );
    expect(repository.update).toHaveBeenCalledWith(1, {
      status: AgentJobStatus.RUNNING,
    });
    expect(repository.update).toHaveBeenCalledWith(1, {
      status: AgentJobStatus.COMPLETED,
    });
  });

  it('should handle container failure', async () => {
    const mockProcess: any = {
      stdout: { on: jest.fn() },
      stderr: { on: jest.fn() },
      on: jest.fn().mockImplementation((event, cb) => {
        if (event === 'close') cb(1);
      }),
    };
    (child_process.spawn as jest.Mock).mockReturnValue(mockProcess);
    (fs.watch as jest.Mock).mockReturnValue({ close: jest.fn() });

    await runner.run(mockJob);

    expect(repository.update).toHaveBeenCalledWith(1, {
      status: AgentJobStatus.FAILED,
    });
  });

  it('should fail job when ANTHROPIC_API_KEY is missing', async () => {
    const configService = { get: jest.fn().mockReturnValue(undefined) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DockerAgentRunner,
        { provide: AGENT_JOBS_REPOSITORY, useValue: repository },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    const runnerWithNoKey = module.get<DockerAgentRunner>(DockerAgentRunner);
    await runnerWithNoKey.run(mockJob);

    expect(child_process.spawn).not.toHaveBeenCalled();
    expect(repository.addLog).toHaveBeenCalledWith(
      1,
      expect.stringContaining('Missing or invalid ANTHROPIC_API_KEY'),
    );
    expect(repository.update).toHaveBeenCalledWith(1, {
      status: AgentJobStatus.FAILED,
    });
  });

  it('should fail job when ANTHROPIC_API_KEY has invalid format', async () => {
    const configService = { get: jest.fn().mockReturnValue('not-a-valid-key') };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DockerAgentRunner,
        { provide: AGENT_JOBS_REPOSITORY, useValue: repository },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    const runnerWithBadKey = module.get<DockerAgentRunner>(DockerAgentRunner);
    await runnerWithBadKey.run(mockJob);

    expect(child_process.spawn).not.toHaveBeenCalled();
    expect(repository.addLog).toHaveBeenCalledWith(
      1,
      expect.stringContaining('Missing or invalid ANTHROPIC_API_KEY'),
    );
    expect(repository.update).toHaveBeenCalledWith(1, {
      status: AgentJobStatus.FAILED,
    });
  });
});
