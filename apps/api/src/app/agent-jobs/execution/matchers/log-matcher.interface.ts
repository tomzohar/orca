import { AgentJobEntity } from '../../domain/entities/agent-job.entity';

export interface LogMatcherContext {
  job: AgentJobEntity;
  log: (message: string) => Promise<void>;
  updateStatus: (status: string) => Promise<void>; // Using string or Enum
  setIsWaitingForUser: (value: boolean) => void;
}

export interface LogMatcher {
  id: string;
  description: string;

  /**
   * Checks if the log message matches the criteria.
   * Returns the match array if found, null otherwise.
   */
  match(message: string): RegExpMatchArray | null;

  /**
   * Handles the matched message.
   */
  handle(context: LogMatcherContext, match: RegExpMatchArray): Promise<void>;
}
