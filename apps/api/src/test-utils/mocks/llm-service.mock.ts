import { LlmService } from '../../app/shared/llm/llm.service';

export const createLlmServiceMock = (): jest.Mocked<Partial<LlmService>> => {
    const mockModel = {
        stream: jest.fn().mockReturnValue({
            [Symbol.asyncIterator]: async function* () {
                yield { content: 'test chunk', _kp: true }; // LangGraph might expect certain chunk structure
            },
        }),
        bindTools: jest.fn().mockReturnThis(),
        _llmType: () => 'mock',
        lc_namespace: ['langchain', 'chat_models', 'mock'],
    };

    return {
        getModel: jest.fn().mockReturnValue(mockModel),
    } as any;
};
