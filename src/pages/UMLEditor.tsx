import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../components/ui/resizable";
import { UMLEditorPanel, UMLEditorPanelRef } from "../components/UMLEditorPanel";
import { useCallback, useEffect, useRef, useState } from "react";
import { useIsChatActive, useIsExplainActive, useIsOptimizeActive } from "@/stores/aiFeature";

import { Explorer } from "@/features/Explorer";
import { UMLChatPanel } from "@/components/ai/chat/UMLChatPanel";
import { UMLEditorHeader } from "../components/UMLEditorHeader";
import { UMLExtensionHeader } from "@/components/ai/UMLExtensionHeader";
import { UMLExtensionPanel } from "../components/ai/UMLExtensionPanel";
import { UMLPreviewPanel } from "../components/UMLPreviewPanel";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { findMessageLine } from "../lib/uml-parser";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { useAIGenerator } from "@/hooks/useAIGenerator";
import { useBackground } from "@/hooks/useBackground";
import { useParams } from "react-router-dom";
import { usePreviewWindow } from "../components/PreviewWindowManager";
import { useProjectStore } from "@/stores/project";
import { useUMLDiagram } from "../hooks/useUMLDiagram";

export default function UMLEditor() {
  const { umlId } = useParams();
  const projects = useProjectStore((state) => state.projects);
  const projectName = projects.find(p => p.id === umlId)?.name ?? "";
  const maxEditorSize = 100;
  const [editorSize, setEditorSize] = useState(30);

  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const editorRef = useRef<UMLEditorPanelRef>(null);
  const [errorCount, setErrorCount] = useState(0);

  const isExplainActive = useIsExplainActive();
  const isOptimizeActive = useIsOptimizeActive();
  const isChatActive = useIsChatActive();


  const [isExplorerVisible, setIsExplorerVisible] = useState(() => {
    const saved = localStorage.getItem("explorerVisible");
    return saved !== null ? saved === "true" : true;
  });
  const { aiProvider, aiApiKey, aiModel, aiBaseUrl, aiLanguage, aiStreamEnabled } = useBackground();
  const { umlCode, setUmlCode, svgContent } = useUMLDiagram({
    initialCode: "",
    filePath: currentFilePath,
  });

  const { generate: aiGenerate, isLoading: isAILoading, error: aiError, result: aiResult } = useAIGenerator({
    umlCode,
    language: aiLanguage,
    aiProvider: aiProvider,
    aiApiKey: aiApiKey,
    aiModel: aiModel,
    aiBaseUrl: aiBaseUrl,
    stream: aiStreamEnabled,
  });


  useEffect(() => {
    const lastFile = localStorage.getItem("lastOpenedFile");
    if (lastFile) {
      invoke<string>("read_file_content", { path: lastFile })
        .then((content) => {
          setCurrentFilePath(lastFile);
          setUmlCode(content);
        })
        .catch((err) => {
          console.error("Failed to load last opened file:", err);
          toast.error(`Failed to load last opened file: ${err}`);
        });
    }
  }, []);


  useEffect(() => {
    if (currentFilePath) {
      localStorage.setItem("lastOpenedFile", currentFilePath);
    }
  }, [currentFilePath]);


  useEffect(() => {
    localStorage.setItem("explorerVisible", String(isExplorerVisible));
  }, [isExplorerVisible]);

  const hasAIPanel = aiResult && (isExplainActive || isOptimizeActive);
  const editorDefaultSize = hasAIPanel ? 35 : editorSize;

  const { previewWindow, openPreviewWindow } = usePreviewWindow({
    umlCode,
    projectName: currentFilePath ? currentFilePath.split('/').pop() || projectName : projectName,
    svgContent,
    onPreviewWindowChange: (window: WebviewWindow | null) => {
      if (window) {
        setEditorSize(maxEditorSize);
      } else {
        setEditorSize(30);
      }
    },
  });

  const autoSave = (content: string) => {
    setUmlCode(content)
  }

  const handleFileSelect = useCallback(async (path: string, _content: string) => {

    try {
      const freshContent = await invoke<string>("read_file_content", { path });
      setCurrentFilePath(path);
      setUmlCode(freshContent);
    } catch (error) {
      console.error("Failed to read file:", error);
      toast.error(`Failed to read file: ${error}`);
    }
  }, [setUmlCode]);


  const handleMessageClick = useCallback((messageText: string, _from?: string, _to?: string, messageIndex?: number) => {
    if (messageIndex === undefined) {
      console.warn('No message index provided');
      return;
    }

    const lineNumber = findMessageLine(messageIndex, umlCode);

    if (lineNumber) {
      editorRef.current?.jumpToLine(lineNumber);
      console.log(`Jumping to line ${lineNumber} for message: "${messageText}" (SVG index ${messageIndex})`);
    } else {
      console.warn(`Could not find line for message at SVG index ${messageIndex}`);
    }
  }, [umlCode]);

  return (
    <div className="flex flex-col h-screen">
      { }
      <main className="uml-editor-page bg-[var(--background)] flex-1 relative">
        <ResizablePanelGroup
          direction="horizontal"
          style={{ width: "100vw", height: "calc(100vh - 29px)" }}
        >
          {isExplorerVisible && (
            <>
              <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                <div className="h-full border-r bg-muted/10">
                  <Explorer
                    onFileSelect={handleFileSelect}
                    selectedPath={currentFilePath}
                    isExplorerVisible={isExplorerVisible}
                    onToggleExplorer={() => setIsExplorerVisible(!isExplorerVisible)}
                  />
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}
          <ResizablePanel defaultSize={editorDefaultSize} minSize={30}>
            <div className="flex flex-col h-full">
              <UMLEditorHeader
                projectName={projectName}
                umlCode={umlCode}
                currentFilePath={currentFilePath}
                isExplorerVisible={isExplorerVisible}
                errorCount={errorCount}
                onToggleExplorer={() => setIsExplorerVisible(!isExplorerVisible)}
                onOpenPreview={openPreviewWindow}
                onGenerate={aiGenerate}
                isAILoading={isAILoading}
                aiError={aiError}
              />
              <UMLEditorPanel
                ref={editorRef}
                umlCode={umlCode}
                onChange={(value) => autoSave(value)}
                onErrorCountChange={setErrorCount}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          {
            isChatActive ? (
              <ResizablePanel defaultSize={maxEditorSize - editorSize} minSize={30}>
                <div className="flex flex-col h-full">
                  <UMLExtensionHeader />
                  <UMLChatPanel onApplyChanges={(content: string) => setUmlCode(content)} umlCode={umlCode} />
                </div>
              </ResizablePanel>
            ) :
              hasAIPanel ? (
                <>
                  <ResizablePanel defaultSize={maxEditorSize - editorSize} minSize={30}>
                    <div className="flex flex-col h-full">
                      <UMLExtensionHeader onApplyOptimize={() => setUmlCode(aiResult || "")} />
                      <UMLExtensionPanel result={aiResult} />
                    </div>
                  </ResizablePanel>
                </>
              ) : (
                <ResizablePanel
                  defaultSize={maxEditorSize - editorSize}
                  minSize={30}
                >
                  <UMLPreviewPanel
                    svgContent={svgContent}
                    hidden={!!previewWindow}
                    onMessageClick={handleMessageClick}
                  />
                </ResizablePanel>
              )}
        </ResizablePanelGroup>
      </main>
    </div>
  );
}
