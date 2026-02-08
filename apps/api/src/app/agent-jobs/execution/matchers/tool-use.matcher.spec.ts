import { Test, TestingModule } from '@nestjs/testing';
import { AgentJobEntity, AgentJobStatus } from '../../domain/entities/agent-job.entity';
import { ToolUseMatcher } from './tool-use.matcher';
import { LogMatcherContext } from './log-matcher.interface';

describe('ToolUseMatcher', () => {
    let matcher: ToolUseMatcher;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ToolUseMatcher],
        }).compile();

        matcher = module.get<ToolUseMatcher>(ToolUseMatcher);
    });

    it('should match the tool use pattern for AskUserQuestion', () => {
        const message = '[Agent] 🛠️  Tool Use (AskUserQuestion): {"question": "Are you sure?"}';
        const match = matcher.match(message);
        expect(match).toBeTruthy();
        expect(match![1]).toBe('AskUserQuestion');
        expect(match![2]).toBe('{"question": "Are you sure?"}');
    });

    it('should match other tool uses', () => {
        const message = '[Agent] 🛠️  Tool Use (save_artifact): {"filename": "test.txt"}';
        const match = matcher.match(message);
        expect(match).toBeTruthy();
        expect(match![1]).toBe('save_artifact');
    });

    it('should not match regular log lines', () => {
        const message = 'I am thinking about the next step';
        const match = matcher.match(message);
        expect(match).toBeNull();
    });

    it('should handle AskUserQuestion by updating status and context', async () => {
        const mockContext: LogMatcherContext = {
            job: { id: 1 } as AgentJobEntity,
            log: jest.fn().mockResolvedValue(undefined),
            updateStatus: jest.fn().mockResolvedValue(undefined),
            setIsWaitingForUser: jest.fn(),
        };
        const match = ['whole match', 'AskUserQuestion', 'args'] as any as RegExpMatchArray;

        await matcher.handle(mockContext, match);

        expect(mockContext.updateStatus).toHaveBeenCalledWith(AgentJobStatus.WAITING_FOR_USER);
        expect(mockContext.setIsWaitingForUser).toHaveBeenCalledWith(true);
    });

    it('should not update status for other tools', async () => {
        const mockContext: LogMatcherContext = {
            job: { id: 1 } as AgentJobEntity,
            log: jest.fn().mockResolvedValue(undefined),
            updateStatus: jest.fn().mockResolvedValue(undefined),
            setIsWaitingForUser: jest.fn(),
        };
        const match = ['whole match', 'other_tool', 'args'] as any as RegExpMatchArray;

        await matcher.handle(mockContext, match);

        expect(mockContext.updateStatus).not.toHaveBeenCalled();
        expect(mockContext.setIsWaitingForUser).not.toHaveBeenCalled();
    });
});
