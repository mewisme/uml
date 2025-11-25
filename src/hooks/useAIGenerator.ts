import { AI_PROVIDER_CONFIG, Language } from "@/lib/ai/providers";
import { explainSystemPrompt, optimizeSystemPrompt } from "@/lib/ai/prompts";
import { generateText, streamText } from "ai";
import { useCallback, useState } from "react";

import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";

interface UseAIGeneratorProps {
  umlCode: string;
  language: Language;
  aiProvider: string;
  aiApiKey: string;
  aiModel: string;
  aiBaseUrl: string;
  stream?: boolean;
}

interface UseAIGeneratorResult {
  generate: ({ isExplain, isOptimize }: { isExplain?: boolean; isOptimize?: boolean }) => void;
  isLoading: boolean;
  result: string | null;
  error: Error | null;
}

export function useAIGenerator({
  umlCode,
  language,
  aiProvider,
  aiApiKey,
  aiModel,
  aiBaseUrl,
  stream = false,
}: UseAIGeneratorProps): UseAIGeneratorResult {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const getModel = useCallback(() => {
    const baseConfig = {
      apiKey: aiApiKey,
    };

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
          baseURL: aiBaseUrl || AI_PROVIDER_CONFIG[aiProvider].baseUrl,
        });
        return customProvider(aiModel);
      }
      default:
        throw new Error(`Unsupported AI provider: ${aiProvider}`);
    }
  }, [aiProvider, aiApiKey, aiModel, aiBaseUrl]);

  const generate = useCallback(({ isExplain, isOptimize }: { isExplain?: boolean; isOptimize?: boolean }): void => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    (async () => {
      try {
        const model = getModel();
        const systemPrompt = isExplain ? explainSystemPrompt(language) : isOptimize ? optimizeSystemPrompt(language) : "";

        if (stream) {
          const { textStream } = streamText({
            model,
            system: systemPrompt,
            prompt: umlCode,
          });

          let accumulatedText = "";
          for await (const textDelta of textStream) {
            accumulatedText += textDelta;
            setResult(accumulatedText);
          }
        } else {
          const { text } = await generateText({
            model,
            system: systemPrompt,
            prompt: umlCode,
          });

          setResult(text);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        const errorMessage = isExplain
          ? "Error generating explanation:"
          : isOptimize
            ? "Error optimizing diagram:"
            : "";
        console.error(errorMessage, error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [umlCode, language, getModel, stream]);

  return {
    generate,
    isLoading,
    result,
    error,
  };
}