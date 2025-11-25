
export type Language = 'en' | 'vi';

export type AIProvider = 'openai' | 'google' | 'anthropic' | 'megallm' | 'custom';

export interface AIProviderConfig {
  baseUrl?: string;
  label: string;
  models: string[];
}

export const AI_PROVIDER_CONFIG: Record<AIProvider, AIProviderConfig> = {
  openai: {
    label: 'OpenAI',
    models: [
      'gpt-5',
      'gpt-5-mini',
      'gpt-4.1',
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo'
    ],
  },
  google: {
    label: 'Google',
    models: ['gemini-2.5-pro', 'gemini-2.5-flash'],
  },
  anthropic: {
    label: 'Anthropic',
    models: [
      'claude-sonnet-4-5-20250929',
      'claude-haiku-4-5-20251001',
      'claude-opus-4-1-20250805',
    ],
  },
  megallm: {
    baseUrl: 'https://ai.megallm.io/v1',
    label: 'Megallm',
    models: [
      'gpt-5',
      'gpt-5-mini',
      'gpt-4',
      'gpt-4.1',
      'gpt-4o',
      'gpt-3.5-turbo',
      'claude-3.5-sonnet',
      'claude-sonnet-4-5-20250929',
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'deepseek-r1-distill-llama-70b',
      'llama3-8b-instruct',
      'llama3.3-70b-instruct',
      'alibaba-qwen3-32b',
      'deepseek-ai/deepseek-v3.1',
      'deepseek-ai/deepseek-v3.1-terminus',
      'glm-4.6',
      'minimaxai/minimax-m2',
      'mistralai/mistral-nemotron',
      'moonshotai/kimi-k2-instruct-0905',
      'qwen/qwen3-next-80b-a3b-instruct'
    ],
  },
  custom: {
    baseUrl: '',
    label: 'Custom',
    models: [],
  }
}


export const LS_KEY_AI_PROVIDER = "AI_PROVIDER";
export const LS_KEY_AI_API_KEY = "AI_API_KEY";
export const LS_KEY_AI_MODEL = "AI_MODEL";
export const LS_KEY_AI_BASE_URL = "AI_BASE_URL";
export const LS_KEY_AI_LANGUAGE = "AI_LANGUAGE";
export const LS_KEY_AI_STREAM_ENABLED = "AI_STREAM_ENABLED";