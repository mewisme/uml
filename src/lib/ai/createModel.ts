import { AI_PROVIDER_CONFIG } from "@/lib/ai/providers";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";

export function createAIModel(
  aiProvider: string,
  aiApiKey: string,
  aiModel: string,
  aiBaseUrl?: string
) {
  if (!aiProvider || !aiApiKey || !aiModel) {
    return null;
  }

  const baseConfig = { apiKey: aiApiKey };

  switch (aiProvider) {
    case "openai": {
      const provider = createOpenAI(baseConfig);
      return provider(aiModel);
    }
    case "google": {
      const provider = createGoogleGenerativeAI(baseConfig);
      return provider(aiModel);
    }
    case "anthropic": {
      const provider = createAnthropic(baseConfig);
      return provider(aiModel);
    }
    case "megallm":
    case "custom": {
      const customProvider = createOpenAI({
        ...baseConfig,
        baseURL: aiBaseUrl || AI_PROVIDER_CONFIG[aiProvider as "megallm" | "custom"].baseUrl,
      });
      return customProvider(aiModel);
    }
    default:
      throw new Error(`Unsupported AI provider: ${aiProvider}`);
  }
}
