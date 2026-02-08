import { Test, TestingModule } from '@nestjs/testing';
import { AgentJobEntity, AgentJobStatus } from '../../domain/entities/agent-job.entity';
import { AskUserMatcher } from './ask-user.matcher';
import { LogMatcherContext } from './log-matcher.interface';

describe('AskUserMatcher', () => {
    let matcher: AskUserMatcher;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AskUserMatcher],
        }).compile();

        matcher = module.get<AskUserMatcher>(AskUserMatcher);
    });

    it('should match the [[ASK_USER: ...]] pattern', () => {
        const message = 'Some log [[ASK_USER: What is your name?]] more log';
        const match = matcher.match(message);
        expect(match).toBeTruthy();
        expect(match![1]).toBe('What is your name?');
    });

    it('should not match if pattern is missing', () => {
        const message = 'Regular log message';
        const match = matcher.match(message);
        expect(match).toBeNull();
    });

    it('should handle the match by updating status and context', async () => {
        const mockContext: LogMatcherContext = {
            job: { id: 1 } as AgentJobEntity,
            log: jest.fn().mockResolvedValue(undefined),
            updateStatus: jest.fn().mockResolvedValue(undefined),
            setIsWaitingForUser: jest.fn(),
        };
        const match = ['[[ASK_USER: question]]', 'question'] as RegExpMatchArray;

        await matcher.handle(mockContext, match);

        expect(mockContext.updateStatus).toHaveBeenCalledWith(AgentJobStatus.WAITING_FOR_USER);
        expect(mockContext.setIsWaitingForUser).toHaveBeenCalledWith(true);
    });
});
