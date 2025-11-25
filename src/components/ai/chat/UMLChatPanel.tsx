import { AI_PROVIDER_CONFIG, LS_KEY_AI_MODEL } from '@/lib/ai/providers';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton
} from '@/components/ui/shadcn-io/ai/conversation';
import { Message, MessageContent } from '@/components/ui/shadcn-io/ai/message';
import {
  PromptInput,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ui/shadcn-io/ai/prompt-input'
import { UIMessage, useChat } from "@ai-sdk/react";
import { useChatMessages, useCurrentChatId, useSetChatMessages, useSetCurrentChatId } from "@/stores/chat";
import { useEffect, useMemo, useRef, useState } from "react";

import { ChatMessageAction } from './ChatMessageAction';
import {
  Reasoning,
} from "@/components/ui/shadcn-io/ai/reasoning";
import { Response } from '@/components/ui/shadcn-io/ai/response';
import type { TextPart } from "ai";
import { createLocalTransport } from "@/lib/ai/transports/localTransport";
import { useAIModel } from '@/hooks/useAIModel';
import { useBackground } from "@/hooks/useBackground";
import { useIsChatActive } from "@/stores/aiFeature";

interface UMLChatPanelProps {
  onApplyChanges: (content: string) => void;
  umlCode?: string;
}

function getContentFromMessage(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) =>
      "text" in part ? part.text : ""
    )
    .join("");
}

function extractPlantUMLCode(content: string): string | null {
  const plantUMLRegex = /@startuml\s*([\s\S]*?)@enduml/gi;

  const matches = content.match(plantUMLRegex);

  if (matches && matches.length > 0) {
    const match = matches[0];
    const extracted = match.replace(/@startuml\s*/i, '').replace(/\s*@enduml/i, '').trim();
    if (extracted) {
      return `@startuml\n${extracted}\n@enduml`;
    }
  }
  const trimmedContent = content.trim();
  if (trimmedContent && !trimmedContent.toLowerCase().includes('@startuml')) {
    const plantUMLPatterns = /(participant|actor|->|-->|@startuml|@enduml|autonumber)/i;
    if (plantUMLPatterns.test(trimmedContent)) {
      return `@startuml\n${trimmedContent}\n@enduml`;
    }
  }

  return null;
}


function copyToClipboard(message: UIMessage): Promise<void> {
  return navigator.clipboard.writeText(getContentFromMessage(message));
}

function ChatContent({ onApplyChanges, transport, aiProvider, aiModel }: { onApplyChanges: (content: string) => void; transport: ReturnType<typeof createLocalTransport>; aiProvider: string; aiModel: string }) {
  const { editorBackground } = useBackground();
  const isChatActive = useIsChatActive();
  const currentChatId = useCurrentChatId();
  const setCurrentChatId = useSetCurrentChatId();
  const setChatMessages = useSetChatMessages();
  const storedMessages = useChatMessages(currentChatId);

  const [isReasoning, setIsReasoning] = useState(false);

  const chatId = useMemo(() => {
    if (!isChatActive) {
      return null;
    }
    if (!currentChatId) {
      const newId = crypto.randomUUID();
      setCurrentChatId(newId);
      return newId;
    }
    return currentChatId;
  }, [currentChatId, isChatActive, setCurrentChatId]);

  const { messages, sendMessage, status, regenerate, error, setMessages } = useChat({
    id: chatId || undefined,
    transport,
    onFinish: () => {
      setIsReasoning(false);
      console.log("onFinish");
    },
    onData: () => {
      setIsReasoning(true);
      console.log("onData");
    },
  });

  const prevChatIdRef = useRef<string | null>(null);
  const hasLoadedMessagesRef = useRef<boolean>(false);

  useEffect(() => {
    if (isChatActive && chatId) {
      const chatIdChanged = prevChatIdRef.current !== chatId;

      if (chatIdChanged) {
        prevChatIdRef.current = chatId;
        hasLoadedMessagesRef.current = false;
      }

      if (storedMessages.length > 0 && !hasLoadedMessagesRef.current) {
        const currentMessagesMatch = JSON.stringify(messages) === JSON.stringify(storedMessages);
        if (!currentMessagesMatch) {
          setMessages(storedMessages);
          hasLoadedMessagesRef.current = true;
        }
      } else if (storedMessages.length === 0) {
        hasLoadedMessagesRef.current = false;
      }
    } else if (!isChatActive) {
      prevChatIdRef.current = null;
      hasLoadedMessagesRef.current = false;
    }
  }, [chatId, isChatActive, storedMessages, messages, setMessages]);

  useEffect(() => {
    if (isChatActive && chatId && messages.length > 0) {
      setChatMessages(chatId, messages);
    }
  }, [messages, isChatActive, chatId, setChatMessages]);

  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(aiModel);

  useEffect(() => {
    setSelectedModel(aiModel);
  }, [aiModel]);

  const handleModelChange = (newModel: string) => {
    if (typeof window === "undefined") return;

    try {
      const model = newModel.trim();
      if (model === "") {
        localStorage.removeItem(LS_KEY_AI_MODEL);
      } else {
        localStorage.setItem(LS_KEY_AI_MODEL, model);
      }

      window.dispatchEvent(new Event("aiSettingsChange"));
      setSelectedModel(model);
    } catch (e) {
      console.error("UMLChatPanel: failed to save AI model", e);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    sendMessage({ role: "user", parts: [{ type: "text", text: input.trim() } as TextPart] });
    setInput("");
  }

  let lastUserMessageId: string | null = null;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") {
      lastUserMessageId = messages[i].id;
      break;
    }
  }

  return (
    <div className="flex flex-col" style={{ backgroundColor: editorBackground, height: "calc(100% - 40px)" }}>
      <Conversation>
        <ConversationContent>
          {messages.map((message) => (
            <Message from={message.role} key={message.id}>
              <MessageContent>
                {message.role === 'user' && getContentFromMessage(message)}
                {message.role === 'assistant' && message.parts?.map((part, i) => {
                  if (isReasoning) {
                    return (
                      <Reasoning
                        key={`${message.id}-${i}`}
                        isStreaming={isReasoning}
                        defaultOpen={false}
                      />
                    )
                  } else return (
                    <Response key={`${message.id}-${i}`}>
                      {part.type === "text" ? part.text : ""}
                    </Response>
                  )
                })}
                {message.role === "assistant" &&
                  message.id === messages[messages.length - 1].id && messages[messages.length - 1].parts.some((part: any) => part.state === "done") && (
                    <ChatMessageAction
                      onApplyChanges={() => {
                        const messageContent = getContentFromMessage(message);
                        const extractedUML = extractPlantUMLCode(messageContent);
                        if (extractedUML) {
                          onApplyChanges(extractedUML);
                        }
                      }}
                      onCopy={() => copyToClipboard(message)}
                      onRegenerate={() => regenerate()}
                      showApplyChanges={extractPlantUMLCode(getContentFromMessage(message)) !== null}
                    />
                  )}
                {error && message.role === "user" && message.id === lastUserMessageId && (
                  <div className="mt-2 p-2 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    <div className="font-semibold">Error:</div>
                    <div>{error.message || String(error)}</div>
                  </div>
                )}
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <PromptInput onSubmit={handleSubmit} className="mt-4" style={{ background: editorBackground }}>
        <PromptInputTextarea
          value={input}
          placeholder="Say something..."
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.currentTarget.value)}
        />
        <PromptInputToolbar>
          <PromptInputTools>
            <PromptInputModelSelect
              value={selectedModel}
              onValueChange={handleModelChange}
            >
              <PromptInputModelSelectTrigger>
                <PromptInputModelSelectValue />
              </PromptInputModelSelectTrigger>
              <PromptInputModelSelectContent>
                {AI_PROVIDER_CONFIG[aiProvider as keyof typeof AI_PROVIDER_CONFIG]?.models.map((model) => (
                  <PromptInputModelSelectItem key={model} value={model}>
                    {model}
                  </PromptInputModelSelectItem>
                ))}
              </PromptInputModelSelectContent>
            </PromptInputModelSelect>
          </PromptInputTools>
          <PromptInputSubmit disabled={!input.trim()} status={status} />
        </PromptInputToolbar>
      </PromptInput>
    </div>
  );
}

export function UMLChatPanel({ onApplyChanges, umlCode }: UMLChatPanelProps) {
  const { aiProvider, aiApiKey, aiModel, aiBaseUrl, aiLanguage } = useBackground();
  const model = useAIModel(aiProvider, aiApiKey, aiModel, aiBaseUrl);

  const transport = useMemo(() => {
    if (model) {
      return createLocalTransport(model, aiLanguage, umlCode);
    }
    return null;
  }, [model, aiLanguage, umlCode]);

  if (!transport) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading model...</div>
      </div>
    );
  }

  return <ChatContent onApplyChanges={onApplyChanges} transport={transport} aiProvider={aiProvider} aiModel={aiModel} />;
};

