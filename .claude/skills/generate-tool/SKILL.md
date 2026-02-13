# Generate Tool Skill

Use this skill when creating new agent tools for the Orca Tool Registry system.

## Tool Registry Overview

Orca uses a centralized Tool Registry (`ToolRegistryService`) that manages all agent capabilities with:
- **Conditional Activation**: Tools only available when requirements are met
- **Dependency Injection**: Repository and storage automatically injected
- **Category Organization**: CORE, FILESYSTEM, ORCHESTRATION, COMMUNICATION
- **Factory Pattern**: Declarative tool definitions with metadata and activation logic

## Tool Creation Checklist

- [ ] Define tool purpose and requirements
- [ ] Choose appropriate tool category
- [ ] Implement tool creation function
- [ ] Create ToolFactory with metadata and activation logic
- [ ] Add comprehensive tests
- [ ] Register tool in AgentJobsModule
- [ ] Update documentation

## Step-by-Step Guide

### 1. Choose Tool Category

```typescript
enum ToolCategory {
  CORE = 'core',              // Always available (logging, artifacts)
  FILESYSTEM = 'filesystem',  // Project file operations
  ORCHESTRATION = 'orchestration', // Job spawning, coordination
  COMMUNICATION = 'communication', // Comments, messages
}
```

**Guidelines:**
- CORE: Essential tools needed by all jobs (logging, artifact saving)
- FILESYSTEM: Tools that interact with project files (requires project context)
- ORCHESTRATION: Tools for multi-agent coordination (requires specific task types)
- COMMUNICATION: Tools for agent/human interaction (comments, questions)

### 2. Create Tool File

**Location:** `apps/api/src/app/agent-jobs/agent/tools/your-tool.tool.ts`

**Template:**

```typescript
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { ToolFactory, ToolCategory, ToolContext } from '../../registry/tool-registry.service';
import type { IAgentJobsRepository } from '../../domain/interfaces/agent-jobs.repository.interface';
// Import other dependencies as needed

/**
 * Create the actual tool implementation
 * This function maintains backward compatibility and can be used standalone
 */
export const createYourTool = (
  jobId: number,
  repository: IAgentJobsRepository,
  // Add other dependencies
  eventCallback?: (data: any) => void,
) => {
  return new DynamicStructuredTool({
    name: 'your_tool_name',
    description: 'Clear description of what this tool does and when to use it',
    schema: z.object({
      param1: z.string().describe('Description of parameter 1'),
      param2: z.number().optional().describe('Optional parameter 2'),
      // Define all parameters with zod schema
    }),
    func: async ({ param1, param2 }) => {
      try {
        // Implement tool logic here
        const result = await someOperation(param1, param2);

        // Trigger event callback if provided
        if (eventCallback) {
          eventCallback(result);
        }

        return `Success: ${result}`;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `Error: ${errorMessage}`;
      }
    },
  });
};

/**
 * Factory for Tool Registry
 * Defines metadata, requirements, and activation logic
 */
export const yourToolFactory: ToolFactory = {
  metadata: {
    name: 'your_tool_name',
    description: 'Brief description for registry',
    category: ToolCategory.APPROPRIATE_CATEGORY,
    requirements: {
      projectRequired: false,      // Set true if tool needs project context
      repositoryRequired: true,    // Set true if tool needs database access
      storageRequired: false,      // Set true if tool needs artifact storage
    },
  },

  /**
   * Activation predicate - determines if tool should be available
   * Return true to activate, false to skip
   */
  canActivate: (context: ToolContext) => {
    // Example: Only for orchestrator jobs
    // return context.job?.taskType === TaskType.ORCHESTRATOR;

    // Example: Only when project exists
    // return !!context.projectRootPath;

    // Example: Always available
    return true;
  },

  /**
   * Create tool instance with proper context
   */
  create: (context: ToolContext) => {
    // Validate required context (optional but recommended)
    if (!context.repository) {
      throw new Error('Repository is required for your_tool_name');
    }

    return createYourTool(
      context.jobId,
      context.repository,
      // Map context to tool parameters
      context.eventCallbacks.onLog, // or other callback
    );
  },
};
```

### 3. Add to Index File

**Location:** `apps/api/src/app/agent-jobs/agent/tools/index.ts`

```typescript
export { yourToolFactory } from './your-tool.tool';
```

### 4. Register in Module

**Location:** `apps/api/src/app/agent-jobs/agent-jobs.module.ts`

```typescript
import {
  // ... existing imports
  yourToolFactory,
} from './agent/tools';

export class AgentJobsModule implements OnModuleInit {
  constructor(private readonly toolRegistry: ToolRegistryService) {}

  onModuleInit(): void {
    // ... existing registrations

    // Register your tool
    this.toolRegistry.register(yourToolFactory);
  }
}
```

### 5. Request Tool in Runner (Optional)

If your tool should be available for specific job types, update `LocalAgentRunner.getRequestedTools()`:

**Location:** `apps/api/src/app/agent-jobs/execution/services/local-agent-runner.ts`

```typescript
private getRequestedTools(job: AgentJobEntity): string[] {
  const baseTools = [
    'log_progress',
    'save_artifact',
    'post_comment',
    'read_comments',
  ];

  if (job.projectId) {
    baseTools.push('file_system');
  }

  if (job.taskType === TaskType.ORCHESTRATOR) {
    baseTools.push('spawn_job');
    // Add your orchestration tool
    baseTools.push('your_tool_name');
  }

  // Add your tool conditionally
  // if (someCondition) {
  //   baseTools.push('your_tool_name');
  // }

  return baseTools;
}
```

**Note:** If your tool uses `canActivate()` and is always requested, you can skip this step. The registry will automatically skip it when conditions aren't met.

### 6. Create Tests

**Location:** `apps/api/src/app/agent-jobs/agent/tools/your-tool.tool.spec.ts`

**Template:**

```typescript
import { createYourTool, yourToolFactory } from './your-tool.tool';
import { ToolContext, ToolCategory } from '../../registry/tool-registry.service';
import { TaskType } from '../../domain/entities/agent-job.entity';

describe('Your Tool', () => {
  let mockRepository: any;
  let mockCallback: jest.Mock;

  beforeEach(() => {
    mockRepository = {
      someMethod: jest.fn().mockResolvedValue({ id: 1 }),
    };
    mockCallback = jest.fn();
  });

  describe('createYourTool', () => {
    it('should create a tool with correct name', () => {
      const tool = createYourTool(1, mockRepository, mockCallback);
      expect(tool.name).toBe('your_tool_name');
    });

    it('should execute successfully with valid input', async () => {
      const tool = createYourTool(1, mockRepository, mockCallback);
      const result = await tool.func({ param1: 'test' });

      expect(result).toContain('Success');
      expect(mockRepository.someMethod).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockRepository.someMethod.mockRejectedValue(new Error('Test error'));
      const tool = createYourTool(1, mockRepository, mockCallback);
      const result = await tool.func({ param1: 'test' });

      expect(result).toContain('Error');
    });
  });

  describe('yourToolFactory', () => {
    it('should have correct metadata', () => {
      expect(yourToolFactory.metadata.name).toBe('your_tool_name');
      expect(yourToolFactory.metadata.category).toBe(ToolCategory.APPROPRIATE_CATEGORY);
    });

    it('should activate when conditions are met', () => {
      const context: ToolContext = {
        jobId: 1,
        job: { taskType: TaskType.ORCHESTRATOR } as any,
        repository: mockRepository,
        artifactStorage: {} as any,
        eventCallbacks: {
          onLog: jest.fn(),
          onArtifact: jest.fn(),
          onComment: jest.fn(),
        },
      };

      const canActivate = yourToolFactory.canActivate?.(context);
      expect(canActivate).toBe(true); // Or false, depending on your logic
    });

    it('should not activate when conditions are not met', () => {
      const context: ToolContext = {
        jobId: 1,
        // Missing required context
        repository: mockRepository,
        artifactStorage: {} as any,
        eventCallbacks: {
          onLog: jest.fn(),
          onArtifact: jest.fn(),
          onComment: jest.fn(),
        },
      };

      const canActivate = yourToolFactory.canActivate?.(context);
      expect(canActivate).toBe(false);
    });

    it('should create tool with proper context', () => {
      const context: ToolContext = {
        jobId: 1,
        repository: mockRepository,
        artifactStorage: {} as any,
        eventCallbacks: {
          onLog: jest.fn(),
          onArtifact: jest.fn(),
          onComment: jest.fn(),
        },
      };

      const tool = yourToolFactory.create(context);
      expect(tool.name).toBe('your_tool_name');
    });
  });
});
```

## Real-World Examples

### Example 1: Simple Core Tool (Always Available)

```typescript
export const exampleCoreToolFactory: ToolFactory = {
  metadata: {
    name: 'example_core',
    description: 'A simple core tool',
    category: ToolCategory.CORE,
    requirements: { repositoryRequired: true },
  },
  // No canActivate - always available
  create: (context: ToolContext) => {
    return createExampleCoreTool(context.jobId, context.repository);
  },
};
```

### Example 2: Conditional Filesystem Tool

```typescript
export const advancedFileToolFactory: ToolFactory = {
  metadata: {
    name: 'advanced_file_operation',
    description: 'Advanced file operations',
    category: ToolCategory.FILESYSTEM,
    requirements: {
      projectRequired: true,
      storageRequired: true
    },
  },
  canActivate: (context: ToolContext) => {
    // Only activate if project exists AND it's a coding job
    return !!context.projectRootPath &&
           context.job?.taskType === TaskType.CODING;
  },
  create: (context: ToolContext) => {
    if (!context.projectRootPath) {
      throw new Error('Project root path required');
    }
    return createAdvancedFileTool(
      context.projectRootPath,
      context.jobId,
      context.artifactStorage,
    );
  },
};
```

### Example 3: Orchestration Tool with Child Job Management

```typescript
export const collectResultsToolFactory: ToolFactory = {
  metadata: {
    name: 'collect_child_results',
    description: 'Collect and aggregate results from child jobs',
    category: ToolCategory.ORCHESTRATION,
    requirements: { repositoryRequired: true },
  },
  canActivate: (context: ToolContext) => {
    // Only for orchestrators that have child jobs
    return context.job?.taskType === TaskType.ORCHESTRATOR &&
           (context.job?.childJobs?.length ?? 0) > 0;
  },
  create: (context: ToolContext) => {
    return createCollectResultsTool(
      context.jobId,
      context.repository,
      context.eventCallbacks.onLog,
    );
  },
};
```

### Example 4: Communication Tool with User Interaction

```typescript
export const askUserToolFactory: ToolFactory = {
  metadata: {
    name: 'ask_user_question',
    description: 'Pause execution and ask user a question',
    category: ToolCategory.COMMUNICATION,
    requirements: { repositoryRequired: true },
  },
  create: (context: ToolContext) => {
    return new DynamicStructuredTool({
      name: 'ask_user_question',
      description: 'Ask the user a question and wait for response',
      schema: z.object({
        question: z.string().describe('The question to ask'),
        options: z.array(z.string()).optional().describe('Multiple choice options'),
      }),
      func: async ({ question, options }) => {
        // Update job status to WAITING_FOR_USER
        await context.repository.update(context.jobId, {
          status: AgentJobStatus.WAITING_FOR_USER,
        });

        // Post question as comment
        await context.repository.addComment(context.jobId, {
          authorId: context.job?.assignedAgentId || 0,
          content: question,
          metadata: { type: 'USER_QUESTION', options },
        });

        return 'Question posted. Job paused until user responds.';
      },
    });
  },
};
```

## Best Practices

### 1. Naming Conventions
- **Tool name**: Use snake_case (e.g., `spawn_job`, `read_comments`)
- **Factory name**: Use camelCase + `Factory` suffix (e.g., `spawnJobToolFactory`)
- **Create function**: Use camelCase + `create` prefix (e.g., `createSpawnJobTool`)

### 2. Error Handling
- Always wrap tool execution in try-catch
- Return user-friendly error messages
- Log errors for debugging but don't expose internal details
- Never throw errors from tool `func` - return error strings

### 3. Activation Logic
- Keep `canActivate()` logic simple and fast
- Check only what's necessary for the tool to function
- Don't perform expensive operations in `canActivate()`
- Return boolean only - no side effects

### 4. Context Validation
- Validate required context in `create()` method
- Throw descriptive errors if context is invalid
- Use TypeScript non-null assertions (`!`) after validation
- Document what context properties are required

### 5. Event Callbacks
- Always call event callbacks when tool performs actions
- Use appropriate callback: `onLog`, `onArtifact`, `onComment`
- Keep callback payloads consistent with domain events
- Don't assume callbacks are present - check first

### 6. Schema Definition
- Use zod for parameter validation
- Add `.describe()` to every parameter for LLM clarity
- Mark optional parameters with `.optional()`
- Use enums for restricted choices
- Keep schema simple - complex validations go in `func`

### 7. Tool Description
- Write clear, action-oriented descriptions
- Explain WHEN to use the tool, not just WHAT it does
- Include examples in description if helpful
- Keep descriptions under 200 characters

### 8. Testing
- Test both factory and creation function separately
- Test activation logic with various contexts
- Test error conditions and edge cases
- Mock all external dependencies
- Verify event callbacks are called correctly

### 9. Documentation
- Add JSDoc comments to factory and creation function
- Document expected behavior in comments
- List side effects (database writes, file operations)
- Include usage examples for complex tools

### 10. Security
- Validate all user inputs
- Never execute arbitrary code
- Scope filesystem access to project root
- Sanitize file paths to prevent directory traversal
- Don't expose sensitive information in error messages

## Common Patterns

### Pattern 1: Database Write with Event
```typescript
func: async ({ data }) => {
  const result = await repository.someMethod(jobId, data);
  if (eventCallback) {
    eventCallback(result);
  }
  return `Success: Created ${result.id}`;
}
```

### Pattern 2: Project-Scoped File Operation
```typescript
canActivate: (context) => !!context.projectRootPath,
create: (context) => {
  const safePath = path.resolve(context.projectRootPath!, relativePath);
  if (!safePath.startsWith(context.projectRootPath!)) {
    throw new Error('Path outside project root');
  }
  // ... proceed with file operation
}
```

### Pattern 3: Multi-Step Orchestration
```typescript
func: async ({ action }) => {
  // Step 1: Update job status
  await repository.update(jobId, { status: 'RUNNING' });

  // Step 2: Perform action
  const result = await performAction(action);

  // Step 3: Log progress
  await repository.addLog(jobId, `Completed ${action}`);

  // Step 4: Trigger event
  eventCallback(result);

  return `Success: ${result}`;
}
```

### Pattern 4: Conditional Tool Creation
```typescript
create: (context: ToolContext) => {
  // Adapt tool based on context
  const actions = context.projectRootPath
    ? ['read', 'write', 'delete']  // Full actions if project exists
    : ['read'];                     // Read-only otherwise

  return new DynamicStructuredTool({
    schema: z.object({
      action: z.enum(actions as [string, ...string[]]),
    }),
    // ...
  });
}
```

## Testing Checklist

- [ ] Tool factory has correct metadata (name, category, description)
- [ ] Tool factory has correct requirements specification
- [ ] Activation logic works for positive cases
- [ ] Activation logic works for negative cases
- [ ] Tool creation succeeds with valid context
- [ ] Tool creation fails gracefully with invalid context
- [ ] Tool execution succeeds with valid parameters
- [ ] Tool execution handles errors gracefully
- [ ] Event callbacks are triggered correctly
- [ ] Database operations are mocked properly
- [ ] Edge cases are covered (null, undefined, empty strings)

## Integration Testing

After creating your tool, verify it works end-to-end:

1. **Start the API server**: `npm run start:server`
2. **Create a test job** via the UI or API
3. **Monitor logs** for tool registration
4. **Execute job** and verify tool is available
5. **Check tool output** in logs and artifacts
6. **Verify events** are emitted correctly
7. **Test error conditions** with invalid inputs

## Troubleshooting

### Tool Not Available
- Check tool is registered in `AgentJobsModule.onModuleInit()`
- Verify `canActivate()` returns true for your job context
- Check tool name matches in factory and runner
- Look for activation warnings in server logs

### Tool Creation Fails
- Verify all required context properties are present
- Check `create()` method validation logic
- Ensure dependencies are injected correctly
- Review error logs for specific failure reason

### Tool Execution Fails
- Validate input parameters match schema
- Check database connection is available
- Verify file paths are within project root
- Review tool `func` error handling

### Tests Failing
- Ensure all dependencies are mocked
- Check context object has required properties
- Verify mock return values match expectations
- Review test assertions for correctness

## Additional Resources

- **Architecture Docs**: `docs/architecture.md` - Section 1.8 (Tool Registry Architecture)
- **Implementation Guide**: `docs/tool-registry-implementation.md`
- **Existing Tools**: `apps/api/src/app/agent-jobs/agent/tools/`
- **Registry Tests**: `apps/api/src/app/agent-jobs/registry/tool-registry.service.spec.ts`

## Quick Reference

### ToolContext Properties
```typescript
interface ToolContext {
  jobId: number;                    // Current job ID
  job?: AgentJobEntity;             // Full job entity (if available)
  projectId?: number;               // Project ID (if associated)
  projectRootPath?: string;         // Project root path (if available)
  repository: IAgentJobsRepository; // Database access
  artifactStorage: IArtifactStorage;// Artifact storage
  eventCallbacks: {
    onLog: (message: string) => void;
    onArtifact: (id: number, path: string, filename: string) => void;
    onComment: (comment: AgentJobComment) => void;
  };
}
```

### Tool Categories
- `ToolCategory.CORE` - Essential, always available
- `ToolCategory.FILESYSTEM` - Project file operations
- `ToolCategory.ORCHESTRATION` - Multi-agent coordination
- `ToolCategory.COMMUNICATION` - Agent/human interaction

### Common Activation Patterns
```typescript
// Always available
canActivate: () => true

// Requires project
canActivate: (ctx) => !!ctx.projectRootPath

// Orchestrator only
canActivate: (ctx) => ctx.job?.taskType === TaskType.ORCHESTRATOR

// Coding jobs only
canActivate: (ctx) => ctx.job?.taskType === TaskType.CODING

// Complex condition
canActivate: (ctx) =>
  !!ctx.projectRootPath &&
  ctx.job?.taskType === TaskType.CODING &&
  (ctx.job?.childJobs?.length ?? 0) === 0
```

---

**Remember:** Tools are the primary interface between agents and the system. Well-designed tools enable powerful agent capabilities while maintaining safety and reliability.
