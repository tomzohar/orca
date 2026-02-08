export interface LlmConfig {
  provider: 'anthropic' | 'gemini' | 'openai';
  apiKey?: string;
  model?: string;
}
