import { Check, MessageCircleDashed, X } from "lucide-react";
import { useIsChatActive, useIsOptimizeActive, useResetAIFeature } from '@/stores/aiFeature'

import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useBackground } from "@/hooks/useBackground";
import { useRenewChatId } from '@/stores/chat'

interface UMLExtensionHeaderProps {
  onApplyOptimize?: () => void;
}

export function UMLExtensionHeader({ onApplyOptimize = () => { } }: UMLExtensionHeaderProps) {
  const isOptimizeActive = useIsOptimizeActive();
  const isChatActive = useIsChatActive();
  const resetAIFeature = useResetAIFeature();
  const renewChatId = useRenewChatId();
  const { editorBackground } = useBackground();

  const handleClose = () => {
    resetAIFeature();
  };

  return (
    <div className={cn("flex items-center gap-2 px-3 py-2 justify-end border-b")}
      style={{
        backgroundColor: editorBackground
      }} >

      { }
      <div className="flex items-center gap-1">
        {isChatActive && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6.5 w-6.5"
            onClick={() => renewChatId()}
            title="Apply Chat"
          >
            <MessageCircleDashed size={14} />
          </Button>
        )}
        {isOptimizeActive && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6.5 w-6.5"
            onClick={onApplyOptimize}
            title="Apply Optimize"
          >
            <Check size={14} />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6.5 w-6.5"
          onClick={handleClose}
          title="Close"
        >
          <X size={14} />
        </Button>
      </div>
    </div>
  )
}