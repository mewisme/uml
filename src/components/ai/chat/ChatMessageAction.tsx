import { Action, Actions } from "@/components/ui/shadcn-io/ai/actions";
import { CheckIcon, CopyCheckIcon, CopyIcon, RefreshCcwIcon } from "lucide-react";

import { useState } from "react";

interface ChatMessageActionProps {
  onApplyChanges: () => void;
  onCopy: () => void;
  onRegenerate: () => void;
  showApplyChanges?: boolean;
}

export function ChatMessageAction({ onApplyChanges, onCopy, onRegenerate, showApplyChanges = false }: ChatMessageActionProps) {
  const [isCopied, setIsCopied] = useState(false);

  function handleCopy() {
    onCopy();
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  return (
    <Actions className="mt-2">
      <Action onClick={onRegenerate} label="Retry">
        <RefreshCcwIcon className="size-4" />
      </Action>
      <Action
        onClick={handleCopy}
        label="Copy"
        title={isCopied ? "Copied to clipboard" : "Copy to clipboard"}
      >
        {isCopied ? <CopyCheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
      </Action>
      {showApplyChanges && (
        <Action onClick={onApplyChanges} label="Apply Changes">
          <CheckIcon className="size-4" />
        </Action>
      )}
    </Actions>
  );
}