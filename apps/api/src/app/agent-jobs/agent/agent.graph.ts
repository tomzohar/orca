import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { createAgent } from 'langchain';

import { AgentState } from './agent.state';

/**
 * Generates a dynamic system prompt based on available tools.
 * This ensures the prompt always reflects the current tool set without manual updates.
 */
const buildSystemPrompt = (tools: DynamicStructuredTool[]): string => {
  const baseInstructions = `You are an expert software engineering agent designed to assist with code development, file management, and project analysis tasks.

Your primary responsibilities:
- Read, analyze, and understand codebases
- Create, modify, and manage project files
- Search for files and patterns efficiently
- Provide clear, actionable responses
- Work autonomously within the project boundaries`;

  // Build tool descriptions dynamically from the tools array
  const toolDescriptions = tools
    .map((tool) => `- ${tool.name}: ${tool.description}`)
    .join('\n');

  const workInstructions = `Best practices:
1. Always verify file paths before operations
2. Use BULK operations to minimize tool calls:
   - Use 'read_multiple' instead of multiple 'read' calls
   - Use 'tree' to understand directory structure in one call
   - Use 'git_diff' to see what changed instead of exploring manually
   - Use 'read_matching' to read all files matching a pattern at once
3. Use the most efficient tool for each task (e.g., use 'find' for pattern searches, not recursive listing)
4. Keep responses concise and focused on the task
5. When writing code, follow best practices and existing project conventions
6. Always plan before you act, breakdown the task into smaller actionable testable units.

Task completion:
When you have successfully completed the requested task, provide a clear summary of what was accomplished. Do not make additional tool calls after the task is complete.`;

  return `${baseInstructions}\n\nAvailable tools:\n${toolDescriptions}\n\n${workInstructions}`;
};

export const createAgentGraph = (
  model: BaseChatModel,
  tools: DynamicStructuredTool[],
) => {
  return createAgent({
    model,
    tools,
    stateSchema: AgentState,
    systemPrompt: buildSystemPrompt(tools),
  });
};
