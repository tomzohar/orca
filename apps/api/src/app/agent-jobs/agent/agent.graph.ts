import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { createAgent } from 'langchain';

import { AgentState } from './agent.state';

export const createAgentGraph = (model: BaseChatModel, tools: DynamicStructuredTool[]) => {
    return createAgent({
        model,
        tools,
        stateSchema: AgentState,
        systemPrompt: 'You are a helpful software engineering agent. Use the tools provided to log your progress and save artifacts.',
    });
};
