# Mocking Best Practices

To ensure reliable and fast unit tests for the Orca project, follow these mocking best practices.

## 1. Use Interface-Based Mocking

Always mock dependencies based on their interfaces rather than concrete implementations. This ensures tests are decoupled from internal logic.

```typescript
// Good: Mocking IAgentJobsRepository
const mockRepo: jest.Mocked<IAgentJobsRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  // ...
};
```

## 2. Leverage Injection Tokens

In NestJS, use the same symbols/tokens used for DI to provide mocks in testing modules.

```typescript
const module: TestingModule = await Test.createTestingModule({
  providers: [
    {
      provide: AGENT_JOBS_REPOSITORY,
      useValue: mockRepo,
    },
  ],
}).compile();
```

## 3. Keep Mocks Stateless

Mocks should be reset between tests to prevent side effects.

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

## 4. centralized Mocks

Store frequently used mocks in `apps/api/src/test-utils/mocks` to promote reuse and consistency across the test suite.

## 5. Mocking Externals

- **Child Processes**: Use `jest.spyOn(child_process, 'spawn')` or a dedicated mock.
- **Filesystem**: Use `memfs` or mock the `fs` module to avoid real disk I/O.
- **Events**: Use a real `EventEmitter2` instance or a clean mock if only checking calls.
