import { Test, TestingModule } from '@nestjs/testing';
import { ToolRegistryService, ToolCategory, ToolFactory, ToolContext } from './tool-registry.service';
import { AGENT_JOBS_REPOSITORY } from '../domain/interfaces/agent-jobs.repository.interface';
import { ARTIFACT_STORAGE } from '../domain/interfaces/artifact-storage.interface';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { TaskType } from '../domain/entities/agent-job.entity';

describe('ToolRegistryService', () => {
  let service: ToolRegistryService;
  let mockRepository: any;
  let mockStorage: any;

  // Mock tool factories for testing
  const mockLogToolFactory: ToolFactory = {
    metadata: {
      name: 'log_progress',
      description: 'Test log tool',
      category: ToolCategory.CORE,
      requirements: { repositoryRequired: true },
    },
    canActivate: (context: ToolContext) => !!context.repository,
    create: (context: ToolContext) => {
      return new DynamicStructuredTool({
        name: 'log_progress',
        description: 'Test log tool',
        schema: z.object({
          message: z.string(),
        }),
        func: async () => 'logged',
      });
    },
  };

  const mockFileSystemToolFactory: ToolFactory = {
    metadata: {
      name: 'file_system',
      description: 'Test file system tool',
      category: ToolCategory.FILESYSTEM,
      requirements: { projectRequired: true, storageRequired: true },
    },
    canActivate: (context: ToolContext) => {
      return !!context.projectRootPath && !!context.artifactStorage;
    },
    create: (context: ToolContext) => {
      return new DynamicStructuredTool({
        name: 'file_system',
        description: 'Test file system tool',
        schema: z.object({
          action: z.string(),
        }),
        func: async () => 'file operation',
      });
    },
  };

  const mockSpawnJobToolFactory: ToolFactory = {
    metadata: {
      name: 'spawn_job',
      description: 'Test spawn job tool',
      category: ToolCategory.ORCHESTRATION,
      requirements: { repositoryRequired: true },
    },
    canActivate: (context: ToolContext) => {
      return context.job?.taskType === TaskType.ORCHESTRATOR;
    },
    create: (context: ToolContext) => {
      return new DynamicStructuredTool({
        name: 'spawn_job',
        description: 'Test spawn job tool',
        schema: z.object({
          prompt: z.string(),
        }),
        func: async () => 'job spawned',
      });
    },
  };

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      update: jest.fn(),
      addLog: jest.fn(),
      addComment: jest.fn(),
      getComments: jest.fn(),
    };

    mockStorage = {
      store: jest.fn(),
      retrieve: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToolRegistryService,
        {
          provide: AGENT_JOBS_REPOSITORY,
          useValue: mockRepository,
        },
        {
          provide: ARTIFACT_STORAGE,
          useValue: mockStorage,
        },
      ],
    }).compile();

    service = module.get<ToolRegistryService>(ToolRegistryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a tool factory', () => {
      service.register(mockLogToolFactory);
      expect(service.getAllToolNames()).toContain('log_progress');
    });

    it('should overwrite existing tool when registering with same name', () => {
      service.register(mockLogToolFactory);
      service.register(mockLogToolFactory);
      const allTools = service.getAllToolNames();
      expect(allTools.filter(name => name === 'log_progress').length).toBe(1);
    });

    it('should register multiple tools', () => {
      service.register(mockLogToolFactory);
      service.register(mockFileSystemToolFactory);
      service.register(mockSpawnJobToolFactory);
      expect(service.getAllToolNames()).toEqual(['log_progress', 'file_system', 'spawn_job']);
    });
  });

  describe('createTools', () => {
    beforeEach(() => {
      service.register(mockLogToolFactory);
      service.register(mockFileSystemToolFactory);
      service.register(mockSpawnJobToolFactory);
    });

    it('should create tools with valid context', () => {
      const context = {
        jobId: 1,
        projectRootPath: '/test/project',
        eventCallbacks: {
          onLog: jest.fn(),
          onArtifact: jest.fn(),
          onComment: jest.fn(),
        },
      };

      const tools = service.createTools(['log_progress', 'file_system'], context);
      expect(tools).toHaveLength(2);
      expect(tools.map(t => t.name)).toEqual(['log_progress', 'file_system']);
    });

    it('should skip tools that fail activation check', () => {
      const context = {
        jobId: 1,
        // No projectRootPath - file_system should be skipped
        eventCallbacks: {
          onLog: jest.fn(),
          onArtifact: jest.fn(),
          onComment: jest.fn(),
        },
      };

      const tools = service.createTools(['log_progress', 'file_system'], context);
      expect(tools).toHaveLength(1);
      expect(tools[0].name).toBe('log_progress');
    });

    it('should skip orchestration tools for non-orchestrator jobs', () => {
      const context = {
        jobId: 1,
        job: {
          id: 1,
          taskType: TaskType.CODING,
        } as any,
        eventCallbacks: {
          onLog: jest.fn(),
          onArtifact: jest.fn(),
          onComment: jest.fn(),
        },
      };

      const tools = service.createTools(['log_progress', 'spawn_job'], context);
      expect(tools).toHaveLength(1);
      expect(tools[0].name).toBe('log_progress');
    });

    it('should include orchestration tools for orchestrator jobs', () => {
      const context = {
        jobId: 1,
        job: {
          id: 1,
          taskType: TaskType.ORCHESTRATOR,
        } as any,
        eventCallbacks: {
          onLog: jest.fn(),
          onArtifact: jest.fn(),
          onComment: jest.fn(),
        },
      };

      const tools = service.createTools(['log_progress', 'spawn_job'], context);
      expect(tools).toHaveLength(2);
      expect(tools.map(t => t.name)).toEqual(['log_progress', 'spawn_job']);
    });

    it('should handle unknown tool names gracefully', () => {
      const context = {
        jobId: 1,
        eventCallbacks: {
          onLog: jest.fn(),
          onArtifact: jest.fn(),
          onComment: jest.fn(),
        },
      };

      const tools = service.createTools(['unknown_tool'], context);
      expect(tools).toHaveLength(0);
    });

    it('should inject repository and artifactStorage into context', () => {
      const createSpy = jest.spyOn(mockLogToolFactory, 'create');
      const context = {
        jobId: 1,
        eventCallbacks: {
          onLog: jest.fn(),
          onArtifact: jest.fn(),
          onComment: jest.fn(),
        },
      };

      service.createTools(['log_progress'], context);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          jobId: 1,
          repository: mockRepository,
          artifactStorage: mockStorage,
        })
      );
    });

    it('should create all requested tools when conditions are met', () => {
      const context = {
        jobId: 1,
        projectRootPath: '/test/project',
        job: {
          id: 1,
          taskType: TaskType.ORCHESTRATOR,
        } as any,
        eventCallbacks: {
          onLog: jest.fn(),
          onArtifact: jest.fn(),
          onComment: jest.fn(),
        },
      };

      const tools = service.createTools(['log_progress', 'file_system', 'spawn_job'], context);
      expect(tools).toHaveLength(3);
    });
  });

  describe('getToolsByCategory', () => {
    beforeEach(() => {
      service.register(mockLogToolFactory);
      service.register(mockFileSystemToolFactory);
      service.register(mockSpawnJobToolFactory);
    });

    it('should filter tools by category', () => {
      const coreTools = service.getToolsByCategory(ToolCategory.CORE);
      const filesystemTools = service.getToolsByCategory(ToolCategory.FILESYSTEM);
      const orchestrationTools = service.getToolsByCategory(ToolCategory.ORCHESTRATION);

      expect(coreTools).toEqual(['log_progress']);
      expect(filesystemTools).toEqual(['file_system']);
      expect(orchestrationTools).toEqual(['spawn_job']);
    });

    it('should return empty array for category with no tools', () => {
      const communicationTools = service.getToolsByCategory(ToolCategory.COMMUNICATION);
      expect(communicationTools).toEqual([]);
    });
  });

  describe('getAllToolNames', () => {
    it('should return empty array when no tools registered', () => {
      expect(service.getAllToolNames()).toEqual([]);
    });

    it('should return all registered tool names', () => {
      service.register(mockLogToolFactory);
      service.register(mockFileSystemToolFactory);
      service.register(mockSpawnJobToolFactory);

      const allTools = service.getAllToolNames();
      expect(allTools).toHaveLength(3);
      expect(allTools).toContain('log_progress');
      expect(allTools).toContain('file_system');
      expect(allTools).toContain('spawn_job');
    });
  });
});
