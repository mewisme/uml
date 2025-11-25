import {
  streamText,
  convertToModelMessages,
  type ChatTransport,
  type UIMessage,
} from "ai";
import { createAIModel } from "@/lib/ai/createModel";
import { chatSystemPrompt } from "@/lib/ai/prompts";
import type { Language } from "@/lib/ai/providers";

export function createLocalTransport(
  model: ReturnType<typeof createAIModel>,
  language: Language = "en",
  umlCode?: string
): ChatTransport<UIMessage> {
  return {
    async sendMessages({ messages, abortSignal }) {
      if (!model) {
        throw new Error("Failed to create AI model");
      }

      const systemPrompt = chatSystemPrompt(language, umlCode);

      const result = streamText({
        model,
        system: systemPrompt,
        messages: convertToModelMessages(messages),
        abortSignal,
      });


      const responseId = crypto.randomUUID();


      return new ReadableStream({
        async start(controller) {
          try {

            controller.enqueue({
              type: "text-start" as const,
              id: responseId,
            });

            for await (const textDelta of result.textStream) {

              controller.enqueue({
                type: "text-delta" as const,
                delta: textDelta,
                id: responseId,
              });


              if (abortSignal?.aborted) {
                controller.close();
                return;
              }
            }


            controller.enqueue({
              type: "text-end" as const,
              id: responseId,
            });

            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });
    },
    async reconnectToStream({ chatId: _chatId }) {


      throw new Error("Reconnection is not supported for local transport");
    },
  };
}
