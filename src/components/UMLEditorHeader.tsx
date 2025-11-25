import { AlertCircle, ExternalLink, File, PanelLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useSetChatActive, useSetExplainActive, useSetOptimizeActive } from "@/stores/aiFeature";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { DiagramActionsDropdown } from "./DiagramActionsDropdown";
import { Separator } from "./ui/separator";
import { UMLChatButton } from "./ai/chat/UMLChatButton";
import { UMLExtensionButton } from "./ai/UMLExtensionButton";
import { cn } from "../lib/utils";
import { useBackground } from "../hooks/useBackground";

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
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const setExplainActive = useSetExplainActive();
  const setOptimizeActive = useSetOptimizeActive();
  const setChatActive = useSetChatActive();

  function onGenerateAI({ isExplain, isOptimize }: OnGenerateProps) {
    const missingFields: string[] = [];

    if (!aiProvider || aiProvider.trim() === "") {
      missingFields.push("AI Provider");
    }
    if (!aiApiKey || aiApiKey.trim() === "") {
      missingFields.push("AI API Key");
    }
    if (!aiModel || aiModel.trim() === "") {
      missingFields.push("AI Model");
    }
    if ((aiProvider === "custom" || aiProvider === "megallm") && (!aiBaseUrl || aiBaseUrl.trim() === "")) {
      missingFields.push("AI Base URL");
    }
    if (!aiLanguage) {
      missingFields.push("AI Language");
    }

    if (missingFields.length > 0) {
      const fieldDescriptions: Record<string, string> = {
        "AI Provider": "Please select an AI provider (OpenAI, Google, Anthropic, etc.)",
        "AI API Key": "Please enter your API key to authenticate with the AI service",
        "AI Model": "Please select a model to use for generating explanations",
        "AI Base URL": "Please enter the base URL for the custom AI provider",
        "AI Language": "Please select a language for the explanation",
      };

      const details = missingFields
        .map((field) => `• ${field}: ${fieldDescriptions[field] || "Required field is missing"}`)
        .join("\n");

      setErrorMessage(
        `The following required fields are missing:\n\n${details}\n\nPlease configure these settings before using the explain feature.`
      );
      setShowErrorDialog(true);
    } else {
      onGenerate({ isExplain, isOptimize });
    }
  }

  useEffect(() => {
    if (aiError) {
      setErrorMessage(`Error generating AI feature: ${aiError.message}. Please check your API key and try again.`);
      setShowErrorDialog(true);
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
        <UMLExtensionButton
          onGenerate={() => {
            setExplainActive(true);
            setOptimizeActive(false);
            setChatActive(false);
            onGenerateAI({ isExplain: true });
          }}
          isExplain={true}
          isLoading={isAILoading}
          errorMessage={errorMessage}
          showErrorDialog={showErrorDialog}
          onShowErrorDialog={() => setShowErrorDialog(false)}
        />
        <UMLExtensionButton
          onGenerate={() => {
            setOptimizeActive(true);
            setExplainActive(false);
            setChatActive(false);
            onGenerateAI({ isOptimize: true });
          }}
          isOptimize={true}
          isLoading={isAILoading}
          errorMessage={errorMessage}
          showErrorDialog={showErrorDialog}
          onShowErrorDialog={() => setShowErrorDialog(false)}
        />
        <UMLChatButton
          errorMessage={errorMessage}
          showErrorDialog={showErrorDialog}
          onShowErrorDialog={() => setShowErrorDialog(false)}
        />
        <Separator orientation="vertical" />
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
