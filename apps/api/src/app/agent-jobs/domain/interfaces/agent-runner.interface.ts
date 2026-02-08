import { AgentJobEntity } from '../entities/agent-job.entity';

export const AGENT_RUNNER = 'AGENT_RUNNER';

export interface IAgentRunner {
    run(job: AgentJobEntity): Promise<void>;
}
