import { Check, X } from "lucide-react";

import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useAIFeatureStore } from '@/stores/aiFeature'
import { useBackground } from "@/hooks/useBackground";
import { useEffect } from "react";

interface UMLExtensionHeaderProps {
  onApplyOptimize: () => void;
}

export function UMLExtensionHeader({ onApplyOptimize }: UMLExtensionHeaderProps) {
  const isExplainActive = useAIFeatureStore((state) => state.isExplainActive);
  const isOptimizeActive = useAIFeatureStore((state) => state.isOptimizeActive);
  const setExplainActive = useAIFeatureStore((state) => state.setExplainActive);
  const setOptimizeActive = useAIFeatureStore((state) => state.setOptimizeActive);
  const { editorBackground } = useBackground();

  useEffect(() => {
    console.log("isExplainActive", isExplainActive);
    console.log("isOptimizeActive", isOptimizeActive);
  }, [isExplainActive, isOptimizeActive]);

  return (
    <div className={cn("flex items-center gap-2 px-3 py-2 justify-end border-b")}
      style={{
        backgroundColor: editorBackground
      }} >

      {/* Actions on the right */}
      <div className="flex items-center gap-1">
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
          onClick={() => { setExplainActive(false); setOptimizeActive(false); }}
          title="Close"
        >
          <X size={14} />
        </Button>
      </div>
    </div>
  )
}