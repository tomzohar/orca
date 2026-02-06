import { BaseMessage } from '@langchain/core/messages';
import { Annotation } from '@langchain/langgraph';

/**
 * The structure of the state for the request.
 */
export const AgentState = Annotation.Root({
    /**
     * The messages in the conversation.
     */
    messages: Annotation<BaseMessage[]>({
        reducer: (x, y) => x.concat(y),
        default: () => [],
    }),

    /**
     * The ID of the job being executed.
     */
    jobId: Annotation<number>,
});
