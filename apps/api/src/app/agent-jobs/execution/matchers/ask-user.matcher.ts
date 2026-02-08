import { Injectable, Logger } from '@nestjs/common';
import { AgentJobStatus } from '../../domain/entities/agent-job.entity';
import { LogMatcher, LogMatcherContext } from './log-matcher.interface';

@Injectable()
export class AskUserMatcher implements LogMatcher {
  id = 'ask-user-pattern';
  description = 'Detects [[ASK_USER: ...]] pattern in logs';
  private readonly logger = new Logger(AskUserMatcher.name);

  match(message: string): RegExpMatchArray | null {
    return message.match(/\[\[ASK_USER: (.*)\]\]/);
  }

  async handle(
    context: LogMatcherContext,
    match: RegExpMatchArray,
  ): Promise<void> {
    const question = match[1];
    this.logger.log(`Job ${context.job.id} requesting feedback: ${question}`);
    await context.updateStatus(AgentJobStatus.WAITING_FOR_USER);
    context.setIsWaitingForUser(true);
  }
}
