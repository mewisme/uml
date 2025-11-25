import { createAIModel } from "@/lib/ai/createModel";
import { useMemo } from "react";

export function useAIModel(
  aiProvider: string,
  aiApiKey: string,
  aiModel: string,
  aiBaseUrl?: string
) {
  const model = useMemo(() => {
    return createAIModel(aiProvider, aiApiKey, aiModel, aiBaseUrl);
  }, [aiProvider, aiApiKey, aiModel, aiBaseUrl]);

  return model;
}
