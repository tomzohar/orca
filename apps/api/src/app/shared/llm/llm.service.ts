import { Injectable, Logger } from '@nestjs/common';
import { LLMModels } from './llm.types';
import { ConfigService } from '@nestjs/config';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';

@Injectable()
export class LlmService {
    private readonly logger = new Logger(LlmService.name);

    constructor(private readonly config: ConfigService) { }

    getModel(): BaseChatModel {
        const provider = this.config.get<string>('LLM_PROVIDER', 'openai').toLowerCase();

        this.logger.log(`Initializing LLM with provider: ${provider}`);

        switch (provider) {
            case 'anthropic':
                return new ChatAnthropic({
                    apiKey: this.config.getOrThrow('ANTHROPIC_API_KEY'),
                    model: this.config.get('LLM_MODEL', 'claude-3-5-sonnet-20240620'),
                });

            case 'gemini':
                return new ChatGoogleGenerativeAI({
                    apiKey: this.config.get('GEMINI_API_KEY') || this.config.getOrThrow('GOOGLE_API_KEY'),
                    model: this.config.get('LLM_MODEL', LLMModels.GEMINI_FLASH_LATEST),
                });

            case 'openai':
            default:
                return new ChatOpenAI({
                    apiKey: this.config.get('OPENAI_API_KEY'),
                    configuration: {
                        baseURL: this.config.get('OPENAI_BASE_URL'),
                    },
                    model: this.config.get('LLM_MODEL', 'gpt-4o'),
                });
        }
    }
}
