import { createLogTool } from './log-progress.tool';
import { IAgentJobsRepository } from '../../repositories/agent-jobs.repository.interface';

describe('createLogTool', () => {
    let mockRepository: jest.Mocked<IAgentJobsRepository>;
    let mockEventCallback: jest.Mock;
    const jobId = 123;

    beforeEach(() => {
        mockRepository = {
            addLog: jest.fn(),
        } as any;
        mockEventCallback = jest.fn();
    });

    it('should be defined', () => {
        const tool = createLogTool(jobId, mockRepository, mockEventCallback);
        expect(tool).toBeDefined();
        expect(tool.name).toBe('log_progress');
    });

    it('should log message and call event callback', async () => {
        const message = 'Processing...';

        const tool = createLogTool(jobId, mockRepository, mockEventCallback);
        const result = await tool.func({ message });

        expect(mockRepository.addLog).toHaveBeenCalledWith(jobId, message);
        expect(mockEventCallback).toHaveBeenCalledWith(message);
        expect(result).toBe('Log added');
    });
});
