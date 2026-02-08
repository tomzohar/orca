import { IAgentRunner } from '../../app/agent-jobs/domain/interfaces/agent-runner.interface';

export const createAgentRunnerMock = (): jest.Mocked<IAgentRunner> => ({
    run: jest.fn().mockResolvedValue(undefined),
});
