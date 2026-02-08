import { Injectable, Logger } from '@nestjs/common';
import { AgentJobStatus } from '../../domain/entities/agent-job.entity';
import { LogMatcher, LogMatcherContext } from './log-matcher.interface';

@Injectable()
export class ToolUseMatcher implements LogMatcher {
    id = 'tool-use-ask-user';
    description = 'Detects AskUserQuestion tool usage';
    private readonly logger = new Logger(ToolUseMatcher.name);

    match(message: string): RegExpMatchArray | null {
        return message.match(/\[Agent\] 🛠️\s+Tool Use \(([^)]+)\): (.*)/);
    }

    async handle(context: LogMatcherContext, match: RegExpMatchArray): Promise<void> {
        const toolName = match[1];
        if (toolName === 'AskUserQuestion') {
            this.logger.log(`Job ${context.job.id} requesting feedback via tool`);
            await context.updateStatus(AgentJobStatus.WAITING_FOR_USER);
            context.setIsWaitingForUser(true);
        }
    }
}
