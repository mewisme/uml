import { Bot, Brain, LoaderCircle, MessageCircle, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useIsExplainActive, useIsOptimizeActive, useSetChatActive, useSetExplainActive, useSetOptimizeActive } from "@/stores/aiFeature";

import { Button } from "../ui/button";

interface OnGenerateProps {
  isExplain?: boolean;
  isOptimize?: boolean;
}

interface AIActionsDropdownProps {
  onGenerateAI: (props: OnGenerateProps) => void;
  isAILoading: boolean;
}

export function AIActionsDropdown({ onGenerateAI, isAILoading }: AIActionsDropdownProps) {
  const setExplainActive = useSetExplainActive();
  const setOptimizeActive = useSetOptimizeActive();
  const setChatActive = useSetChatActive();
  const isExplainActive = useIsExplainActive();
  const isOptimizeActive = useIsOptimizeActive();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 focus-visible:ring-0 focus-visible:ring-offset-0"
          title="AI Features"
        >
          {isAILoading && (isExplainActive || isOptimizeActive) ? (
            <LoaderCircle size={14} className="animate-spin" />
          ) : (
            <Bot size={14} />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            setExplainActive(true);
            setOptimizeActive(false);
            setChatActive(false);
            onGenerateAI({ isExplain: true });
          }}
          disabled={isAILoading}
        >
          {isAILoading && isExplainActive ? (
            <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Brain className="h-4 w-4 mr-2" />
          )}
          Explain
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            setOptimizeActive(true);
            setExplainActive(false);
            setChatActive(false);
            onGenerateAI({ isOptimize: true });
          }}
          disabled={isAILoading}
        >
          {isAILoading && isOptimizeActive ? (
            <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          Optimize
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            setChatActive(true);
            setExplainActive(false);
            setOptimizeActive(false);
          }}
          disabled={isAILoading}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Chat
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

