import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { IAgentJobsRepository } from '../../domain/interfaces/agent-jobs.repository.interface';

export const createLogTool = (
  jobId: number,
  repository: IAgentJobsRepository,
  eventCallback: (msg: string) => void,
) => {
  return new DynamicStructuredTool({
    name: 'log_progress',
    description:
      'Log a progress message or thought to the system. Use this to inform the user of what you are doing.',
    schema: z.object({
      message: z.string().describe('The message to log'),
    }),
    func: async ({ message }) => {
      await repository.addLog(jobId, message);
      eventCallback(message);
      return 'Log added';
    },
  });
};
