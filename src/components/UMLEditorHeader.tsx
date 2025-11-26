import { AlertCircle, ExternalLink, File, PanelLeft } from "lucide-react";

import { AIActionsDropdown } from "./ai/AIActionsDropdown";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { DiagramActionsDropdown } from "./DiagramActionsDropdown";
import { cn } from "../lib/utils";
import { toast } from "sonner";
import { useBackground } from "../hooks/useBackground";
import { useEffect } from "react";

interface UMLEditorHeaderProps {
  projectName: string;
  umlCode: string;
  currentFilePath: string | null;
  isExplorerVisible: boolean;
  errorCount?: number;
  onToggleExplorer: () => void;
  onOpenPreview: () => void;
  onGenerate: (props: OnGenerateProps) => void;
  isAILoading: boolean;
  aiError: Error | null;
}

interface OnGenerateProps {
  isExplain?: boolean;
  isOptimize?: boolean;
}

export function UMLEditorHeader({
  projectName,
  umlCode,
  currentFilePath,
  isExplorerVisible,
  errorCount = 0,
  onToggleExplorer,
  onOpenPreview,
  onGenerate,
  isAILoading,
  aiError,
}: UMLEditorHeaderProps) {
  const { editorBackground, aiProvider, aiApiKey, aiModel, aiBaseUrl, aiLanguage } = useBackground();

  function onGenerateAI({ isExplain, isOptimize }: OnGenerateProps) {

    if (
      !aiProvider || aiProvider.trim() === ""
      || !aiApiKey || aiApiKey.trim() === ""
      || !aiModel || aiModel.trim() === ""
      || ((aiProvider === "custom" || aiProvider === "megallm") && (!aiBaseUrl || aiBaseUrl.trim() === ""))
      || !aiLanguage
    ) {
      toast.error("AI Settings Required", {
        description: "Please go to Settings and fill all required AI fields to use this feature.",
      });
      return;
    }

    onGenerate({ isExplain, isOptimize });
  }

  useEffect(() => {
    if (aiError) {
      const message = `Error generating AI feature: ${aiError.message}. Please check your API key and try again.`;
      toast.error("Error Generating AI Feature", {
        description: message,
      });
    }
  }, [aiError]);


  const filename = currentFilePath
    ? currentFilePath.split(/[/\\]/).pop()
    : "No file selected";

  return (
    <div className={cn("flex items-center gap-2 px-3 py-2 justify-between border-b")}
      style={{
        backgroundColor: editorBackground
      }} >
      { }
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {isExplorerVisible ? (
          <File size={14} className="opacity-70" />
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 -ml-1"
            onClick={onToggleExplorer}
            title="Show Explorer"
          >
            <PanelLeft size={14} />
          </Button>
        )}
        <span className="font-medium">{filename}</span>

        { }
        {errorCount > 0 && (
          <Badge variant="destructive" className="h-5 px-1.5 text-xs flex items-center gap-1">
            <AlertCircle size={12} />
            {errorCount}
          </Badge>
        )}
      </div>

      { }
      <div className="flex items-center gap-1">
        <AIActionsDropdown
          onGenerateAI={onGenerateAI}
          isAILoading={isAILoading}
        />

        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onOpenPreview}
          title="Open in new window"
        >
          <ExternalLink size={14} />
        </Button>
        <DiagramActionsDropdown
          umlCode={umlCode}
          projectName={projectName}
        />
      </div>
    </div>
  );
}
