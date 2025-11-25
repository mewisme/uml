import { explainSystemPrompt, optimizeSystemPrompt } from "@/lib/ai/prompts";
import { generateText, streamText } from "ai";
import { useCallback, useState } from "react";

import { Language } from "@/lib/ai/providers";
import { useAIModel } from "./useAIModel";

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

  const model = useAIModel(aiProvider, aiApiKey, aiModel, aiBaseUrl);

  const generate = useCallback(({ isExplain, isOptimize }: { isExplain?: boolean; isOptimize?: boolean }): void => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    if (!model) {
      setError(new Error("AI model not found"));
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
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
  }, [umlCode, language, model, stream]);

  return {
    generate,
    isLoading,
    result,
    error,
  };
}